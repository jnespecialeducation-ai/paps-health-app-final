'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

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
      const data = await res.json();
      setStudents(data);
    } catch (error) {
      console.error('학생 목록 조회 실패:', error);
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
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-900">학생 목록</h2>
          <Link
            href="/student/new"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            + 새 학생 등록
          </Link>
        </div>

        {loading ? (
          <div className="text-center py-8 text-gray-500">로딩 중...</div>
        ) : students.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            등록된 학생이 없습니다. 새 학생을 등록해주세요.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {students.map((student) => (
              <div
                key={student.id}
                className="flex items-center gap-2 p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
              >
                <Link
                  href={`/student/${student.id}`}
                  className="flex-1 flex items-center justify-between"
                >
                  <div>
                    <h3 className="font-medium text-gray-900">
                      {student.nickname || '이름 없음'}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {student.grade} {student.sex === 'male' ? '남' : '여'}
                    </p>
                  </div>
                  <span className="text-blue-600">→</span>
                </Link>
                <button
                  onClick={(e) => handleDeleteStudent(student.id, e)}
                  disabled={deletingIds.has(student.id)}
                  className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors disabled:opacity-50"
                  title="학생 삭제"
                >
                  {deletingIds.has(student.id) ? '삭제 중...' : '삭제'}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
