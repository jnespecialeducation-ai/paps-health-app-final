'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { calculateGrade, calculateBMI, classifyBMI, calculateBMIGrade } from '@/lib/paps';
import { FadeIn } from '@/app/components/motion/FadeIn';
import { Card } from '@/app/components/ui/Card';
import { Button } from '@/app/components/ui/Button';

interface Student {
  id: string;
  grade: string;
  sex: 'male' | 'female';
  nickname?: string;
}

// 체력 측정 카테고리별 평가항목
const fitnessCategories = {
  cardio: {
    label: '심폐지구력',
    metrics: [
      { value: 'shuttleRun', label: '왕복오래달리기' },
      { value: 'stepTest', label: '스텝검사' },
      { value: 'runWalk', label: '오래달리기걷기' },
    ],
  },
  flexibility: {
    label: '유연성',
    metrics: [
      { value: 'sitAndReach', label: '앉아윗몸앞으로굽히기' },
      { value: 'flexibilityTest', label: '종합유연성검사' },
    ],
  },
  strength: {
    label: '근력근지구력',
    metrics: [
      { value: 'pushUp', label: '팔굽혀펴기' },
      { value: 'sitUp', label: '윗몸말아올리기' },
      { value: 'grip', label: '악력' },
    ],
  },
  power: {
    label: '순발력',
    metrics: [
      { value: 'sprint50m', label: '50m달리기' },
      { value: 'jump', label: '제자리멀리뛰기' },
    ],
  },
  obesity: {
    label: '비만',
    metrics: [
      { value: 'bmi', label: '체질량지수' },
    ],
  },
};

interface CategorySectionProps {
  category: keyof typeof fitnessCategories;
  student: Student;
  formData: {
    heightCm: string;
    weightKg: string;
    [key: string]: {
      selectedMetric: string;
      measurementValue: string;
      gripLeftValue?: string;
      gripRightValue?: string;
    } | string;
  };
  onMetricChange: (category: string, metric: string) => void;
  onValueChange: (category: string, value: string) => void;
  onGripValueChange: (category: string, hand: 'left' | 'right', value: string) => void;
  scores: Record<string, number | null>;
  grades: Record<string, number | null>;
}

