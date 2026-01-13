'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';

interface Student {
  id: string;
  grade: string;
  sex: string;
  nickname?: string;
  sessions: any[];
}

export default function StudentPage() {
  const params = useParams();
  const router = useRouter();
  const studentId = params.id as string;

  const [student, setStudent] = useState<Student | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStudent();
  }, [studentId]);

  const fetchStudent = async () => {
    try {
      const res = await fetch(`/api/students?id=${studentId}`);
      if (!res.ok) {
        throw new Error('학생 조회 실패');
      }
      const data = await res.json();
      setStudent(data);
    } catch (error) {
      console.error('학생 조회 오류:', error);
      alert('학생 정보를 불러올 수 없습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSession = async (sessionId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!confirm('정말 이 측정 기록을 삭제하시겠습니까?')) {
      return;
    }

    try {
      const res = await fetch(`/api/sessions/${sessionId}`, {
        method: 'DELETE',
      });

      if (!res.ok) {
        throw new Error('측정 세션 삭제 실패');
      }

      // 목록 새로고침
      fetchStudent();
    } catch (error) {
      console.error('측정 세션 삭제 오류:', error);
      alert('측정 세션 삭제 중 오류가 발생했습니다.');
    }
  };

  if (loading) {
    return <div className="text-center py-8 text-gray-500">로딩 중...</div>;
  }

  if (!student) {
    return <div className="text-center py-8 text-gray-500">학생을 찾을 수 없습니다.</div>;
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className="text-2xl font-semibold text-gray-900">
              {student.nickname || '이름 없음'}
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              {student.grade} {student.sex === 'male' ? '남학생' : '여학생'}
            </p>
          </div>
          <Link
            href={`/student/${studentId}/measure`}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            + 새 측정 입력
          </Link>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">측정 이력</h3>
        {student.sessions.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            측정 이력이 없습니다. 새 측정을 입력해주세요.
          </div>
        ) : (
          <div className="space-y-4">
            {student.sessions.map((session) => (
              <div
                key={session.id}
                className="flex items-center gap-2 p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
              >
                <Link
                  href={`/student/${studentId}/result/${session.id}`}
                  className="flex-1 flex justify-between items-center"
                >
                  <div>
                    <p className="font-medium text-gray-900">
                      {new Date(session.measuredAt).toLocaleDateString('ko-KR')}
                    </p>
                    <p className="text-sm text-gray-500">
                      키: {session.heightCm}cm, 몸무게: {session.weightKg}kg, BMI: {session.bmi}
                    </p>
                  </div>
                  <span className="text-blue-600">→</span>
                </Link>
                <button
                  onClick={(e) => handleDeleteSession(session.id, e)}
                  className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors"
                  title="측정 기록 삭제"
                >
                  측정 삭제
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
