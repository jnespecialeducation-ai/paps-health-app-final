# 🚀 공개 웹사이트 배포 단계별 가이드

## ⚡ 빠른 시작 (5분)

### 1️⃣ GitHub에 코드 업로드

#### A. Git 설치 (아직 안 했다면)
- https://git-scm.com/download/win 다운로드 및 설치

#### B. GitHub 저장소 만들기
1. https://github.com 접속 → 로그인
2. 우측 상단 "+" → "New repository"
3. 저장소 이름 입력 (예: `paps-health-app`)
4. "Public" 선택
5. "Create repository" 클릭
6. 저장소 URL 복사 (예: `https://github.com/사용자명/paps-health-app`)

#### C. 코드 업로드
프로젝트 폴더에서 PowerShell 열기:

```powershell
# Git 초기화
git init

# 모든 파일 추가
git add .

# 커밋
git commit -m "Initial commit"

# GitHub 저장소 연결 (아래 URL을 본인 저장소로 변경!)
git remote add origin https://github.com/사용자명/저장소명.git

# 업로드
git branch -M main
git push -u origin main
```

**팁**: GitHub 인증이 필요하면 Personal Access Token을 사용하세요.
- GitHub → Settings → Developer settings → Personal access tokens → Generate new token

---

### 2️⃣ Vercel에 배포

#### A. Vercel 계정 만들기
1. https://vercel.com 접속
2. "Sign Up" → "Continue with GitHub" 클릭
3. GitHub 권한 승인

#### B. 프로젝트 Import
1. Vercel 대시보드 → "Add New..." → "Project"
2. 방금 만든 GitHub 저장소 선택
3. "Import" 클릭

#### C. 프로젝트 설정
- **Framework Preset**: Next.js (자동)
- **Root Directory**: `./` (기본값)
- **Build Command**: 클릭하여 수정
  ```
  prisma generate && prisma migrate deploy && next build
  ```
- **Output Directory**: `.next` (기본값)
- **Install Command**: `npm install` (기본값)

#### D. 환경 변수 설정 (중요!)

**1. DATABASE_URL (필수)**

무료 PostgreSQL 데이터베이스 생성:

**옵션 A: Neon (추천)**
1. https://neon.tech 접속 → 회원가입
2. "Create Project" 클릭
3. 프로젝트 이름 입력 → "Create Project"
4. "Connection String" 복사
5. Vercel → Environment Variables → `DATABASE_URL` 추가 → 값 붙여넣기

**옵션 B: Supabase**
1. https://supabase.com 접속 → 회원가입
2. "New Project" 클릭
3. 프로젝트 생성 후 Settings → Database → Connection String 복사
4. Vercel에 `DATABASE_URL`로 추가

**옵션 C: Vercel Postgres**
1. Vercel 대시보드 → 프로젝트 → Storage 탭
2. "Create Database" → "Postgres" 선택
3. 자동으로 `DATABASE_URL` 환경 변수 생성됨

**2. OPENAI_API_KEY (선택사항)**
- AI 추천 기능 사용 시만 필요
- https://platform.openai.com → API Keys → Create new secret key
- Vercel에 `OPENAI_API_KEY`로 추가

#### E. 배포 실행
1. "Deploy" 버튼 클릭
2. 2-3분 대기 (빌드 진행)
3. ✅ 배포 완료!

---

### 3️⃣ 공개 URL 확인

배포 완료 후:
- Vercel 대시보드 → 프로젝트 클릭
- "Domains" 섹션에서 URL 확인
- 예: `https://paps-health-app.vercel.app`

**🎉 이 URL을 공유하면 누구나 접속할 수 있습니다!**

---

## 🔄 업데이트 배포

코드를 수정한 후:

```powershell
git add .
git commit -m "Update features"
git push origin main
```

Vercel이 자동으로 새 버전을 배포합니다!

---

## ⚠️ 주의사항

1. **데이터베이스**: 무료 플랜은 용량 제한이 있습니다
   - Neon: 512MB (무료)
   - Supabase: 500MB (무료)
   - Vercel Postgres: 제한 확인 필요

2. **API 키**: OpenAI API는 사용량에 따라 비용이 발생합니다

3. **트래픽**: Vercel 무료 플랜은 월 100GB 대역폭 제공

---

## 🆘 문제 해결

### 빌드 실패
- Vercel → Deployments → 실패한 배포 → Logs 확인
- Build Command 확인: `prisma generate && prisma migrate deploy && next build`

### 데이터베이스 연결 실패
- DATABASE_URL 환경 변수 확인
- PostgreSQL 연결 문자열 형식 확인: `postgresql://user:password@host:5432/db?schema=public`

### Prisma 오류
- `prisma generate` 명령어가 실행되는지 확인
- Build Command에 포함되어 있는지 확인

---

## 📞 도움말

- Vercel 문서: https://vercel.com/docs
- Neon 가이드: https://neon.tech/docs
- Supabase 가이드: https://supabase.com/docs
