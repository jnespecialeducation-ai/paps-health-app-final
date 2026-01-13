import { describe, it, expect } from 'vitest';
import {
  calculateBMI,
  classifyBMI,
  calculateGrade,
  calculateBMIGrade,
  generateResultSummary,
} from '../paps';

describe('PAPS 로직 테스트', () => {
  describe('calculateBMI', () => {
    it('정상적인 BMI 계산', () => {
      expect(calculateBMI(170, 70)).toBeCloseTo(24.2, 1);
      expect(calculateBMI(160, 50)).toBeCloseTo(19.5, 1);
    });

    it('경계값 테스트', () => {
      expect(calculateBMI(100, 30)).toBeCloseTo(30.0, 1);
      expect(calculateBMI(200, 100)).toBeCloseTo(25.0, 1);
    });
  });

  describe('classifyBMI', () => {
    it('정상 범위 BMI 분류', () => {
      expect(classifyBMI(20, '중1', 'male')).toBe('normal');
      expect(classifyBMI(22, '중1', 'male')).toBe('normal');
    });

    it('저체중 분류', () => {
      expect(classifyBMI(15, '중1', 'male')).toBe('thin');
    });

    it('과체중 분류', () => {
      expect(classifyBMI(24, '중1', 'male')).toBe('overweight');
    });

    it('경도비만 분류', () => {
      expect(classifyBMI(26, '중1', 'male')).toBe('mild_obese');
    });

    it('고도비만 분류', () => {
      expect(classifyBMI(31, '중1', 'male')).toBe('severe_obese');
    });
  });

  describe('calculateGrade', () => {
    it('higher 타입 항목 - 정상 범위', () => {
      // 중1 남학생 shuttleRun 80회 -> 1등급
      expect(calculateGrade('중1', 'male', 'shuttleRun', 80)).toBe(1);
      // 중1 남학생 shuttleRun 65회 -> 2등급
      expect(calculateGrade('중1', 'male', 'shuttleRun', 65)).toBe(2);
      // 중1 남학생 shuttleRun 50회 -> 3등급
      expect(calculateGrade('중1', 'male', 'shuttleRun', 50)).toBe(3);
      // 중1 남학생 shuttleRun 35회 -> 4등급
      expect(calculateGrade('중1', 'male', 'shuttleRun', 35)).toBe(4);
      // 중1 남학생 shuttleRun 10회 -> 5등급
      expect(calculateGrade('중1', 'male', 'shuttleRun', 10)).toBe(5);
    });

    it('higher 타입 항목 - 경계값 테스트', () => {
      // 정확히 min 값일 때
      expect(calculateGrade('중1', 'male', 'shuttleRun', 80)).toBe(1);
      expect(calculateGrade('중1', 'male', 'shuttleRun', 65)).toBe(2);
      expect(calculateGrade('중1', 'male', 'shuttleRun', 50)).toBe(3);
      expect(calculateGrade('중1', 'male', 'shuttleRun', 35)).toBe(4);
    });

    it('higher 타입 항목 - 구간 밖 값 (클램프)', () => {
      // 매우 높은 값 -> 1등급
      expect(calculateGrade('중1', 'male', 'shuttleRun', 200)).toBe(1);
      // 매우 낮은 값 -> 5등급
      expect(calculateGrade('중1', 'male', 'shuttleRun', 0)).toBe(5);
    });

    it('lower 타입 항목 - 정상 범위', () => {
      // 중1 남학생 sprint50m 7.5초 -> 1등급
      expect(calculateGrade('중1', 'male', 'sprint50m', 7.5)).toBe(1);
      // 중1 남학생 sprint50m 8.0초 -> 2등급
      expect(calculateGrade('중1', 'male', 'sprint50m', 8.0)).toBe(2);
      // 중1 남학생 sprint50m 8.5초 -> 3등급
      expect(calculateGrade('중1', 'male', 'sprint50m', 8.5)).toBe(3);
      // 중1 남학생 sprint50m 9.2초 -> 4등급
      expect(calculateGrade('중1', 'male', 'sprint50m', 9.2)).toBe(4);
      // 중1 남학생 sprint50m 10초 -> 5등급
      expect(calculateGrade('중1', 'male', 'sprint50m', 10)).toBe(5);
    });

    it('lower 타입 항목 - 경계값 테스트', () => {
      // 정확히 max 값일 때
      expect(calculateGrade('중1', 'male', 'sprint50m', 7.5)).toBe(1);
      expect(calculateGrade('중1', 'male', 'sprint50m', 8.0)).toBe(2);
      expect(calculateGrade('중1', 'male', 'sprint50m', 8.5)).toBe(3);
      expect(calculateGrade('중1', 'male', 'sprint50m', 9.2)).toBe(4);
    });

    it('lower 타입 항목 - 구간 밖 값 (클램프)', () => {
      // 매우 빠른 값 -> 1등급
      expect(calculateGrade('중1', 'male', 'sprint50m', 5.0)).toBe(1);
      // 매우 느린 값 -> 5등급
      expect(calculateGrade('중1', 'male', 'sprint50m', 20.0)).toBe(5);
    });

    it('존재하지 않는 항목 -> 기본값 5등급', () => {
      expect(calculateGrade('중1', 'male', 'unknownMetric', 100)).toBe(5);
    });
  });

  describe('calculateBMIGrade', () => {
    it('BMI 범주별 등급', () => {
      expect(calculateBMIGrade('thin')).toBe(3);
      expect(calculateBMIGrade('normal')).toBe(1);
      expect(calculateBMIGrade('overweight')).toBe(3);
      expect(calculateBMIGrade('mild_obese')).toBe(4);
      expect(calculateBMIGrade('severe_obese')).toBe(5);
    });
  });

  describe('generateResultSummary', () => {
    it('정상적인 결과 요약 생성', () => {
      const summary = generateResultSummary('중1', 'male', 170, 60, {
        shuttleRun: 70,
        pushUp: 25,
        sitUp: 45,
        grip: 40,
        sprint50m: 8.0,
        jump: 210,
        sitAndReach: 16,
      });

      expect(summary.grades).toBeDefined();
      expect(summary.grades.length).toBeGreaterThan(0);
      expect(summary.bmiCategory).toBeDefined();
      expect(summary.fitnessGroups).toBeDefined();
    });

    it('취약 영역 및 강점 영역 계산', () => {
      const summary = generateResultSummary('중1', 'male', 170, 60, {
        shuttleRun: 30, // 낮은 값 -> 낮은 등급
        pushUp: 35, // 높은 값 -> 높은 등급
        sitUp: 55, // 높은 값 -> 높은 등급
        grip: 20, // 낮은 값 -> 낮은 등급
        sprint50m: 9.5, // 느린 값 -> 낮은 등급
        jump: 150, // 낮은 값 -> 낮은 등급
        sitAndReach: 5, // 낮은 값 -> 낮은 등급
      });

      // 취약 영역이 있어야 함
      expect(summary.weakAreas.length).toBeGreaterThan(0);
      // 강점 영역이 있어야 함
      expect(summary.strongAreas.length).toBeGreaterThan(0);
    });

    it('체력 요소 그룹 점수 계산', () => {
      const summary = generateResultSummary('중1', 'male', 170, 60, {
        shuttleRun: 70,
        pushUp: 25,
        sitUp: 45,
        grip: 40,
        sprint50m: 8.0,
        jump: 210,
        sitAndReach: 16,
      });

      expect(summary.fitnessGroups.cardio).toBeGreaterThan(0);
      expect(summary.fitnessGroups.strength).toBeGreaterThan(0);
      expect(summary.fitnessGroups.endurance).toBeGreaterThan(0);
      expect(summary.fitnessGroups.flexibility).toBeGreaterThan(0);
      expect(summary.fitnessGroups.power).toBeGreaterThan(0);
    });
  });
});
