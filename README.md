# PAPS 건강체력평가 시스템

학생 건강체력평가(PAPS) 기준표에 따라 자동으로 등급을 산출하고, 체력 요소별 분석, 시각화 대시보드, 그리고 생성형 AI 기반 맞춤 추천을 제공하는 웹 애플리케이션입니다.

## 🎯 주요 기능

- **학생 프로필 관리**: 학년, 성별, 별칭 등 학생 정보 관리
- **측정 데이터 입력**: PAPS 기준표에 따른 체력 측정 항목 입력
- **자동 등급 산출**: 입력된 데이터를 기준표와 비교하여 자동으로 등급(1~5) 산출
- **체력 요소 분석**: 심폐지구력, 근력, 근지구력, 유연성, 순발력 그룹별 분석
- **시각화 대시보드**: 레이더 차트를 통한 체력 요소 시각화
- **AI 맞춤 추천**: OpenAI GPT를 활용한 개인 맞춤 운동 추천 (선택사항)
- **보안**: 개인정보 보호 및 API 키 보안 관리

## 🛠️ 기술 스택

- **프레임워크**: Next.js 14 (App Router)
- **언어**: TypeScript (strict mode)
- **스타일링**: Tailwind CSS
- **데이터베이스**: 
  - 로컬 개발: SQLite
  - 프로덕션: PostgreSQL (Neon/Supabase/Vercel Postgres 등)
- **ORM**: Prisma
- **차트**: Recharts
- **AI**: OpenAI API (GPT-4o-mini)
- **테스트**: Vitest

## 📁 프로젝트 구조

```
.
├── app/                          # Next.js App Router
│   ├── api/                      # API 라우트
│   │   ├── ai/
│   │   │   └── recommend/        # AI 추천 API
│   │   ├── students/             # 학생 관리 API
│   │   └── sessions/             # 측정 세션 API
│   ├── student/                  # 학생 관련 페이지
│   │   ├── new/                  # 새 학생 등록
│   │   └── [id]/                 # 학생 상세
│   │       ├── measure/          # 측정 입력
│   │       └── result/           # 결과 페이지
│   ├── layout.tsx                # 루트 레이아웃
│   ├── page.tsx                  # 홈 페이지
│   └── globals.css               # 전역 스타일
├── data/
│   └── paps_criteria.json        # PAPS 기준표 데이터
├── lib/                          # 핵심 로직
│   ├── __tests__/                # 테스트 파일
│   │   ├── paps.test.ts
│   │   └── ai-recommendation.test.ts
│   ├── paps.ts                   # PAPS 등급 산출 로직
│   ├── ai-recommendation.ts      # AI 추천 로직
│   └── db.ts                     # Prisma 클라이언트
├── prisma/
│   └── schema.prisma             # 데이터베이스 스키마
├── package.json
├── tsconfig.json
├── tailwind.config.ts
├── vitest.config.ts
└── README.md
```

## 🚀 시작하기

### 1. 의존성 설치

```bash
npm install
```

### 2. 환경 변수 설정

`.env` 파일을 생성하고 다음 변수를 설정하세요:

```env
# 로컬 개발용 (SQLite)
DATABASE_URL="file:./dev.db"

# 프로덕션용 (PostgreSQL) - 배포 시 설정
# DATABASE_URL="postgresql://user:password@host:5432/database?schema=public"

# OpenAI API 키 (AI 추천 기능 사용 시 필수)
OPENAI_API_KEY="your-openai-api-key-here"

# Next.js (선택사항)
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### 3. 데이터베이스 초기화

```bash
# Prisma 클라이언트 생성
npx prisma generate

# 마이그레이션 실행 (로컬 개발)
npx prisma migrate dev --name init

# 또는 SQLite 데이터베이스 직접 생성
npx prisma db push
```

### 4. 개발 서버 실행

```bash
npm run dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000)을 열어 확인하세요.

## 📊 데이터베이스 스키마

### Student
- `id`: UUID (기본 키)
- `grade`: 학년 (초4~고3)
- `sex`: 성별 (male | female)
- `nickname`: 별칭 (선택사항)
- `createdAt`, `updatedAt`: 타임스탬프

### MeasurementSession
- `id`: UUID (기본 키)
- `studentId`: 학생 ID (외래 키)
- `measuredAt`: 측정일시
- `heightCm`: 키 (cm)
- `weightKg`: 몸무게 (kg)
- `bmi`: BMI (계산값)
- `metricsJson`: 측정 항목값 (JSON)
- `resultJson`: 등급 및 요약 (JSON)
- `aiRecommendation`: AI 추천 (선택사항)
- `createdAt`, `updatedAt`: 타임스탬프

## 🔐 보안 및 개인정보 보호

### 보안 원칙
- **OpenAI API 키**: 절대 클라이언트에 노출하지 않음. 서버 Route Handler에서만 사용
- **개인정보 최소화**: AI 요청 시 개인식별정보(이름/학번/반/생년월일)를 전송하지 않음
- **데이터 전송**: AI로 보내는 정보는 등급/요약 중심으로 최소화
  - 예: `{학년, 성별, 항목별 등급(1~5), BMI 범주, 취약영역 TOP, 목표}`

### AI 추천 사용
- 학생이 'AI 추천 생성' 사용 여부를 토글로 선택 가능
- 안내 문구 표시: "개인정보는 전송되지 않습니다"
- Rate Limiting: IP/학생별 1분당 1회 제한
- 캐싱: 같은 세션에 대해 추천을 캐시하여 비용 절감

