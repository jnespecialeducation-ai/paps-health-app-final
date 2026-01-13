import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

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
