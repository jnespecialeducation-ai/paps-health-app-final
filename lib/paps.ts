import papsCriteria from '@/data/paps_criteria_full.json';

export type Grade = 1 | 2 | 3 | 4 | 5;
export type Sex = 'male' | 'female';
export type GradeLevel = '초4' | '초5' | '초6' | '중1' | '중2' | '중3' | '고1' | '고2' | '고3';
export type MetricType = 'higher' | 'lower' | 'bmi';
export type BMICategory = 'thin' | 'normal' | 'overweight' | 'mild_obese' | 'severe_obese';

export interface MetricValue {
  [key: string]: number;
}

export interface MetricGrade {
  metric: string;
  value: number;
  grade: Grade;
}

export interface ResultSummary {
  grades: MetricGrade[];
  weakAreas: { metric: string; grade: Grade }[];
  strongAreas: { metric: string; grade: Grade }[];
  bmiCategory: BMICategory;
  fitnessGroups: {
    cardio: number; // 심폐지구력
    flexibility: number; // 유연성
    strengthEndurance: number; // 근력근지구력
    power: number; // 순발력
    obesity: number; // 비만
  };
}

/**
 * BMI 계산
 */
export function calculateBMI(heightCm: number, weightKg: number): number {
  const heightM = heightCm / 100;
  return Number((weightKg / (heightM * heightM)).toFixed(1));
}

/**
 * BMI 범주 분류
 */
export function classifyBMI(bmi: number, grade: GradeLevel, sex: Sex): BMICategory {
  const criteria = papsCriteria.bmiCriteria[sex][grade];
  if (!criteria) {
    return 'normal';
  }

  if (bmi <= criteria.thinMax) {
    return 'thin';
  } else if (bmi <= criteria.normalMax) {
    return 'normal';
  } else if (bmi <= criteria.overMax) {
    return 'overweight';
  } else if (bmi <= criteria.obeseMax) {
    return 'mild_obese';
  } else {
    return 'severe_obese';
  }
}

/**
 * 등급 산출 함수
 */
export function calculateGrade(
  grade: GradeLevel,
  sex: Sex,
  metricName: string,
  value: number
): Grade {
  const gradeCriteria = papsCriteria.criteria[sex]?.[grade];
  const criteria = gradeCriteria ? (gradeCriteria as Record<string, any>)[metricName] : undefined;
  if (!criteria) {
    return 5; // 기본값: 최하 등급
  }

  const metricType = papsCriteria.metricType[metricName as keyof typeof papsCriteria.metricType];
  if (!metricType) {
    return 5;
  }

  if (metricType === 'higher') {
    // 값이 클수록 좋은 항목 (min 기준)
    for (const criterion of criteria) {
      if (value >= criterion.min) {
        return criterion.grade as Grade;
      }
    }
    return 5; // 최하 등급
  } else if (metricType === 'lower') {
    // 값이 작을수록 좋은 항목 (max 기준)
    for (const criterion of criteria) {
      if (value <= criterion.max) {
        return criterion.grade as Grade;
      }
    }
    return 5; // 최하 등급
  } else {
    // BMI는 별도 처리
    return 5;
  }
}

/**
 * BMI 등급 산출 (BMI 범주 기반)
 */
export function calculateBMIGrade(bmiCategory: BMICategory): Grade {
  switch (bmiCategory) {
    case 'thin':
      return 3;
    case 'normal':
      return 1;
    case 'overweight':
      return 3;
    case 'mild_obese':
      return 4;
    case 'severe_obese':
      return 5;
    default:
      return 5;
  }
}

/**
 * 체력 요소 그룹 매핑
 */
const fitnessGroupMap: Record<string, 'cardio' | 'strength' | 'endurance' | 'flexibility' | 'power'> = {
  shuttleRun: 'cardio',
  runWalk: 'cardio',
  stepTest: 'cardio',
  pushUp: 'strength',
  grip: 'strength',
  sitUp: 'endurance',
  sitAndReach: 'flexibility',
  sprint50m: 'power',
  jump: 'power',
  bmi: 'cardio', // BMI는 심폐 그룹에 포함
};

/**
 * 결과 요약 생성
 */
