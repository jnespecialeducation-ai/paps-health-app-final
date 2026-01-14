'use client';

import { useState, useEffect, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

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
  const [isEditing, setIsEditing] = useState(false);
  const [editFormData, setEditFormData] = useState({
    grade: '',
    sex: 'male' as 'male' | 'female',
    nickname: '',
  });
  const [saving, setSaving] = useState(false);

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
      // sessions가 배열인지 확인
      if (data && Array.isArray(data.sessions)) {
        setStudent(data);
      } else {
        // sessions가 없으면 빈 배열로 설정
        setStudent({ ...data, sessions: [] });
      }
      // 수정 폼 데이터 초기화
      setEditFormData({
        grade: data.grade,
        sex: data.sex as 'male' | 'female',
        nickname: data.nickname || '',
      });
    } catch (error) {
      console.error('학생 조회 오류:', error);
      alert('학생 정보를 불러올 수 없습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = () => {
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    // 원래 데이터로 복원
    if (student) {
      setEditFormData({
        grade: student.grade,
        sex: student.sex as 'male' | 'female',
        nickname: student.nickname || '',
      });
    }
  };

  const handleSaveEdit = async () => {
    if (!student) return;

    setSaving(true);
    try {
      const res = await fetch(`/api/students/${studentId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editFormData),
      });

      if (!res.ok) {
        throw new Error('학생 수정 실패');
      }

      const updatedStudent = await res.json();
      setStudent({ ...student, ...updatedStudent });
      setIsEditing(false);
      alert('학생 정보가 수정되었습니다.');
    } catch (error) {
      console.error('학생 수정 오류:', error);
      alert('학생 수정 중 오류가 발생했습니다.');
    } finally {
      setSaving(false);
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

  // 시계열 차트 데이터 준비
  const chartData = useMemo(() => {
    if (!student?.sessions || student.sessions.length === 0) return [];

    // 시간순으로 정렬 (오래된 것부터)
    const sortedSessions = [...student.sessions].sort(
      (a, b) => new Date(a.measuredAt).getTime() - new Date(b.measuredAt).getTime()
    );

    return sortedSessions.map((session) => {
      const date = new Date(session.measuredAt);
      const dateLabel = `${date.getMonth() + 1}/${date.getDate()}`;
      
      const metrics = session.metrics || {};
      const result = session.result || {};
      const grades: Record<string, number> = {};
      
      if (result.grades) {
        result.grades.forEach((g: any) => {
          grades[g.metric] = g.grade;
        });
      }

      return {
        date: dateLabel,
        fullDate: date.toISOString(),
        heightCm: session.heightCm,
        weightKg: session.weightKg,
        bmi: session.bmi,
        ...metrics,
        // 등급 데이터는 별도로 관리
        grades,
      };
    });
  }, [student?.sessions]);

  // 등급 차트 데이터 준비
  const gradeChartData = useMemo(() => {
    if (!student?.sessions || student.sessions.length === 0) return [];

    const sortedSessions = [...student.sessions].sort(
      (a, b) => new Date(a.measuredAt).getTime() - new Date(b.measuredAt).getTime()
    );

    const metricLabels: Record<string, string> = {
      shuttleRun: '왕복오래달리기',
      pushUp: '팔굽혀펴기',
      sitUp: '윗몸일으키기',
      grip: '악력',
      sprint50m: '50m 달리기',
      jump: '제자리멀리뛰기',
      sitAndReach: '앉아윗몸앞으로굽히기',
      bmi: 'BMI',
    };

    return sortedSessions.map((session) => {
      const date = new Date(session.measuredAt);
      const dateLabel = `${date.getMonth() + 1}/${date.getDate()}`;
      
      const result = session.result || {};
      const grades: Record<string, number> = {};
      
      if (result.grades) {
        result.grades.forEach((g: any) => {
          grades[g.metric] = g.grade;
        });
      }

      const dataPoint: any = { date: dateLabel };
      Object.keys(metricLabels).forEach((metric) => {
        if (grades[metric] !== undefined) {
          dataPoint[metricLabels[metric]] = grades[metric];
        }
      });

      return dataPoint;
    });
  }, [student?.sessions]);

  // 측정 항목별 값 차트 데이터 준비
  const valueChartData = useMemo(() => {
    if (!student?.sessions || student.sessions.length === 0) return [];

    const sortedSessions = [...student.sessions].sort(
      (a, b) => new Date(a.measuredAt).getTime() - new Date(b.measuredAt).getTime()
    );

    const metricLabels: Record<string, string> = {
      shuttleRun: '왕복오래달리기',
      pushUp: '팔굽혀펴기',
      sitUp: '윗몸일으키기',
      grip: '악력',
      sprint50m: '50m 달리기',
      jump: '제자리멀리뛰기',
      sitAndReach: '앉아윗몸앞으로굽히기',
    };

    return sortedSessions.map((session) => {
      const date = new Date(session.measuredAt);
      const dateLabel = `${date.getMonth() + 1}/${date.getDate()}`;
      
      const metrics = session.metrics || {};

      const dataPoint: any = { date: dateLabel };
      Object.keys(metricLabels).forEach((metric) => {
        if (metrics[metric] !== undefined) {
          dataPoint[metricLabels[metric]] = metrics[metric];
        }
      });

      return dataPoint;
    });
  }, [student?.sessions]);

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
          {isEditing ? (
            <div className="flex-1 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  학년
                </label>
                <select
                  value={editFormData.grade}
                  onChange={(e) => setEditFormData({ ...editFormData, grade: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white"
                >
                  <option value="초4">초등학교 4학년</option>
                  <option value="초5">초등학교 5학년</option>
                  <option value="초6">초등학교 6학년</option>
                  <option value="중1">중학교 1학년</option>
                  <option value="중2">중학교 2학년</option>
                  <option value="중3">중학교 3학년</option>
                  <option value="고1">고등학교 1학년</option>
                  <option value="고2">고등학교 2학년</option>
                  <option value="고3">고등학교 3학년</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  성별
                </label>
                <div className="flex gap-4">
                  <label className="flex items-center text-gray-900">
                    <input
                      type="radio"
                      value="male"
                      checked={editFormData.sex === 'male'}
                      onChange={(e) => setEditFormData({ ...editFormData, sex: e.target.value as 'male' | 'female' })}
                      className="mr-2"
                    />
                    남학생
                  </label>
                  <label className="flex items-center text-gray-900">
                    <input
                      type="radio"
                      value="female"
                      checked={editFormData.sex === 'female'}
                      onChange={(e) => setEditFormData({ ...editFormData, sex: e.target.value as 'male' | 'female' })}
                      className="mr-2"
                    />
                    여학생
                  </label>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  별칭 (선택사항)
                </label>
                <input
                  type="text"
                  value={editFormData.nickname}
                  onChange={(e) => setEditFormData({ ...editFormData, nickname: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white"
                  placeholder="예: 홍길동"
                />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleSaveEdit}
                  disabled={saving}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  {saving ? '저장 중...' : '저장'}
                </button>
                <button
                  onClick={handleCancelEdit}
                  disabled={saving}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  취소
                </button>
              </div>
            </div>
          ) : (
            <div>
              <h2 className="text-2xl font-semibold text-gray-900">
                {student.nickname || '이름 없음'}
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                {student.grade} {student.sex === 'male' ? '남학생' : '여학생'}
              </p>
            </div>
          )}
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              ← 목록으로
            </Link>
            {!isEditing && (
              <button
                onClick={handleEditClick}
                className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
              >
                수정
              </button>
            )}
            <Link
              href={`/student/${studentId}/measure`}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              + 새 측정 입력
            </Link>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">측정 이력</h3>
        {!student.sessions || student.sessions.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            측정 이력이 없습니다. 새 측정을 입력해주세요.
          </div>
        ) : (
          <div className="space-y-6">
            {/* 측정 기록 목록 */}
            <div>
              <h4 className="text-lg font-medium text-gray-800 mb-3">측정 기록 목록</h4>
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
                          키: {session.heightCm}cm, 몸무게: {session.weightKg}kg, BMI: {session.bmi.toFixed(1)}
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
            </div>

            {/* 시계열 차트 섹션 */}
            {student.sessions.length > 1 && (
              <div className="space-y-6 border-t pt-6">
                {/* 신체 지표 변화 차트 */}
                <div>
                  <h4 className="text-lg font-medium text-gray-800 mb-3">신체 지표 변화</h4>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="date" 
                        tick={{ fontSize: 12 }}
                      />
                      <YAxis yAxisId="left" tick={{ fontSize: 12 }} />
                      <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 12 }} />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }}
                      />
                      <Legend />
                      <Line 
                        yAxisId="left"
                        type="monotone" 
                        dataKey="heightCm" 
                        stroke="#3b82f6" 
                        strokeWidth={2}
                        name="키 (cm)"
                        dot={{ r: 4 }}
                      />
                      <Line 
                        yAxisId="left"
                        type="monotone" 
                        dataKey="weightKg" 
                        stroke="#10b981" 
                        strokeWidth={2}
                        name="몸무게 (kg)"
                        dot={{ r: 4 }}
                      />
                      <Line 
                        yAxisId="right"
                        type="monotone" 
                        dataKey="bmi" 
                        stroke="#f59e0b" 
                        strokeWidth={2}
                        name="BMI"
                        dot={{ r: 4 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>

                {/* 등급 변화 차트 */}
                {gradeChartData.length > 0 && Object.keys(gradeChartData[0]).filter(k => k !== 'date').length > 0 && (
                  <div>
                    <h4 className="text-lg font-medium text-gray-800 mb-3">항목별 등급 변화</h4>
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={gradeChartData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis 
                          dataKey="date" 
                          tick={{ fontSize: 12 }}
                        />
                        <YAxis 
                          domain={[1, 5]}
                          tick={{ fontSize: 12 }}
                          label={{ value: '등급', angle: -90, position: 'insideLeft' }}
                        />
                        <Tooltip 
                          contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }}
                          formatter={(value: number) => `${value}등급`}
                        />
                        <Legend />
                        {Object.keys(gradeChartData[0] || {})
                          .filter(key => key !== 'date')
                          .map((metric, index) => {
                            const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4'];
                            return (
                              <Line
                                key={metric}
                                type="monotone"
                                dataKey={metric}
                                stroke={colors[index % colors.length]}
                                strokeWidth={2}
                                dot={{ r: 4 }}
                                name={metric}
                              />
                            );
                          })}
                      </LineChart>
                    </ResponsiveContainer>
                    <p className="text-xs text-gray-500 mt-2">
                      * 1등급(우수) ~ 5등급(매우미흡)
                    </p>
                  </div>
                )}

                {/* 측정값 변화 차트 */}
                {valueChartData.length > 0 && Object.keys(valueChartData[0]).filter(k => k !== 'date').length > 0 && (
                  <div>
                    <h4 className="text-lg font-medium text-gray-800 mb-3">항목별 측정값 변화</h4>
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={valueChartData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis 
                          dataKey="date" 
                          tick={{ fontSize: 12 }}
                        />
                        <YAxis tick={{ fontSize: 12 }} />
                        <Tooltip 
                          contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }}
                        />
                        <Legend />
                        {Object.keys(valueChartData[0] || {})
                          .filter(key => key !== 'date')
                          .map((metric, index) => {
                            const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4'];
                            return (
                              <Line
                                key={metric}
                                type="monotone"
                                dataKey={metric}
                                stroke={colors[index % colors.length]}
                                strokeWidth={2}
                                dot={{ r: 4 }}
                                name={metric}
                              />
                            );
                          })}
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
