# 🚀 공개 웹사이트 배포 가이드

이 프로젝트를 다른 사람들도 접속할 수 있는 공개 웹사이트로 배포하는 방법입니다.

## 📋 배포 전 준비사항

### 1. GitHub 저장소 생성

1. [GitHub](https://github.com)에 로그인
2. 새 저장소 생성 (예: `paps-health-app`)
3. 저장소 URL 복사

### 2. 코드를 GitHub에 푸시

터미널에서 다음 명령어 실행:

```bash
# Git 초기화 (아직 안 했다면)
git init

# 모든 파일 추가
git add .

# 커밋
git commit -m "Initial commit"

# GitHub 저장소 연결 (YOUR_REPO_URL을 실제 저장소 URL로 변경)
git remote add origin YOUR_REPO_URL

# 메인 브랜치로 푸시
git branch -M main
git push -u origin main
```

## 🌐 Vercel 배포 (가장 쉬운 방법)

### 1단계: Vercel 계정 생성

1. [Vercel](https://vercel.com) 접속
2. "Sign Up" 클릭
3. GitHub 계정으로 로그인 (권장)

### 2단계: 프로젝트 Import

1. Vercel 대시보드에서 "Add New..." → "Project" 클릭
2. GitHub 저장소 선택
3. "Import" 클릭

### 3단계: 프로젝트 설정

- **Framework Preset**: Next.js (자동 감지됨)
- **Root Directory**: `./` (기본값)
- **Build Command**: `npm run build` (자동 설정됨)
- **Output Directory**: `.next` (자동 설정됨)

**중요**: "Override" 버튼을 클릭하고 Build Command를 다음으로 변경:
```
prisma generate && prisma migrate deploy && next build
```

### 4단계: 환경 변수 설정

Vercel 대시보드에서 "Environment Variables" 섹션에 다음 변수 추가:

#### 필수 환경 변수

1. **DATABASE_URL** (PostgreSQL)
   - 무료 PostgreSQL 데이터베이스 생성:
     - **Neon** (권장): https://neon.tech
       - 회원가입 → 새 프로젝트 생성 → Connection String 복사
     - **Supabase**: https://supabase.com
       - 새 프로젝트 생성 → Settings → Database → Connection String 복사
     - **Vercel Postgres**: Vercel 대시보드에서 직접 생성 가능
   
   예시: `postgresql://user:password@host:5432/database?schema=public`

2. **OPENAI_API_KEY** (선택사항, AI 추천 기능 사용 시)
   - [OpenAI](https://platform.openai.com)에서 API 키 생성
   - AI 추천 기능을 사용하지 않으면 생략 가능

#### 선택 환경 변수

- **NEXT_PUBLIC_APP_URL**: 배포 후 자동으로 설정됨 (생략 가능)

### 5단계: Prisma 스키마 수정

배포 전에 `prisma/schema.prisma` 파일을 확인하세요. PostgreSQL을 사용하려면:

```prisma
datasource db {
  provider = "postgresql"  // 또는 "postgres"
  url      = env("DATABASE_URL")
}
```

현재는 SQLite로 설정되어 있지만, Vercel에서 `DATABASE_URL` 환경 변수를 PostgreSQL로 설정하면 자동으로 감지됩니다.

### 6단계: 배포 실행

1. Vercel에서 "Deploy" 버튼 클릭
2. 빌드 진행 상황 확인 (약 2-3분 소요)
3. 배포 완료 후 공개 URL 확인 (예: `https://your-app-name.vercel.app`)

### 7단계: 데이터베이스 마이그레이션

첫 배포 시 데이터베이스 테이블을 생성해야 합니다:

1. Vercel 대시보드 → 프로젝트 → Settings → Environment Variables
2. DATABASE_URL 확인
3. 로컬에서 다음 명령어 실행:

```bash
# Vercel CLI 설치 (아직 안 했다면)
npm i -g vercel

# Vercel 로그인
vercel login

# 환경 변수 가져오기
vercel env pull .env.local

# 마이그레이션 실행
npx prisma migrate deploy
```

또는 Vercel의 빌드 로그에서 자동으로 실행되는지 확인하세요.

## 🔗 공개 URL 확인

배포가 완료되면:
- Vercel 대시보드에서 프로젝트 클릭
- "Domains" 섹션에서 공개 URL 확인
- 예: `https://paps-health-app.vercel.app`

이 URL을 다른 사람들과 공유하면 누구나 접속할 수 있습니다!

## 🔄 업데이트 배포

코드를 수정한 후:

```bash
git add .
git commit -m "Update features"
git push origin main
```

Vercel이 자동으로 새 버전을 배포합니다.

## ⚠️ 주의사항

1. **데이터베이스**: 무료 플랜은 제한이 있을 수 있습니다 (Neon은 512MB, Supabase는 500MB)
2. **API 키**: OpenAI API 키는 비용이 발생할 수 있습니다
3. **트래픽**: Vercel 무료 플랜은 월 100GB 대역폭 제공

## 🆘 문제 해결

### 빌드 실패 시
- Vercel 대시보드 → 프로젝트 → Deployments → 실패한 배포 클릭 → Logs 확인

### 데이터베이스 연결 실패 시
- DATABASE_URL 환경 변수 확인
- PostgreSQL 데이터베이스가 실행 중인지 확인

### Prisma 오류 시
- `prisma generate` 명령어가 실행되는지 확인
- `package.json`의 `postinstall` 스크립트 확인

## 📞 도움이 필요하신가요?

문제가 발생하면 Vercel 문서를 참고하세요:
- https://vercel.com/docs
- https://vercel.com/docs/concepts/deployments/overview