export function generateResultSummary(
  grade: GradeLevel,
  sex: Sex,
  heightCm: number,
  weightKg: number,
  metrics: MetricValue
): ResultSummary {
  const bmi = calculateBMI(heightCm, weightKg);
  const bmiCategory = classifyBMI(bmi, grade, sex);
  const bmiGrade = calculateBMIGrade(bmiCategory);

  const grades: MetricGrade[] = [];
  const availableMetrics = papsCriteria.availableMetrics[sex][grade] || [];

  // 각 항목별 등급 계산
  for (const metric of availableMetrics) {
    if (metric === 'bmi') {
      grades.push({
        metric: 'bmi',
        value: bmi,
        grade: bmiGrade,
      });
    } else if (metrics[metric] !== undefined) {
      const metricGrade = calculateGrade(grade, sex, metric, metrics[metric]);
      grades.push({
        metric,
        value: metrics[metric],
        grade: metricGrade,
      });
    }
  }

  // 취약 영역 (등급 4~5) TOP 2
  const weakAreas = grades
    .filter((g) => g.grade >= 4)
    .sort((a, b) => b.grade - a.grade)
    .slice(0, 2)
    .map((g) => ({ metric: g.metric, grade: g.grade }));

  // 강점 영역 (등급 1~2) TOP 2
  const strongAreas = grades
    .filter((g) => g.grade <= 2)
    .sort((a, b) => a.grade - b.grade)
    .slice(0, 2)
    .map((g) => ({ metric: g.metric, grade: g.grade }));

  // 체력 요소 그룹별 점수 계산 (등급의 역수, 1등급=5점, 5등급=1점)
  const fitnessGroups = {
    cardio: 0,
    flexibility: 0,
    strengthEndurance: 0,
    power: 0,
    obesity: 0,
  };

  let groupCounts = {
    cardio: 0,
    flexibility: 0,
    strengthEndurance: 0,
    power: 0,
    obesity: 0,
  };

  for (const g of grades) {
    // BMI는 비만 그룹으로 직접 처리
    if (g.metric === 'bmi') {
      const score = 6 - g.grade; // 1등급=5점, 5등급=1점
      fitnessGroups.obesity += score;
      groupCounts.obesity += 1;
      continue;
    }
    
    const group = fitnessGroupMap[g.metric];
    if (group) {
      const score = 6 - g.grade; // 1등급=5점, 5등급=1점
      
      // 근력과 근지구력을 합쳐서 근력근지구력으로 계산
      if (group === 'strength' || group === 'endurance') {
        fitnessGroups.strengthEndurance += score;
        groupCounts.strengthEndurance += 1;
      } else if (group === 'cardio') {
        fitnessGroups.cardio += score;
        groupCounts.cardio += 1;
      } else if (group === 'flexibility') {
        fitnessGroups.flexibility += score;
        groupCounts.flexibility += 1;
      } else if (group === 'power') {
        fitnessGroups.power += score;
        groupCounts.power += 1;
      }
    }
  }

  // 평균 계산
  for (const key in fitnessGroups) {
    const k = key as keyof typeof fitnessGroups;
    if (groupCounts[k] > 0) {
      fitnessGroups[k] = Number((fitnessGroups[k] / groupCounts[k]).toFixed(1));
    }
  }
  
  // BMI 등급을 비만 그룹에 추가 (BMI가 있는 경우)
  if (bmiGrade) {
    const bmiScore = 6 - bmiGrade;
    if (groupCounts.obesity === 0) {
      fitnessGroups.obesity = bmiScore;
      groupCounts.obesity = 1;
    } else {
      // 이미 BMI가 cardio에 포함되어 있을 수 있으므로 평균 계산
      fitnessGroups.obesity = Number(((fitnessGroups.obesity * groupCounts.obesity + bmiScore) / (groupCounts.obesity + 1)).toFixed(1));
      groupCounts.obesity += 1;
    }
  }

  return {
    grades,
    weakAreas,
    strongAreas,
    bmiCategory,
    fitnessGroups,
  };
}

/**
 * 사용 가능한 측정 항목 조회
 */
export function getAvailableMetrics(grade: GradeLevel, sex: Sex): string[] {
  return papsCriteria.availableMetrics[sex]?.[grade] || [];
}
