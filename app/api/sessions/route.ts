import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { generateResultSummary } from '@/lib/paps';
import { z } from 'zod';

const createSessionSchema = z.object({
  studentId: z.string().uuid(),
  heightCm: z.number().positive(),
  weightKg: z.number().positive(),
  metrics: z.record(z.string(), z.number()),
  measuredAt: z.string().datetime().optional(), // 측정 날짜 (선택사항, 없으면 현재 시간 사용)
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { studentId, heightCm, weightKg, metrics, measuredAt } = createSessionSchema.parse(body);

    // 학생 정보 조회
    const student = await prisma.student.findUnique({
      where: { id: studentId },
    });

    if (!student) {
      return NextResponse.json({ error: '학생을 찾을 수 없습니다.' }, { status: 404 });
    }

    // 결과 계산
    const summary = generateResultSummary(
      student.grade as any,
      student.sex as 'male' | 'female',
      heightCm,
      weightKg,
      metrics
    );

    // 세션 저장
    const session = await prisma.measurementSession.create({
      data: {
        studentId,
        heightCm,
        weightKg,
        bmi: summary.grades.find((g) => g.metric === 'bmi')?.value || 0,
        metricsJson: JSON.stringify(metrics),
        resultJson: JSON.stringify(summary),
        measuredAt: measuredAt ? new Date(measuredAt) : new Date(), // 사용자가 선택한 날짜 또는 현재 시간
      },
    });

    return NextResponse.json({
      session,
      summary,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    console.error('세션 생성 오류:', error);
    return NextResponse.json({ error: '세션 생성 중 오류가 발생했습니다.' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const studentId = searchParams.get('studentId');
    const sessionId = searchParams.get('id');

    if (sessionId) {
      const session = await prisma.measurementSession.findUnique({
        where: { id: sessionId },
        include: {
          student: {
            select: {
              id: true,
              grade: true,
              sex: true,
              nickname: true,
            },
          },
        },
      });

      if (!session) {
        return NextResponse.json({ error: '세션을 찾을 수 없습니다.' }, { status: 404 });
      }

      return NextResponse.json({
        ...session,
        metrics: JSON.parse(session.metricsJson),
        result: JSON.parse(session.resultJson),
        student: session.student,
      });
    }

    if (studentId) {
      const sessions = await prisma.measurementSession.findMany({
        where: { studentId },
        orderBy: { measuredAt: 'desc' },
      });

      return NextResponse.json(
        sessions.map((s) => ({
          ...s,
          metrics: JSON.parse(s.metricsJson),
          result: JSON.parse(s.resultJson),
        }))
      );
    }

    return NextResponse.json({ error: 'studentId 또는 id가 필요합니다.' }, { status: 400 });
  } catch (error) {
    console.error('세션 조회 오류:', error);
    return NextResponse.json({ error: '세션 조회 중 오류가 발생했습니다.' }, { status: 500 });
  }
}
