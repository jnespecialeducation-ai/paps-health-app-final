'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { FadeIn } from '@/app/components/motion/FadeIn';
import { Stagger, StaggerItem } from '@/app/components/motion/Stagger';
import { Card } from '@/app/components/ui/Card';
import { Button } from '@/app/components/ui/Button';

interface Student {
  id: string;
  grade: string;
  sex: string;
  nickname?: string;
  createdAt: string;
}

export default function Home() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingIds, setDeletingIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      const res = await fetch('/api/students');
      if (!res.ok) {
        throw new Error('학생 목록 조회 실패');
      }
      const data = await res.json();
      // 응답이 배열인지 확인
      if (Array.isArray(data)) {
        setStudents(data);
      } else {
        console.error('예상치 못한 응답 형식:', data);
        setStudents([]);
      }
    } catch (error) {
      console.error('학생 목록 조회 실패:', error);
      setStudents([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteStudent = async (studentId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!confirm('정말 이 학생을 삭제하시겠습니까? 모든 측정 이력도 함께 삭제됩니다.')) {
      return;
    }

    setDeletingIds((prev) => new Set(prev).add(studentId));
    try {
      const res = await fetch(`/api/students/${studentId}`, {
        method: 'DELETE',
      });

      if (!res.ok) {
        throw new Error('학생 삭제 실패');
      }

      // 목록 새로고침
      fetchStudents();
    } catch (error) {
      console.error('학생 삭제 오류:', error);
      alert('학생 삭제 중 오류가 발생했습니다.');
    } finally {
      setDeletingIds((prev) => {
        const next = new Set(prev);
        next.delete(studentId);
        return next;
      });
    }
  };

  return (
    <div className="space-y-8">
      <FadeIn>
        <div className="space-y-3">
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-gradient">
            학생 건강체력, 한 번에 관리
          </h2>
          <p className="text-sm sm:text-base text-fg-muted">
            PAPS 기준 자동 등급 산출과 AI 추천으로 더 똑똑하게 코칭해요.
          </p>
        </div>
      </FadeIn>

      <Card className="p-6 sm:p-7">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
          <div>
            <h3 className="text-lg font-bold text-fg">학생 목록</h3>
            <p className="text-xs text-fg-muted mt-1">학생을 선택해 측정 입력/결과를 확인하세요.</p>
          </div>
          <Link href="/student/new">
            <Button className="w-full sm:w-auto">+ 새 학생 등록</Button>
          </Link>
        </div>

        {loading ? (
          <div className="text-center py-10 text-fg-muted">로딩 중...</div>
        ) : students.length === 0 ? (
          <div className="text-center py-10 text-fg-muted">
            등록된 학생이 없습니다. 새 학생을 등록해주세요.
          </div>
        ) : (
          <Stagger className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {students.map((student) => (
              <StaggerItem key={student.id}>
                <div className="surface surface-hover p-4 flex items-center gap-3">
                  <Link href={`/student/${student.id}`} className="flex-1 flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold text-fg">
                        {student.nickname || '이름 없음'}
                      </h4>
                      <p className="text-sm text-fg-muted">
                        {student.grade} {student.sex === 'male' ? '남' : '여'}
                      </p>
                    </div>
                    <span className="text-cyan-300/90 font-semibold">→</span>
                  </Link>
                  <Button
                    variant="danger"
                    onClick={(e) => handleDeleteStudent(student.id, e)}
                    disabled={deletingIds.has(student.id)}
                    className="px-3 py-2 text-xs"
                    title="학생 삭제"
                  >
                    {deletingIds.has(student.id) ? '삭제 중...' : '삭제'}
                  </Button>
                </div>
              </StaggerItem>
            ))}
          </Stagger>
        )}
      </Card>
    </div>
  );
}