function CategorySection({
  category,
  student,
  formData,
  onMetricChange,
  onValueChange,
  onGripValueChange,
  scores,
  grades,
}: CategorySectionProps) {
  const categoryData = fitnessCategories[category];
  const categoryFormData = formData[category] as
    | { selectedMetric: string; measurementValue: string; gripLeftValue?: string; gripRightValue?: string }
    | undefined;
  const actualFormData =
    categoryFormData || { selectedMetric: categoryData.metrics[0].value, measurementValue: '', gripLeftValue: '', gripRightValue: '' };
  const score = scores[category] ?? null;
  const grade = grades[category] ?? null;

  // BMI 자동 계산 (비만 카테고리이고 체질량지수가 선택된 경우)
  const isBMI = category === 'obesity' && actualFormData.selectedMetric === 'bmi';
  const isGrip = actualFormData.selectedMetric === 'grip';
  const heightCm = parseFloat(formData.heightCm as string);
  const weightKg = parseFloat(formData.weightKg as string);
  const calculatedBMI = isBMI && !isNaN(heightCm) && !isNaN(weightKg) && heightCm > 0 && weightKg > 0
    ? calculateBMI(heightCm, weightKg)
    : null;

  return (
    <div className="border-t pt-6">
      <h3 className="text-lg font-semibold text-fg mb-4">{categoryData.label}</h3>
      
      <div className="space-y-4">
        {/* 평가종목 선택 */}
        <div>
          <label className="block text-sm font-medium text-fg mb-2">
            평가종목 선택
          </label>
          <select
            value={actualFormData.selectedMetric}
            onChange={(e) => onMetricChange(category, e.target.value)}
            className="w-full px-3 py-2 border-2 border-gray-900 dark:border-white/20 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-black/20 text-fg"
          >
            {categoryData.metrics.map((metric) => (
              <option key={metric.value} value={metric.value}>
                {metric.label}
              </option>
            ))}
          </select>
        </div>

        {/* 측정 기록 입력 */}
        <div>
          <label className="block text-sm font-medium text-fg mb-2">
            측정 기록 입력
          </label>
          {isBMI ? (
            <div className="w-full px-3 py-2 border border-gray-300 dark:border-white/20 rounded-lg bg-gray-50 dark:bg-black/20 text-fg">
              {calculatedBMI !== null 
                ? `자동 계산: ${calculatedBMI.toFixed(1)} (체중 ${weightKg}kg ÷ 키 ${(heightCm / 100).toFixed(2)}m²)`
                : '키와 몸무게를 입력하면 자동으로 계산됩니다'}
            </div>
          ) : isGrip ? (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-fg-muted mb-1">왼손 (kg)</label>
                <input
                  type="number"
                  step="0.1"
                  value={actualFormData.gripLeftValue || ''}
                  onChange={(e) => onGripValueChange(category, 'left', e.target.value)}
                  placeholder="왼손 악력"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-white/20 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 placeholder-gray-400 dark:placeholder-white/40 text-fg bg-white dark:bg-black/20"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-fg-muted mb-1">오른손 (kg)</label>
                <input
                  type="number"
                  step="0.1"
                  value={actualFormData.gripRightValue || ''}
                  onChange={(e) => onGripValueChange(category, 'right', e.target.value)}
                  placeholder="오른손 악력"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-white/20 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 placeholder-gray-400 dark:placeholder-white/40 text-fg bg-white dark:bg-black/20"
                />
              </div>
              <p className="col-span-2 text-xs text-fg-muted">
                저장/평가에는 두 손 악력의 평균이 사용됩니다.
              </p>
            </div>
          ) : (
            <input
              type="number"
              step="0.1"
              value={actualFormData.measurementValue}
              onChange={(e) => onValueChange(category, e.target.value)}
              placeholder="측정 기록 입력"
              className="w-full px-3 py-2 border border-gray-300 dark:border-white/20 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 placeholder-gray-400 dark:placeholder-white/40 text-fg bg-white dark:bg-black/20"
            />
          )}
        </div>

        {/* 점수 및 등급 표시 */}
        <div className="bg-surface-muted rounded-lg p-4 border border-border">
          <div className="flex justify-between items-center">
            <div className="text-sm font-medium text-fg">
              점수: {score !== null ? `${score}점` : '-'}
            </div>
            <div className="text-sm font-medium text-fg">
              등급: {grade !== null ? `${grade}등급` : '-'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function MeasurePage() {
  const params = useParams();
  const router = useRouter();
  const studentId = params.id as string;

  const [student, setStudent] = useState<Student | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState<{
    heightCm: string;
    weightKg: string;
    measuredAt: string;
    [key: string]: {
      selectedMetric: string;
      measurementValue: string;
      gripLeftValue?: string;
      gripRightValue?: string;
    } | string;
  }>({
    heightCm: '',
    weightKg: '',
    measuredAt: new Date().toISOString().split('T')[0], // 오늘 날짜를 기본값으로 설정
  });
  const [scores, setScores] = useState<Record<string, number | null>>({});
  const [grades, setGrades] = useState<Record<string, number | null>>({});

  const fetchStudent = useCallback(async () => {
    try {
      const res = await fetch(`/api/students?id=${studentId}`);
      if (!res.ok) {
        throw new Error('학생 조회 실패');
      }
      const data = await res.json();
      setStudent(data);

      // 각 카테고리의 첫 번째 항목을 기본값으로 설정
      const initialFormData: any = {
        heightCm: '',
        weightKg: '',
        measuredAt: new Date().toISOString().split('T')[0], // 오늘 날짜를 기본값으로 설정
      };
      Object.keys(fitnessCategories).forEach((category) => {
        const categoryData = fitnessCategories[category as keyof typeof fitnessCategories];
        initialFormData[category] = {
          selectedMetric: categoryData.metrics[0].value,
          measurementValue: '',
          gripLeftValue: '',
          gripRightValue: '',
        };
      });
      setFormData(initialFormData);
    } catch (error) {
      console.error('학생 조회 오류:', error);
      alert('학생 정보를 불러올 수 없습니다.');
    } finally {
      setLoading(false);
    }
  }, [studentId]);

  useEffect(() => {
    fetchStudent();
  }, [fetchStudent]);

  // 측정값 입력 시 점수와 등급 계산
  useEffect(() => {
    if (!student) return;

    const newScores: Record<string, number | null> = {};
    const newGrades: Record<string, number | null> = {};

    Object.keys(fitnessCategories).forEach((category) => {
      const categoryFormData = formData[category] as
        | { selectedMetric: string; measurementValue: string; gripLeftValue?: string; gripRightValue?: string }
        | undefined;
      if (!categoryFormData) return;

      const { selectedMetric, measurementValue } = categoryFormData;
      
      if (selectedMetric === 'bmi') {
        // BMI는 키와 몸무게로 계산
        const heightCm = parseFloat(formData.heightCm as string);
        const weightKg = parseFloat(formData.weightKg as string);
        if (!isNaN(heightCm) && !isNaN(weightKg) && heightCm > 0 && weightKg > 0) {
          const bmi = calculateBMI(heightCm, weightKg);
          const bmiCategory = classifyBMI(bmi, student.grade as any, student.sex);
          const calculatedGrade = calculateBMIGrade(bmiCategory);
          newGrades[category] = calculatedGrade;
          newScores[category] = 6 - calculatedGrade;
        } else {
          newScores[category] = null;
          newGrades[category] = null;
        }
      } else if (selectedMetric === 'grip') {
        const left = parseFloat(categoryFormData.gripLeftValue || '');
        const right = parseFloat(categoryFormData.gripRightValue || '');
        if (!isNaN(left) && !isNaN(right) && left > 0 && right > 0) {
          const avg = (left + right) / 2;
          const calculatedGrade = calculateGrade(student.grade as any, student.sex, 'grip', avg);
          newGrades[category] = calculatedGrade;
          newScores[category] = 6 - calculatedGrade;
        } else {
          newScores[category] = null;
          newGrades[category] = null;
        }
      } else if (measurementValue) {
        const value = parseFloat(measurementValue);
        const isSitAndReach = selectedMetric === 'sitAndReach';
        if (!isNaN(value) && (isSitAndReach || value > 0)) {
          const calculatedGrade = calculateGrade(
            student.grade as any,
            student.sex,
            selectedMetric,
            value
          );
          newGrades[category] = calculatedGrade;
          newScores[category] = 6 - calculatedGrade;
        } else {
          newScores[category] = null;
          newGrades[category] = null;
        }
      } else {
        newScores[category] = null;
        newGrades[category] = null;
      }
    });

    setScores(newScores);
    setGrades(newGrades);
  }, [formData, student]);

  const handleMetricChange = (category: string, metric: string) => {
    setFormData((prev) => ({
      ...prev,
      [category]: {
        ...(prev[category] as any || {}),
        selectedMetric: metric,
        measurementValue: '',
        gripLeftValue: '',
        gripRightValue: '',
      },
    }));
  };

  const handleValueChange = (category: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [category]: {
        ...(prev[category] as any || {}),
        measurementValue: value,
      },
    }));
  };

  const handleGripValueChange = (category: string, hand: 'left' | 'right', value: string) => {
    setFormData((prev) => ({
      ...prev,
      [category]: {
        ...(prev[category] as any || {}),
        [hand === 'left' ? 'gripLeftValue' : 'gripRightValue']: value,
      },
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      // 숫자 변환 및 검증
      const heightCm = parseFloat(formData.heightCm as string);
      const weightKg = parseFloat(formData.weightKg as string);

      if (isNaN(heightCm) || heightCm <= 0) {
        alert('키를 올바르게 입력해주세요.');
        setSubmitting(false);
        return;
      }

      if (isNaN(weightKg) || weightKg <= 0) {
        alert('몸무게를 올바르게 입력해주세요.');
        setSubmitting(false);
        return;
      }

      // metrics 객체 생성 (입력된 항목만 포함)
      const metrics: Record<string, number> = {};

      Object.keys(fitnessCategories).forEach((category) => {
        const categoryFormData = formData[category] as
          | { selectedMetric: string; measurementValue: string; gripLeftValue?: string; gripRightValue?: string }
          | undefined;
        if (!categoryFormData) return;

        const { selectedMetric, measurementValue } = categoryFormData;
        
        if (selectedMetric === 'bmi') {
          // BMI는 자동 계산
          const bmi = calculateBMI(heightCm, weightKg);
          metrics.bmi = bmi;
        } else if (selectedMetric === 'grip') {
          const left = parseFloat(categoryFormData.gripLeftValue || '');
          const right = parseFloat(categoryFormData.gripRightValue || '');
          if (!isNaN(left) && !isNaN(right) && left > 0 && right > 0) {
            metrics.grip = Number(((left + right) / 2).toFixed(1));
          }
        } else if (measurementValue) {
          const value = parseFloat(measurementValue);
          const isSitAndReach = selectedMetric === 'sitAndReach';
          if (!isNaN(value) && (isSitAndReach || value > 0)) {
            metrics[selectedMetric] = value;
          }
        }
      });

      // 측정 날짜 처리
      const measuredAt = formData.measuredAt as string;
      if (!measuredAt) {
        alert('측정 날짜를 선택해주세요.');
        setSubmitting(false);
        return;
      }

      const res = await fetch('/api/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId,
          heightCm,
          weightKg,
          metrics,
          measuredAt: new Date(measuredAt).toISOString(),
        }),
      });

      if (!res.ok) {
        throw new Error('측정 저장 실패');
      }

      const data = await res.json();
      router.push(`/student/${studentId}/result/${data.session.id}`);
    } catch (error) {
      console.error('측정 저장 오류:', error);
      alert('측정 저장 중 오류가 발생했습니다.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading || !student) {
    return <div className="text-center py-10 text-fg-muted">로딩 중...</div>;
  }

  return (
    <div className="max-w-3xl mx-auto">
      <FadeIn>
        <div className="mb-6">
          <h2 className="text-3xl font-extrabold text-gradient">측정 입력</h2>
          <p className="text-sm text-fg-muted mt-2">
            {student.nickname || '학생'} · {student.grade} · {student.sex === 'male' ? '남' : '여'}
          </p>
        </div>
      </FadeIn>

      <Card className="p-6 sm:p-7">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* 측정 날짜 */}
          <div>
            <label className="block text-sm font-medium text-fg mb-2">
              측정 날짜 *
            </label>
            <input
              type="date"
              value={formData.measuredAt as string}
              onChange={(e) => setFormData({ ...formData, measuredAt: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-white/10 dark:border-white/10 bg-white/50 dark:bg-black/20 text-fg focus:ring-2 focus:ring-cyan-400/60 focus:border-cyan-300/60"
              required
            />
          </div>

          {/* 키와 몸무게 */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-fg mb-2">
                키 (cm) *
              </label>
              <input
                type="number"
                step="0.1"
                value={formData.heightCm as string}
                onChange={(e) => setFormData({ ...formData, heightCm: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-white/10 dark:border-white/10 bg-white/50 dark:bg-black/20 text-fg focus:ring-2 focus:ring-cyan-400/60 focus:border-cyan-300/60"
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
                value={formData.weightKg as string}
                onChange={(e) => setFormData({ ...formData, weightKg: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-white/10 dark:border-white/10 bg-white/50 dark:bg-black/20 text-fg focus:ring-2 focus:ring-cyan-400/60 focus:border-cyan-300/60"
                required
              />
            </div>
          </div>

          {/* 체력 측정 항목 카테고리들 */}
          {Object.keys(fitnessCategories).map((category) => (
            <CategorySection
              key={category}
              category={category as keyof typeof fitnessCategories}
              student={student}
              formData={formData as any}
              onMetricChange={handleMetricChange}
              onValueChange={handleValueChange}
              onGripValueChange={handleGripValueChange}
              scores={scores}
              grades={grades}
            />
          ))}

          {/* 버튼 */}
          <div className="flex gap-4 pt-4">
            <Button
              type="submit"
              disabled={submitting}
              className="flex-1 py-3"
            >
              {submitting ? '저장 중...' : '저장하기'}
            </Button>
            <Button
              type="button"
              onClick={() => router.back()}
              variant="secondary"
              className="px-5 py-3"
            >
              취소
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
