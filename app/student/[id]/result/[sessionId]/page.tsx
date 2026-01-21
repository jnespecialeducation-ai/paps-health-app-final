'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { FadeIn } from '@/app/components/motion/FadeIn';
import { Card } from '@/app/components/ui/Card';
import { Button } from '@/app/components/ui/Button';
import {
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

interface Session {
  id: string;
  studentId: string;
  measuredAt: string;
  heightCm: number;
  weightKg: number;
  bmi: number;
  metrics: Record<string, number>;
  result: {
    grades: Array<{ metric: string; value: number; grade: number }>;
    weakAreas: Array<{ metric: string; grade: number }>;
    strongAreas: Array<{ metric: string; grade: number }>;
    bmiCategory: string;
    fitnessGroups: {
      cardio: number;
      flexibility: number;
      strengthEndurance: number;
      power: number;
      obesity: number;
    };
  };
  aiRecommendation?: string;
  student?: {
    id: string;
    grade: string;
    sex: string;
    nickname?: string;
  };
}

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

const gradeColors: Record<number, string> = {
  1: 'bg-green-500',
  2: 'bg-blue-500',
  3: 'bg-yellow-500',
  4: 'bg-orange-500',
  5: 'bg-red-500',
};

const gradeLabels: Record<number, string> = {
  1: '우수',
  2: '양호',
  3: '보통',
  4: '미흡',
  5: '매우미흡',
};

export default function ResultPage() {
  const params = useParams();
  const router = useRouter();
  const sessionId = params.sessionId as string;
  const studentId = params.id as string;

  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [aiLoading, setAiLoading] = useState(false);
  const [showAiRecommendation, setShowAiRecommendation] = useState(false);
  const [aiRecommendation, setAiRecommendation] = useState<string>('');
  const [deleting, setDeleting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editFormData, setEditFormData] = useState<{
    heightCm: string;
    weightKg: string;
    metrics: Record<string, string>;
  } | null>(null);

  const fetchSession = useCallback(async () => {
    try {
      const res = await fetch(`/api/sessions?id=${sessionId}`);
      if (!res.ok) {
        throw new Error('세션 조회 실패');
      }
      const data = await res.json();
      setSession(data);
      if (data.aiRecommendation) {
        setAiRecommendation(data.aiRecommendation);
        setShowAiRecommendation(true);
      }
    } catch (error) {
      console.error('세션 조회 오류:', error);
      alert('결과를 불러올 수 없습니다.');
    } finally {
      setLoading(false);
    }
  }, [sessionId]);

  useEffect(() => {
    fetchSession();
  }, [fetchSession]);

  const handleGenerateAIRecommendation = async () => {
    if (!session || !session.student) return;

    setAiLoading(true);
    try {
      // 최신 세션 데이터 가져오기 (수정 후 최신 데이터 반영)
      const latestSessionRes = await fetch(`/api/sessions?id=${sessionId}`);
      if (!latestSessionRes.ok) {
        throw new Error('세션 조회 실패');
      }
      const latestSession = await latestSessionRes.json();

      // result.grades가 배열인지 확인
      const grades = Array.isArray(latestSession.result?.grades)
        ? latestSession.result.grades.map((g: any) => ({ metric: g.metric, grade: g.grade }))
        : [];

      const res = await fetch('/api/ai/recommend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: session.id,
          grade: latestSession.student.grade,
          sex: latestSession.student.sex as 'male' | 'female',
          grades: grades,
          weakAreas: latestSession.result.weakAreas || [],
          strongAreas: latestSession.result.strongAreas || [],
          bmiCategory: latestSession.result.bmiCategory,
          fitnessGroups: latestSession.result.fitnessGroups,
          forceRefresh: true, // 수정 후 강제 새로고침
        }),
      });

      if (!res.ok) {
        throw new Error('AI 추천 생성 실패');
      }

      const data = await res.json();
      
      if (data.error) {
        throw new Error(data.error);
      }
      
      setAiRecommendation(data.recommendation);
      setShowAiRecommendation(true);
      
      // 세션 새로고침하여 최신 AI 추천 반영
      fetchSession();
    } catch (error) {
      console.error('AI 추천 생성 오류:', error);
      alert('AI 추천 생성 중 오류가 발생했습니다.');
    } finally {
      setAiLoading(false);
    }
  };

  const handleDeleteSession = async () => {
    if (!confirm('정말 이 측정 기록을 삭제하시겠습니까?')) {
      return;
    }

    setDeleting(true);
    try {
      const res = await fetch(`/api/sessions/${sessionId}`, {
        method: 'DELETE',
      });

      if (!res.ok) {
        throw new Error('측정 세션 삭제 실패');
      }

      alert('측정 기록이 삭제되었습니다.');
      router.push(`/student/${studentId}`);
    } catch (error) {
      console.error('측정 세션 삭제 오류:', error);
      alert('측정 세션 삭제 중 오류가 발생했습니다.');
    } finally {
      setDeleting(false);
    }
  };

  const handleStartEdit = () => {
    if (!session) return;
    
    // 현재 세션 데이터를 편집 폼에 복사
    const metrics: Record<string, string> = {};
    session.result.grades.forEach((grade) => {
      if (grade.metric !== 'bmi') {
        metrics[grade.metric] = grade.value.toString();
      }
    });

    setEditFormData({
      heightCm: session.heightCm.toString(),
      weightKg: session.weightKg.toString(),
      metrics,
    });
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditFormData(null);
  };

  const handleSaveEdit = async () => {
    if (!session || !editFormData) return;

    setEditing(true);
    try {
      // 숫자 변환 및 검증
      const heightCm = parseFloat(editFormData.heightCm);
      const weightKg = parseFloat(editFormData.weightKg);
      const metrics: Record<string, number> = {};

      if (isNaN(heightCm) || heightCm <= 0) {
        alert('키를 올바르게 입력해주세요.');
        setEditing(false);
        return;
      }

      if (isNaN(weightKg) || weightKg <= 0) {
        alert('몸무게를 올바르게 입력해주세요.');
        setEditing(false);
        return;
      }

      // BMI 자동 계산
      const { calculateBMI } = await import('@/lib/paps');
      const bmi = calculateBMI(heightCm, weightKg);
      metrics.bmi = bmi;

      // 다른 측정값들 변환
      for (const [key, value] of Object.entries(editFormData.metrics)) {
        if (value.trim()) {
          const numValue = parseFloat(value);
          if (!isNaN(numValue)) {
            // sitAndReach는 0/음수도 기록 가능
            if (key === 'sitAndReach') {
              metrics[key] = numValue;
            } else if (numValue > 0) {
              metrics[key] = numValue;
            }
          }
        }
      }

      const res = await fetch(`/api/sessions/${sessionId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          heightCm,
          weightKg,
          metrics,
        }),
      });

      if (!res.ok) {
        throw new Error('측정 수정 실패');
      }

      alert('측정 기록이 수정되었습니다.');
      setIsEditing(false);
      setEditFormData(null);
      
      // AI 추천 초기화 (수정 후 새로 생성할 수 있도록)
      setAiRecommendation('');
      setShowAiRecommendation(false);
      
      fetchSession(); // 세션 새로고침
    } catch (error) {
      console.error('측정 수정 오류:', error);
      alert('측정 수정 중 오류가 발생했습니다.');
    } finally {
      setEditing(false);
    }
  };

  if (loading || !session) {
    return <div className="text-center py-10 text-fg-muted">로딩 중...</div>;
  }

  // 체력 요소별 등급 계산 (점수를 등급으로 변환: 5점=1등급, 1점=5등급)
  const calculateGradeFromScore = (score: number): number => {
    if (score >= 4.5) return 1;
    if (score >= 3.5) return 2;
    if (score >= 2.5) return 3;
    if (score >= 1.5) return 4;
    return 5;
  };

  // 각 체력 요소에 해당하는 측정 항목 찾기
  const getMeasurementValue = (category: string): string => {
    const categoryMetrics: Record<string, string[]> = {
      '심폐지구력': ['shuttleRun', 'stepTest', 'runWalk'],
      '유연성': ['sitAndReach', 'flexibilityTest'],
      '근력근지구력': ['pushUp', 'sitUp', 'grip'],
      '순발력': ['sprint50m', 'jump'],
      '비만': ['bmi'],
    };

    const metrics = categoryMetrics[category] || [];
    for (const metric of metrics) {
      const grade = session.result.grades.find((g) => g.metric === metric);
      if (grade) {
        const unit = grade.metric === 'bmi' 
          ? '' 
          : grade.metric === 'sprint50m' || grade.metric === 'runWalk'
          ? '초'
          : grade.metric === 'jump' || grade.metric === 'sitAndReach' || grade.metric === 'flexibilityTest'
          ? 'cm'
          : grade.metric === 'grip'
          ? 'kg'
          : '회';
        return `${grade.value}${unit}`;
      }
    }
    return '-';
  };

  const radarData = [
    { 
      subject: '심폐지구력', 
      value: session.result.fitnessGroups.cardio || 0,
      grade: calculateGradeFromScore(session.result.fitnessGroups.cardio || 0),
      measurement: getMeasurementValue('심폐지구력')
    },
    { 
      subject: '유연성', 
      value: session.result.fitnessGroups.flexibility || 0,
      grade: calculateGradeFromScore(session.result.fitnessGroups.flexibility || 0),
      measurement: getMeasurementValue('유연성')
    },
    { 
      subject: '근력근지구력', 
      value: session.result.fitnessGroups.strengthEndurance || 0,
      grade: calculateGradeFromScore(session.result.fitnessGroups.strengthEndurance || 0),
      measurement: getMeasurementValue('근력근지구력')
    },
    { 
      subject: '순발력', 
      value: session.result.fitnessGroups.power || 0,
      grade: calculateGradeFromScore(session.result.fitnessGroups.power || 0),
      measurement: getMeasurementValue('순발력')
    },
    { 
      subject: '비만', 
      value: session.result.fitnessGroups.obesity || 0,
      grade: calculateGradeFromScore(session.result.fitnessGroups.obesity || 0),
      measurement: getMeasurementValue('비만')
    },
  ];

  return (
    <div className="space-y-6">
      <FadeIn>
        <div className="mb-2">
          <h2 className="text-3xl font-extrabold text-gradient">측정 결과</h2>
          <p className="text-sm text-fg-muted mt-2">
            측정일: {new Date(session.measuredAt).toLocaleDateString('ko-KR')}
          </p>
        </div>
      </FadeIn>

      <Card className="p-6">
        <div className="flex justify-between items-center mb-4">
          <div className="flex gap-2">
            {!isEditing ? (
              <>
                <Button
                  onClick={() => router.push(`/student/${studentId}`)}
                  variant="secondary"
                >
                  ← 목록으로
                </Button>
                <Button
                  onClick={handleStartEdit}
                  variant="primary"
                >
                  수정
                </Button>
                <Button
                  onClick={handleDeleteSession}
                  disabled={deleting}
                  variant="danger"
                >
                  {deleting ? '삭제 중...' : '측정 삭제'}
                </Button>
              </>
            ) : (
              <>
                <Button
                  onClick={handleCancelEdit}
                  variant="secondary"
                >
                  취소
                </Button>
                <Button
                  onClick={handleSaveEdit}
                  disabled={editing}
                  className="bg-gradient-to-r from-emerald-500 via-green-600 to-cyan-500 shadow-neon"
                >
                  {editing ? '저장 중...' : '저장'}
                </Button>
              </>
            )}
          </div>
        </div>
      </Card>

      {/* 항목별 등급 카드 */}
      <Card className="p-6">
        <h3 className="text-xl font-bold text-fg mb-4">항목별 등급</h3>
        {!isEditing ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {session.result.grades.map((grade) => (
              <div
                key={grade.metric}
                className="surface surface-hover p-4"
              >
                <div className="flex justify-between items-center mb-2">
                  <span className="font-semibold text-fg">
                    {metricLabels[grade.metric] || grade.metric}
                  </span>
                  <span
                    className={`px-2 py-1 rounded-lg text-white text-sm ${gradeColors[grade.grade]}`}
                  >
                    {grade.grade}등급 ({gradeLabels[grade.grade]})
                  </span>
                </div>
                <p className="text-sm text-fg-muted">
                  측정값: {grade.value} {grade.metric === 'bmi' ? '' : grade.metric === 'sprint50m' ? '초' : grade.metric === 'jump' ? 'cm' : grade.metric === 'grip' ? 'kg' : grade.metric === 'sitAndReach' ? 'cm' : '회'}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-6">
            {/* 키와 몸무게 수정 */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-fg mb-2">
                  키 (cm) *
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={editFormData?.heightCm || ''}
                  onChange={(e) => setEditFormData((prev) => prev ? { ...prev, heightCm: e.target.value } : null)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-white/20 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-fg bg-white dark:bg-black/20"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-fg mb-2">
                  몸무게 (kg) *
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={editFormData?.weightKg || ''}
                  onChange={(e) => setEditFormData((prev) => prev ? { ...prev, weightKg: e.target.value } : null)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-white/20 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-fg bg-white dark:bg-black/20"
                  required
                />
              </div>
            </div>

            {/* 측정 항목 수정 */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {session.result.grades
                .filter((grade) => grade.metric !== 'bmi')
                .map((grade) => {
                  const unit = grade.metric === 'sprint50m' ? '초' 
                    : grade.metric === 'jump' ? 'cm' 
                    : grade.metric === 'grip' ? 'kg' 
                    : grade.metric === 'sitAndReach' ? 'cm' 
                    : '회';
                  return (
                    <div key={grade.metric} className="p-4 border border-gray-200 rounded-lg">
                      <label className="block text-sm font-medium text-fg mb-2">
                        {metricLabels[grade.metric] || grade.metric}
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        value={editFormData?.metrics[grade.metric] || ''}
                        onChange={(e) => setEditFormData((prev) => 
                          prev ? { 
                            ...prev, 
                            metrics: { ...prev.metrics, [grade.metric]: e.target.value } 
                          } : null
                        )}
                        placeholder={`측정값 입력 (${unit})`}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-white/20 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-fg bg-white dark:bg-black/20"
                      />
                    </div>
                  );
                })}
            </div>
          </div>
        )}
      </Card>

      {/* 레이더 차트 */}
      <Card className="p-6">
        <h3 className="text-xl font-bold text-fg mb-4">체력 요소 분석</h3>
        <ResponsiveContainer width="100%" height={400}>
          <RadarChart data={radarData}>
            <PolarGrid />
            <PolarAngleAxis dataKey="subject" />
            <PolarRadiusAxis
              angle={90}
              domain={[0, 5]}
              ticks={[0, 1, 2, 3, 4, 5].map((v) => ({ value: v }))}
              allowDecimals={false}
            />
            <Radar
              name="체력 점수"
              dataKey="value"
              stroke="#3b82f6"
              fill="#3b82f6"
              fillOpacity={0.6}
            />
          </RadarChart>
        </ResponsiveContainer>
        
        {/* 체력 요소별 등급 표시 */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-5 gap-4">
          {radarData.map((item) => (
            <div
              key={item.subject}
              className="surface surface-hover p-4 text-center"
            >
              <div className="text-sm font-semibold text-fg mb-2">
                {item.subject}
              </div>
              <div className={`inline-block px-3 py-1 rounded text-white text-sm font-semibold ${gradeColors[item.grade]}`}>
                {item.grade}등급 ({gradeLabels[item.grade]})
              </div>
              <div className="text-xs text-fg-subtle mt-1">
                측정 결과: {item.measurement}
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* 추천 섹션 */}
      <Card className="p-6">
        <h3 className="text-xl font-bold text-fg mb-4">맞춤 추천</h3>

        {/* 기본 추천 */}
        <div className="mb-6 p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur">
          <h4 className="font-semibold text-fg mb-2">📌 기본 추천</h4>
          <div className="text-sm text-fg-muted space-y-2">
            {session.result.weakAreas.length > 0 && (
              <p>
                <strong>개선 필요 항목:</strong>{' '}
                {session.result.weakAreas
                  .map((w) => metricLabels[w.metric] || w.metric)
                  .join(', ')}
              </p>
            )}
            {session.result.strongAreas.length > 0 && (
              <p>
                <strong>우수 항목:</strong>{' '}
                {session.result.strongAreas
                  .map((s) => metricLabels[s.metric] || s.metric)
                  .join(', ')}
              </p>
            )}
            <p>
              <strong>BMI 범주:</strong> {session.result.bmiCategory}
            </p>
          </div>
        </div>

        {/* AI 추천 */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-semibold text-fg">🤖 AI 맞춤 추천</h4>
              <p className="text-xs text-fg-subtle mt-1">
                AI가 측정 결과를 분석하여 맞춤 운동 추천을 제공합니다. (개인정보는 전송되지 않습니다)
              </p>
            </div>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={showAiRecommendation}
                onChange={(e) => {
                  setShowAiRecommendation(e.target.checked);
                  if (!e.target.checked) {
                    setAiRecommendation('');
                  }
                }}
                className="rounded"
              />
              <span className="text-sm text-fg-muted">AI 추천 사용</span>
            </label>
          </div>

          {showAiRecommendation && (
            <div>
              {aiRecommendation ? (
                <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur">
                  <div className="whitespace-pre-line text-sm text-fg-muted">
                    {aiRecommendation}
                  </div>
                </div>
              ) : (
                <Button
                  onClick={handleGenerateAIRecommendation}
                  disabled={aiLoading}
                  className="w-full py-3 bg-gradient-to-r from-emerald-500 via-green-600 to-cyan-500 shadow-neon"
                >
                  {aiLoading ? 'AI 추천 생성 중...' : 'AI 추천 생성하기'}
                </Button>
              )}
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
