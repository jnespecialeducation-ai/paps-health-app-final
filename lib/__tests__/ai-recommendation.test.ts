import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  generateRuleBasedRecommendation,
  generateAIRecommendation,
} from '../ai-recommendation';
import type { RecommendationRequest } from '../ai-recommendation';

describe('AI 추천 테스트', () => {
  describe('generateRuleBasedRecommendation', () => {
    it('기본 추천 생성', () => {
      const request: RecommendationRequest = {
        grade: '중1',
        sex: 'male',
        grades: [
          { metric: 'shuttleRun', grade: 4 },
          { metric: 'pushUp', grade: 2 },
        ],
        weakAreas: [{ metric: 'shuttleRun', grade: 4 }],
        strongAreas: [{ metric: 'pushUp', grade: 2 }],
        bmiCategory: 'normal',
        fitnessGroups: {
          cardio: 2,
          strength: 4,
          endurance: 3,
          flexibility: 3,
          power: 3,
        },
      };

      const recommendation = generateRuleBasedRecommendation(request);
      expect(recommendation).toBeDefined();
      expect(recommendation.length).toBeGreaterThan(0);
      expect(recommendation).toContain('이번 주 목표');
      expect(recommendation).toContain('주 3회');
      expect(recommendation).toContain('주의사항');
      expect(recommendation).toContain('동기부여');
    });

    it('취약 영역이 없을 때 처리', () => {
      const request: RecommendationRequest = {
        grade: '중1',
        sex: 'male',
        grades: [{ metric: 'pushUp', grade: 1 }],
        weakAreas: [],
        strongAreas: [{ metric: 'pushUp', grade: 1 }],
        bmiCategory: 'normal',
        fitnessGroups: {
          cardio: 5,
          strength: 5,
          endurance: 5,
          flexibility: 5,
          power: 5,
        },
      };

      const recommendation = generateRuleBasedRecommendation(request);
      expect(recommendation).toBeDefined();
    });
  });

  describe('generateAIRecommendation', () => {
    beforeEach(() => {
      vi.clearAllMocks();
    });

    it('API 키가 없을 때 룰 기반 추천으로 폴백', async () => {
      const request: RecommendationRequest = {
        grade: '중1',
        sex: 'male',
        grades: [{ metric: 'shuttleRun', grade: 4 }],
        weakAreas: [{ metric: 'shuttleRun', grade: 4 }],
        strongAreas: [],
        bmiCategory: 'normal',
        fitnessGroups: {
          cardio: 2,
          strength: 3,
          endurance: 3,
          flexibility: 3,
          power: 3,
        },
      };

      const recommendation = await generateAIRecommendation(request, undefined);
      expect(recommendation).toBeDefined();
      expect(recommendation).toContain('이번 주 목표');
    });

    it('API 키가 있을 때 OpenAI 호출 시도 (모킹 필요)', async () => {
      // 실제 OpenAI 호출은 모킹하지 않고, 폴백 동작만 테스트
      const request: RecommendationRequest = {
        grade: '중1',
        sex: 'male',
        grades: [{ metric: 'shuttleRun', grade: 4 }],
        weakAreas: [{ metric: 'shuttleRun', grade: 4 }],
        strongAreas: [],
        bmiCategory: 'normal',
        fitnessGroups: {
          cardio: 2,
          strength: 3,
          endurance: 3,
          flexibility: 3,
          power: 3,
        },
      };

      // 잘못된 API 키로 폴백 테스트
      const recommendation = await generateAIRecommendation(request, 'invalid-key');
      expect(recommendation).toBeDefined();
      // 에러 발생 시 룰 기반으로 폴백되어야 함
    });
  });
});
