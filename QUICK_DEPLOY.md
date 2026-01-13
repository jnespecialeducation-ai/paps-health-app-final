# 🚀 빠른 배포 가이드 (5분 안에 완료!)

이 가이드를 따라하면 누구나 접속할 수 있는 공개 웹사이트가 만들어집니다.

## 📝 배포 단계

### 1단계: GitHub에 코드 업로드 (필수)

#### Git 설치 확인
- Git이 설치되어 있지 않다면: https://git-scm.com/download/win 에서 다운로드

#### GitHub 저장소 만들기
1. https://github.com 접속 및 로그인
2. 우측 상단 "+" → "New repository" 클릭
3. 저장소 이름 입력 (예: `paps-health-app`)
4. "Public" 선택 (무료)
5. "Create repository" 클릭

#### 코드 업로드
프로젝트 폴더에서 PowerShell 또는 명령 프롬프트를 열고:

```bash
# Git 초기화
git init

# 모든 파일 추가
git add .

# 첫 커밋
git commit -m "Initial commit"

# GitHub 저장소 연결 (아래 URL을 본인의 저장소 URL로 변경!)
git remote add origin https://github.com/사용자명/저장소명.git

# 업로드
git branch -M main
git push -u origin main
```

**주의**: GitHub에 로그인 정보를 입력해야 할 수 있습니다.

---

### 2단계: Vercel에 배포 (가장 쉬움!)

#### Vercel 계정 만들기
1. https://vercel.com 접속
2. "Sign Up" 클릭
3. "Continue with GitHub" 선택 (GitHub 계정으로 로그인)

#### 프로젝트 배포
1. Vercel 대시보드에서 "Add New..." → "Project" 클릭
2. 방금 만든 GitHub 저장소 선택
3. "Import" 클릭

#### 프로젝트 설정
- **Framework Preset**: Next.js (자동 감지됨)
- **Root Directory**: `./` (기본값)
- **Build Command**: `prisma generate && prisma migrate deploy && next build` (중요!)
- **Output Directory**: `.next` (기본값)

**중요**: "Override" 버튼을 클릭하고 Build Command를 위와 같이 설정하세요!

#### 환경 변수 설정
"Environment Variables" 섹션에서 다음 변수 추가:

**1. DATABASE_URL (필수)**
- 무료 PostgreSQL 데이터베이스 생성:
  - **Neon** (추천): https://neon.tech
    1. 회원가입
    2. "Create Project" 클릭
    3. 프로젝트 이름 입력
    4. "Connection String" 복사
    5. Vercel에 `DATABASE_URL`로 추가
  - 또는 **Supabase**: https://supabase.com
  - 또는 **Vercel Postgres**: Vercel 대시보드에서 직접 생성 가능

**2. OPENAI_API_KEY (선택사항)**
- AI 추천 기능 사용 시만 필요
- https://platform.openai.com 에서 API 키 생성
- Vercel에 `OPENAI_API_KEY`로 추가

#### 배포 실행
1. "Deploy" 버튼 클릭
2. 2-3분 대기 (빌드 진행)
3. 배포 완료!

---

### 3단계: 공개 URL 확인

배포가 완료되면:
- Vercel 대시보드 → 프로젝트 클릭
- "Domains" 섹션에서 URL 확인
- 예: `https://paps-health-app.vercel.app`

**이 URL을 다른 사람들과 공유하면 누구나 접속할 수 있습니다!** 🎉

---

## 🔧 문제 해결

### 빌드 실패 시
- Vercel 대시보드 → 프로젝트 → Deployments → 실패한 배포 클릭 → Logs 확인
- Build Command가 올바른지 확인

### 데이터베이스 연결 실패 시
- DATABASE_URL 환경 변수가 올바른지 확인
- PostgreSQL 데이터베이스가 실행 중인지 확인

### Prisma 오류 시
- `prisma generate` 명령어가 실행되는지 확인
- Build Command에 `prisma generate && prisma migrate deploy` 포함 확인

---

## 📞 도움이 필요하신가요?

- Vercel 문서: https://vercel.com/docs
- Neon 가이드: https://neon.tech/docs
- Supabase 가이드: https://supabase.com/docs
