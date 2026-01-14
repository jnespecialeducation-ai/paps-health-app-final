# 🚀 웹 배포 가이드

이 가이드는 Vercel을 사용하여 웹앱을 공개 배포하는 방법을 설명합니다.

## 📋 사전 준비

1. **GitHub 계정** (필수)
2. **Vercel 계정** (무료로 가입 가능)
3. **PostgreSQL 데이터베이스** (무료 옵션: Neon, Supabase, Vercel Postgres)
4. **OpenAI API 키** (AI 추천 기능 사용 시, 선택사항)

---

## 1️⃣ GitHub에 코드 업로드

### 1-1. Git 초기화 (아직 안 했다면)

```bash
git init
git add .
git commit -m "Initial commit"
```

### 1-2. GitHub 저장소 생성 및 연결

1. [GitHub](https://github.com)에 로그인
2. "New repository" 클릭
3. 저장소 이름 입력 (예: `paps-health-app`)
4. "Create repository" 클릭
5. 생성된 저장소의 URL 복사

### 1-3. 코드 푸시

```bash
git remote add origin <your-github-repo-url>
git branch -M main
git push -u origin main
```

---

## 2️⃣ PostgreSQL 데이터베이스 생성

### 옵션 A: Neon (권장, 무료)

1. https://neon.tech 접속 → 회원가입
2. "Create Project" 클릭
3. 프로젝트 이름 입력 → "Create Project"
4. Dashboard에서 "Connection String" 복사
   - 예: `postgresql://user:password@ep-xxx.region.aws.neon.tech/dbname?sslmode=require`

### 옵션 B: Supabase (무료)

1. https://supabase.com 접속 → 회원가입
2. "New Project" 클릭
3. 프로젝트 생성 후 Settings → Database → Connection String 복사
   - "Connection pooling" 또는 "Direct connection" 선택 가능

### 옵션 C: Vercel Postgres (가장 간단)

1. Vercel 대시보드 → 프로젝트 → Storage 탭
2. "Create Database" → "Postgres" 선택
3. 자동으로 `DATABASE_URL` 환경 변수 생성됨

---

## 3️⃣ Vercel에 프로젝트 배포

### 3-1. Vercel 로그인 및 프로젝트 Import

1. https://vercel.com 접속 → 로그인 (GitHub 계정으로 로그인 권장)
2. "Add New Project" 클릭
3. GitHub 저장소 선택
4. 프로젝트 설정:
   - **Framework Preset**: Next.js (자동 감지됨)
   - **Root Directory**: `./` (기본값)
   - **Build Command**: `npm run build` (자동 설정됨)
   - **Output Directory**: `.next` (자동 설정됨)
   - **Install Command**: `npm install` (자동 설정됨)

### 3-2. 환경 변수 설정

Vercel 프로젝트 설정에서 "Environment Variables" 섹션으로 이동:

#### 필수 환경 변수

1. **DATABASE_URL**
   - Key: `DATABASE_URL`
   - Value: PostgreSQL 연결 문자열 (위에서 복사한 것)
   - 예: `postgresql://user:password@host:5432/database?schema=public`
   - **모든 환경**에 적용 (Production, Preview, Development)

#### 선택 환경 변수

2. **OPENAI_API_KEY** (AI 추천 기능 사용 시)
   - Key: `OPENAI_API_KEY`
   - Value: OpenAI API 키
   - https://platform.openai.com → API Keys → Create new secret key
   - **모든 환경**에 적용

3. **NEXT_PUBLIC_APP_URL** (선택사항)
   - Key: `NEXT_PUBLIC_APP_URL`
   - Value: 배포 후 자동으로 설정됨 (생략 가능)

### 3-3. 배포 실행

1. "Deploy" 버튼 클릭
2. 빌드 진행 상황 확인 (약 2-3분 소요)
3. ✅ 배포 완료!

---

## 4️⃣ 배포 확인

### 4-1. 공개 URL 확인

배포 완료 후:
- Vercel 대시보드 → 프로젝트 클릭
- "Domains" 섹션에서 URL 확인
- 예: `https://paps-health-app.vercel.app`

**🎉 이 URL을 공유하면 누구나 접속할 수 있습니다!**

### 4-2. 데이터베이스 마이그레이션 확인

배포 시 자동으로 다음이 실행됩니다:
1. `scripts/prepare-schema.js`: DATABASE_URL 확인 → PostgreSQL로 스키마 전환
2. `prisma generate`: Prisma 클라이언트 생성
3. `prisma migrate deploy`: 데이터베이스 테이블 생성
4. `next build`: Next.js 빌드

빌드 로그에서 다음 메시지를 확인하세요:
```
✅ Prisma 스키마가 postgresql로 설정되었습니다.
```

### 4-3. 애플리케이션 테스트

1. 배포된 URL로 접속
2. "새 학생 등록" 클릭
3. 학생 정보 입력 및 저장
4. 측정 데이터 입력
5. 결과 확인

---

## 5️⃣ 업데이트 배포

코드를 수정한 후:

```bash
git add .
git commit -m "Update features"
git push origin main
```

Vercel이 자동으로 새 버전을 배포합니다!

---

## ⚠️ 주의사항

### 데이터베이스

- **무료 플랜 제한**:
  - Neon: 512MB (무료)
  - Supabase: 500MB (무료)
  - Vercel Postgres: 제한 확인 필요
- **백업**: 중요한 데이터는 정기적으로 백업하세요

### API 키

- **OpenAI API**: 사용량에 따라 비용 발생
- **Rate Limiting**: AI 추천 기능에 1분당 1회 제한 적용됨

### 트래픽

- **Vercel 무료 플랜**: 월 100GB 대역폭 제공
- 초과 시 유료 플랜 필요

---

## 🆘 문제 해결

### 빌드 실패

1. Vercel → Deployments → 실패한 배포 → Logs 확인
2. 확인 사항:
   - `DATABASE_URL` 환경 변수가 올바른지
   - PostgreSQL 연결 문자열 형식이 맞는지
   - 빌드 로그에서 오류 메시지 확인

### 데이터베이스 연결 실패

1. `DATABASE_URL` 환경 변수 확인
2. PostgreSQL 데이터베이스가 실행 중인지 확인
3. 방화벽/네트워크 설정 확인 (Neon, Supabase는 자동 허용)

### Prisma 마이그레이션 실패

1. 빌드 로그에서 오류 확인
2. 수동으로 마이그레이션 실행:
   ```bash
   # Vercel CLI 설치
   npm i -g vercel
   
   # 로그인
   vercel login
   
   # 환경 변수 가져오기
   vercel env pull .env.local
   
   # 마이그레이션 실행
   npx prisma migrate deploy
   ```

### 스키마 자동 전환 실패

1. `scripts/prepare-schema.js` 파일이 있는지 확인
2. 빌드 로그에서 스크립트 실행 여부 확인
3. `DATABASE_URL`이 `postgresql://`로 시작하는지 확인

---

## 📞 추가 도움

문제가 계속되면:
1. Vercel 대시보드의 빌드 로그 확인
2. GitHub Issues에 문제 보고
3. Vercel 문서 참고: https://vercel.com/docs

---

## ✅ 체크리스트

배포 전 확인:

- [ ] GitHub에 코드 푸시 완료
- [ ] PostgreSQL 데이터베이스 생성 완료
- [ ] Vercel 프로젝트 생성 완료
- [ ] `DATABASE_URL` 환경 변수 설정 완료
- [ ] `OPENAI_API_KEY` 환경 변수 설정 완료 (선택사항)
- [ ] 첫 배포 성공 확인
- [ ] 공개 URL 접속 테스트 완료
- [ ] 데이터베이스 마이그레이션 확인 완료

---

**축하합니다! 🎉 웹앱이 성공적으로 배포되었습니다!**
