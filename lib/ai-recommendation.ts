import OpenAI from 'openai';
import type { GradeLevel, Sex, BMICategory } from './paps';

export interface RecommendationRequest {
  grade: GradeLevel;
  sex: Sex;
  grades: { metric: string; grade: number }[];
  weakAreas: { metric: string; grade: number }[];
  strongAreas: { metric: string; grade: number }[];
  bmiCategory: BMICategory;
  fitnessGroups: {
    cardio: number;
    flexibility: number;
    strengthEndurance: number;
    power: number;
    obesity: number;
  };
}

const metricNames: Record<string, string> = {
  shuttleRun: '왕복오래달리기',
  pushUp: '팔굽혀펴기',
  sitUp: '윗몸일으키기',
  grip: '악력',
  sprint50m: '50m 달리기',
  jump: '제자리멀리뛰기',
  sitAndReach: '앉아윗몸앞으로굽히기',
  bmi: 'BMI',
};

const fitnessGroupNames: Record<string, string> = {
  cardio: '심폐지구력',
  flexibility: '유연성',
  strengthEndurance: '근력근지구력',
  power: '순발력',
  obesity: '비만',
};

const bmiCategoryNames: Record<BMICategory, string> = {
  thin: '저체중',
  normal: '정상',
  overweight: '과체중',
  mild_obese: '경도비만',
  severe_obese: '고도비만',
};

/**
 * 룰 기반 추천 생성 (AI 실패 시 폴백)
 */
export function generateRuleBasedRecommendation(request: RecommendationRequest): string {
  const { grade, weakAreas, strongAreas, bmiCategory, fitnessGroups } = request;

  const weakMetricNames = weakAreas.map((w) => metricNames[w.metric] || w.metric).join(', ');
  const strongMetricNames = strongAreas.map((s) => metricNames[s.metric] || s.metric).join(', ');

  const lowestGroup = Object.entries(fitnessGroups)
    .sort(([, a], [, b]) => a - b)[0];

  let recommendation = `안녕하세요! 이번 측정 결과를 바탕으로 맞춤 추천을 드립니다.\n\n`;

  // 이번 주 목표
  if (weakAreas.length > 0) {
    recommendation += `📌 이번 주 목표\n`;
    recommendation += `${weakMetricNames} 항목을 개선하기 위해 주 3회 이상 운동을 실시해보세요.\n\n`;
  }

  // 주 3회 루틴
  recommendation += `🏃 주 3회 운동 루틴\n`;
  if (lowestGroup) {
    const groupName = fitnessGroupNames[lowestGroup[0]] || lowestGroup[0];
    recommendation += `- ${groupName} 향상을 위한 운동을 중심으로 실시하세요.\n`;
  }
  recommendation += `- 학교: 체육 시간에 선생님께 배운 운동을 열심히 참여하세요.\n`;
  recommendation += `- 집: 간단한 스트레칭과 체조를 20분 이상 실시하세요.\n\n`;

  // 주의사항
  recommendation += `⚠️ 주의사항\n`;
  recommendation += `- 운동 중 통증이나 불편함이 느껴지면 즉시 중단하세요.\n`;
  recommendation += `- 건강에 대한 걱정이 있으면 보건교사나 전문가와 상담하세요.\n\n`;

  // 동기부여
  recommendation += `💪 동기부여\n`;
  recommendation += `현재 ${strongMetricNames || '여러 항목'}에서 좋은 성과를 보이고 있습니다. 꾸준한 노력으로 더욱 발전할 수 있습니다!`;

  return recommendation;
}

/**
 * AI 기반 추천 생성
 */
export async function generateAIRecommendation(
  request: RecommendationRequest,
  apiKey?: string
): Promise<string> {
  if (!apiKey) {
    return generateRuleBasedRecommendation(request);
  }

  try {
    const openai = new OpenAI({ apiKey });

    const { grade, sex, grades, weakAreas, strongAreas, bmiCategory, fitnessGroups } = request;

    const gradeText = grade.includes('초') ? '초등학생' : grade.includes('중') ? '중학생' : '고등학생';
    const sexText = sex === 'male' ? '남학생' : '여학생';

    const weakMetricNames = weakAreas.map((w) => metricNames[w.metric] || w.metric).join(', ');
    const strongMetricNames = strongAreas.map((s) => metricNames[s.metric] || s.metric).join(', ');

    const lowestGroup = Object.entries(fitnessGroups)
      .sort(([, a], [, b]) => a - b)[0];
    const lowestGroupName = lowestGroup ? fitnessGroupNames[lowestGroup[0]] : '';

    const prompt = `당신은 학생 건강체력평가(PAPS) 전문 상담사입니다. ${gradeText} ${sexText}에게 친근하고 격려하는 톤으로 맞춤 운동 추천을 작성해주세요.

학생 정보:
- 학년: ${grade}
- 성별: ${sexText}
- BMI 범주: ${bmiCategoryNames[bmiCategory]}

측정 결과 요약:
- 취약 영역 (등급 4~5): ${weakMetricNames || '없음'}
- 강점 영역 (등급 1~2): ${strongMetricNames || '없음'}
- 가장 낮은 체력 요소: ${lowestGroupName}

다음 5가지 항목을 포함하여 한국어로 추천을 작성해주세요:
1. 이번 주 목표 (구체적이고 달성 가능한 목표)
2. 주 3회 운동 루틴 (학교 버전과 집 버전으로 구분)
3. 주의사항 (통증 시 중단, 보건교사/전문가 상담 권고 등 안전 문구 포함)
4. 동기부여 한 문장 (격려하는 메시지)
5. 추가 팁 (선택사항)

학생 친화적이고 이해하기 쉬운 언어로 작성하되, 전문적이면서도 따뜻한 톤을 유지해주세요.`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: '당신은 학생 건강체력평가 전문 상담사입니다. 학생에게 친근하고 격려하는 톤으로 운동 추천을 제공합니다.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 1000,
    });

    const recommendation = completion.choices[0]?.message?.content?.trim();
    if (!recommendation) {
      throw new Error('AI 응답이 비어있습니다.');
    }

    return recommendation;
  } catch (error) {
    console.error('AI 추천 생성 실패:', error);
    return generateRuleBasedRecommendation(request);
  }
}
