/**
 * PAPS 기준표 JSON 파일의 TypeScript 타입 정의
 * 
 * 이 파일은 data/paps_criteria.json의 타입 안정성을 보장하기 위한 스키마입니다.
 * JSON 파일을 수정할 때 이 타입 정의를 참고하여 구조를 유지하세요.
 */

/**
 * 측정 항목 타입
 * - "higher": 값이 클수록 좋은 항목 (예: 왕복오래달리기 회수, 악력)
 * - "lower": 값이 작을수록 좋은 항목 (예: 50m 달리기 시간)
 * - "bmi": BMI는 별도 기준으로 분류
 */
export type MetricType = "higher" | "lower" | "bmi";

/**
 * 학년 타입
 * 초등학교 4~6학년, 중학교 1~3학년, 고등학교 1~3학년
 */
export type GradeLevel = "초4" | "초5" | "초6" | "중1" | "중2" | "중3" | "고1" | "고2" | "고3";

/**
 * 성별 타입
 */
export type Sex = "male" | "female";

/**
 * 등급 타입 (1~5)
 */
export type Grade = 1 | 2 | 3 | 4 | 5;

/**
 * 측정 항목 이름
 * 확장 가능: pushUp, sitUp, jump, sitAndReach, runWalk, stepTest 등 추가 가능
 */
export type MetricName = 
  | "shuttleRun"    // 왕복오래달리기
  | "sprint50m"     // 50m 달리기
  | "grip"          // 악력
  | "pushUp"        // 팔굽혀펴기 (확장용)
  | "sitUp"         // 윗몸일으키기 (확장용)
  | "jump"          // 제자리멀리뛰기 (확장용)
  | "sitAndReach"   // 앉아윗몸앞으로굽히기 (확장용)
  | "runWalk"       // 걷기/달리기 (확장용)
  | "stepTest"      // 스텝 테스트 (확장용)
  | "bmi";          // BMI

/**
 * 등급 기준값 (higher 타입용)
 * min: 이 값 이상이면 해당 등급
 */
export interface HigherCriterion {
  grade: Grade;
  min: number;
}

/**
 * 등급 기준값 (lower 타입용)
 * max: 이 값 이하면 해당 등급
 */
export interface LowerCriterion {
  grade: Grade;
  max: number;
}

/**
 * BMI 범주 기준값
 * - thinMax: 저체중 최대값
 * - normalMax: 정상 최대값
 * - overMax: 과체중 최대값
 * - obeseMax: 경도비만 최대값 (이 값 초과 시 고도비만)
 */
export interface BMICriteria {
  thinMax: number;
  normalMax: number;
  overMax: number;
  obeseMax: number;
}

/**
 * PAPS 기준표 전체 구조
 */
export interface PAPSCriteria {
  /**
   * 사용 가능한 측정 항목
   * 학년/성별별로 측정하는 항목 목록
   * UI에서 이 목록을 기반으로 입력 필드를 동적으로 생성
   */
  availableMetrics: {
    [sex in Sex]: {
      [grade in GradeLevel]?: MetricName[];
    };
  };

  /**
   * 측정 항목 타입
   * 각 항목이 "higher"(값이 클수록 좋음), "lower"(값이 작을수록 좋음), "bmi" 중 어느 것인지 정의
   */
  metricType: {
    [metric in MetricName]: MetricType;
  };

  /**
   * 등급 산출 기준
   * 학년/성별/항목별로 등급(1~5) 기준값 정의
   * - higher 타입: min 기준 (이 값 이상이면 해당 등급)
   * - lower 타입: max 기준 (이 값 이하면 해당 등급)
   * 
   * 배열은 등급이 높은 순서(1등급 -> 5등급)로 정렬되어야 함
   */
  criteria: {
    [sex in Sex]: {
      [grade in GradeLevel]?: {
        [metric in MetricName]?: HigherCriterion[] | LowerCriterion[];
      };
    };
  };

  /**
   * BMI 범주 기준
   * 학년/성별별로 BMI 범주(저체중/정상/과체중/경도비만/고도비만) 기준값 정의
   */
  bmiCriteria: {
    [sex in Sex]: {
      [grade in GradeLevel]?: BMICriteria;
    };
  };
}

/**
 * 사용 예시:
 * 
 * 1. 새로운 학년 추가:
 *    - availableMetrics.male["중2"] = ["shuttleRun", "sprint50m", "grip", "bmi"]
 *    - criteria.male["중2"] = { ... }
 *    - bmiCriteria.male["중2"] = { ... }
 * 
 * 2. 새로운 측정 항목 추가:
 *    - metricType["pushUp"] = "higher"
 *    - availableMetrics.male["중1"].push("pushUp")
 *    - criteria.male["중1"]["pushUp"] = [{ grade: 1, min: 30 }, ...]
 * 
 * 3. 기준값 수정:
 *    - criteria.male["중1"]["shuttleRun"][0].min = 85 (1등급 기준 상향)
 */