## 🧮 핵심 로직

### BMI 계산
```typescript
BMI = weightKg / (heightM^2)
```

### 등급 산출
- **higher 타입**: 값이 클수록 좋은 항목 (min 기준)
- **lower 타입**: 값이 작을수록 좋은 항목 (max 기준)
- **구간 밖 값**: 최고/최저 등급으로 클램프 처리

### 결과 요약
- 취약 영역 (등급 4~5) TOP 2
- 강점 영역 (등급 1~2) TOP 2
- 체력 요소 그룹별 점수화 (심폐/근력/근지구력/유연/순발력)

## 🤖 AI 추천 기능

### API 엔드포인트
`POST /api/ai/recommend`

### 요청 데이터
```json
{
  "sessionId": "uuid",
  "grade": "중1",
  "sex": "male",
  "grades": [{ "metric": "shuttleRun", "grade": 4 }],
  "weakAreas": [{ "metric": "shuttleRun", "grade": 4 }],
  "strongAreas": [{ "metric": "pushUp", "grade": 1 }],
  "bmiCategory": "normal",
  "fitnessGroups": { ... }
}
```

### 응답
```json
{
  "recommendation": "AI 생성 추천 텍스트",
  "cached": false
}
```

### 폴백
OpenAI API 호출 실패 시 룰 기반 추천(템플릿)으로 자동 폴백

## 🧪 테스트

```bash
# 테스트 실행
npm test

# 테스트 UI 모드
npm run test:ui
```

### 테스트 범위
- BMI 계산 함수
- 등급 산출 함수 (경계값 포함)
- 구간 밖 값 클램프 처리
- 결과 요약 생성
- AI 추천 폴백 동작

## 📦 빌드 및 배포

### 로컬 빌드

```bash
npm run build
npm start
```

### Vercel 배포

#### 1. GitHub에 코드 푸시

```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin <your-github-repo-url>
git push -u origin main
```

#### 2. Vercel에 프로젝트 Import

1. [Vercel](https://vercel.com)에 로그인
2. "Add New Project" 클릭
3. GitHub 저장소 선택
4. 프로젝트 설정:
   - Framework Preset: Next.js
   - Root Directory: `./`
   - Build Command: `npm run build`
   - Output Directory: `.next`

#### 3. 환경 변수 설정

Vercel 대시보드에서 다음 환경 변수를 설정:

- `DATABASE_URL`: PostgreSQL 연결 문자열
  - 예: `postgresql://user:password@host:5432/database?schema=public`
  - Neon, Supabase, Vercel Postgres 등 사용 가능
- `OPENAI_API_KEY`: OpenAI API 키
- `NEXT_PUBLIC_APP_URL`: 배포된 URL (선택사항)

#### 4. 데이터베이스 마이그레이션

Vercel 빌드 시 자동으로 `prisma migrate deploy`가 실행됩니다 (`package.json`의 `build` 스크립트 참조).

또는 수동으로 실행:

```bash
# Vercel CLI 사용
vercel env pull
npx prisma migrate deploy
```

#### 5. 배포 확인

배포가 완료되면 Vercel이 제공하는 공개 URL(예: `https://xxxx.vercel.app`)로 접속하여 확인하세요.

### 프로덕션 데이터베이스 설정

#### Prisma 스키마 수정

프로덕션 배포 시 `prisma/schema.prisma`의 `datasource`를 PostgreSQL로 변경:

```prisma
datasource db {
  provider = "postgresql"  // 또는 "postgresql"
  url      = env("DATABASE_URL")
}
```

또는 환경 변수 `DATABASE_URL`만 변경하면 Prisma가 자동으로 감지합니다.

#### 데이터베이스 제공업체 선택

- **Neon**: https://neon.tech
- **Supabase**: https://supabase.com
- **Vercel Postgres**: Vercel 대시보드에서 직접 생성 가능

## 📝 주요 파일 설명

### `/data/paps_criteria.json`
PAPS 기준표 데이터. 학년/성별별 측정 항목, 등급 기준값, BMI 기준값을 포함합니다.

### `/lib/paps.ts`
핵심 로직:
- `calculateBMI()`: BMI 계산
- `classifyBMI()`: BMI 범주 분류
- `calculateGrade()`: 등급 산출
- `generateResultSummary()`: 결과 요약 생성

### `/lib/ai-recommendation.ts`
AI 추천 로직:
- `generateAIRecommendation()`: OpenAI API 호출
- `generateRuleBasedRecommendation()`: 룰 기반 폴백

### `/app/api/ai/recommend/route.ts`
AI 추천 API 엔드포인트. Rate limiting 및 캐싱 포함.

## 🔧 개발 가이드

### 새로운 측정 항목 추가

1. `/data/paps_criteria.json`에 항목 추가
2. `availableMetrics`에 학년/성별별 항목 추가
3. `criteria`에 등급 기준값 추가
4. `metricType`에 항목 타입(higher/lower) 추가

### 기준표 업데이트

`/data/paps_criteria.json` 파일을 직접 수정하면 됩니다. 서버 재시작 후 반영됩니다.

## 📄 라이선스

이 프로젝트는 교육용으로 제작되었습니다.

## 🤝 기여

이슈 및 풀 리퀘스트를 환영합니다!

## 📞 문의

문제가 발생하거나 질문이 있으시면 이슈를 등록해주세요.
