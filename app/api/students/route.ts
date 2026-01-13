import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { z } from 'zod';

const createStudentSchema = z.object({
  grade: z.enum(['초4', '초5', '초6', '중1', '중2', '중3', '고1', '고2', '고3']),
  sex: z.enum(['male', 'female']),
  nickname: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const data = createStudentSchema.parse(body);

    const student = await prisma.student.create({
      data,
    });

    return NextResponse.json(student);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    console.error('학생 생성 오류:', error);
    return NextResponse.json({ error: '학생 생성 중 오류가 발생했습니다.' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const studentId = searchParams.get('id');

    if (studentId) {
      const student = await prisma.student.findUnique({
        where: { id: studentId },
        include: {
          sessions: {
            orderBy: { measuredAt: 'desc' },
          },
        },
      });

      if (!student) {
        return NextResponse.json({ error: '학생을 찾을 수 없습니다.' }, { status: 404 });
      }

      return NextResponse.json(student);
    }

    const students = await prisma.student.findMany({
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(students);
  } catch (error) {
    console.error('학생 조회 오류:', error);
    return NextResponse.json({ error: '학생 조회 중 오류가 발생했습니다.' }, { status: 500 });
  }
}
