import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { generateResultSummary } from '@/lib/paps';
import { z } from 'zod';

const updateSessionSchema = z.object({
  heightCm: z.number().positive().optional(),
  weightKg: z.number().positive().optional(),
  metrics: z.record(z.string(), z.number()).optional(),
});

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const resolvedParams = await Promise.resolve(params);
    const sessionId = resolvedParams.id;

    // 세션 존재 확인
    const session = await prisma.measurementSession.findUnique({
      where: { id: sessionId },
      include: {
        student: true,
      },
    });

    if (!session) {
      return NextResponse.json({ error: '측정 세션을 찾을 수 없습니다.' }, { status: 404 });
    }

    const body = await request.json();
    const data = updateSessionSchema.parse(body);

    // 업데이트할 값 결정
    const heightCm = data.heightCm ?? session.heightCm;
    const weightKg = data.weightKg ?? session.weightKg;
    const existingMetrics = JSON.parse(session.metricsJson);
    const metrics = data.metrics ? { ...existingMetrics, ...data.metrics } : existingMetrics;

    // 결과 재계산
    const summary = generateResultSummary(
      session.student.grade as any,
      session.student.sex as 'male' | 'female',
      heightCm,
      weightKg,
      metrics
    );

    // 세션 업데이트 (수정 시 AI 추천 초기화)
    const updatedSession = await prisma.measurementSession.update({
      where: { id: sessionId },
      data: {
        heightCm,
        weightKg,
        bmi: summary.grades.find((g) => g.metric === 'bmi')?.value || 0,
        metricsJson: JSON.stringify(metrics),
        resultJson: JSON.stringify(summary),
        aiRecommendation: null, // 수정 시 AI 추천 초기화
      },
    });

    return NextResponse.json({
      ...updatedSession,
      metrics: JSON.parse(updatedSession.metricsJson),
      result: JSON.parse(updatedSession.resultJson),
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    console.error('세션 업데이트 오류:', error);
    return NextResponse.json({ error: '측정 세션 업데이트 중 오류가 발생했습니다.' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const resolvedParams = await Promise.resolve(params);
    const sessionId = resolvedParams.id;

    // 세션 존재 확인
    const session = await prisma.measurementSession.findUnique({
      where: { id: sessionId },
    });

    if (!session) {
      return NextResponse.json({ error: '측정 세션을 찾을 수 없습니다.' }, { status: 404 });
    }

    // 세션 삭제
    await prisma.measurementSession.delete({
      where: { id: sessionId },
    });

    return NextResponse.json({ message: '측정 세션이 삭제되었습니다.' });
  } catch (error) {
    console.error('세션 삭제 오류:', error);
    return NextResponse.json({ error: '측정 세션 삭제 중 오류가 발생했습니다.' }, { status: 500 });
  }
}
