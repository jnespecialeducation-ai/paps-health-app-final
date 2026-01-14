import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { z } from 'zod';

const updateStudentSchema = z.object({
  grade: z.enum(['초4', '초5', '초6', '중1', '중2', '중3', '고1', '고2', '고3']).optional(),
  sex: z.enum(['male', 'female']).optional(),
  nickname: z.string().nullable().optional(),
});

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const resolvedParams = await Promise.resolve(params);
    const studentId = resolvedParams.id;

    // 학생 존재 확인
    const student = await prisma.student.findUnique({
      where: { id: studentId },
    });

    if (!student) {
      return NextResponse.json({ error: '학생을 찾을 수 없습니다.' }, { status: 404 });
    }

    const body = await request.json();
    const data = updateStudentSchema.parse(body);

    // 학생 정보 업데이트
    const updatedStudent = await prisma.student.update({
      where: { id: studentId },
      data: {
        grade: data.grade,
        sex: data.sex,
        nickname: data.nickname !== undefined ? data.nickname : undefined,
      },
    });

    return NextResponse.json(updatedStudent);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    console.error('학생 수정 오류:', error);
    return NextResponse.json({ error: '학생 수정 중 오류가 발생했습니다.' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const resolvedParams = await Promise.resolve(params);
    const studentId = resolvedParams.id;

    // 학생 존재 확인
    const student = await prisma.student.findUnique({
      where: { id: studentId },
    });

    if (!student) {
      return NextResponse.json({ error: '학생을 찾을 수 없습니다.' }, { status: 404 });
    }

    // 학생 삭제 (관련 세션은 CASCADE로 자동 삭제됨)
    await prisma.student.delete({
      where: { id: studentId },
    });

    return NextResponse.json({ message: '학생이 삭제되었습니다.' });
  } catch (error) {
    console.error('학생 삭제 오류:', error);
    return NextResponse.json({ error: '학생 삭제 중 오류가 발생했습니다.' }, { status: 500 });
  }
}
