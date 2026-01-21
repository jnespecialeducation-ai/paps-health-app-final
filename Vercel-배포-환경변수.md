# Vercel 배포 - 환경 변수 설정 가이드

## 복사한 Connection String

```
postgresql://neondb_owner:npg_GUcSvxo9Q4fI@ep-cool-sun-ahv32tfd-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require
```

## Vercel 배포 단계

### 1단계: Vercel 접속 및 로그인

1. **Vercel 접속**
   - 브라우저에서 https://vercel.com 접속
   - "Sign Up" 또는 "Log In" 클릭

2. **GitHub로 로그인**
   - "Continue with GitHub" 클릭
   - GitHub 계정으로 로그인
   - Vercel이 GitHub 저장소에 접근할 수 있도록 권한 승인

### 2단계: 프로젝트 Import

1. **새 프로젝트 생성**
   - Vercel 대시보드에서 "Add New..." → "Project" 클릭
   - 또는 "New Project" 버튼 클릭

2. **GitHub 저장소 선택**
   - GitHub 저장소 목록에서 `paps-health-app` 찾기
   - 또는 검색: `jnespecialeducation-ai/paps-health-app`
   - 저장소 옆의 "Import" 버튼 클릭

### 3단계: 프로젝트 설정

1. **프로젝트 이름 확인**
   - Project Name: `paps-health-app` (또는 원하는 이름)
   - Framework Preset: `Next.js` (자동 감지됨)

2. **빌드 설정 확인**
   - Root Directory: `./` (기본값)
   - Build Command: `npm run build` (자동 설정됨)
   - Output Directory: `.next` (자동 설정됨)
   - Install Command: `npm install` (자동 설정됨)

### 4단계: 환경 변수 설정 (중요!)

1. **Environment Variables 섹션 찾기**
   - 프로젝트 설정 화면에서 "Environment Variables" 섹션 찾기
   - 또는 "Configure Project" 단계에서 환경 변수 추가 가능

2. **DATABASE_URL 추가**
   - "Add" 또는 "+" 버튼 클릭
   - 다음 정보 입력:
   
   ```
   Name: DATABASE_URL
   Value: postgresql://neondb_owner:npg_GUcSvxo9Q4fI@ep-cool-sun-ahv32tfd-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require
   ```
   
   - Environment: **Production, Preview, Development 모두 체크**
   - 또는 Production만 체크해도 됨

3. **OPENAI_API_KEY 추가** (선택사항)
   - AI 추천 기능을 사용하는 경우만 추가
   - Name: `OPENAI_API_KEY`
   - Value: (OpenAI API 키)
   - Environment: Production, Preview, Development 체크

4. **환경 변수 저장**
   - "Save" 또는 "Add" 버튼 클릭

### 5단계: 배포 시작

1. **Deploy 버튼 클릭**
   - 모든 설정 확인 후 "Deploy" 버튼 클릭

2. **배포 진행 확인**
   - 빌드 로그가 실시간으로 표시됨
   - 약 2-3분 소요
   - 진행 상황:
     - Installing dependencies...
     - Running build command...
     - Generating Prisma Client...
     - Running database migrations...
     - Building Next.js application...

3. **배포 완료**
   - "Congratulations!" 메시지 확인
   - 배포된 URL 확인 (예: `https://paps-health-app.vercel.app`)
   - "Visit" 버튼 클릭하여 웹사이트 확인

---

## ✅ 배포 확인

### 1. 웹사이트 접속 테스트

1. 배포된 URL로 접속
2. 홈페이지가 정상적으로 로드되는지 확인
3. "학생 목록" 페이지 확인

### 2. 기능 테스트

1. **학생 등록 테스트**
   - "새 학생 등록" 버튼 클릭
   - 학생 정보 입력 후 등록
   - 데이터가 저장되는지 확인

2. **측정 입력 테스트**
   - 등록한 학생 클릭
   - "새 측정 입력" 클릭
   - 측정 데이터 입력 후 저장
   - 결과 페이지 확인

---

## 🆘 문제 해결

### 빌드 실패 시

1. **Vercel 대시보드 확인**
   - Deployments → 실패한 배포 클릭
   - Logs 탭에서 오류 메시지 확인

2. **일반적인 오류**
   - `DATABASE_URL` 환경 변수가 설정되지 않음
   - Connection String 형식이 잘못됨
   - Prisma 마이그레이션 실패

3. **해결 방법**
   - 환경 변수 다시 확인
   - Connection String 전체 복사 확인
   - Vercel 대시보드에서 "Redeploy" 클릭

---

## 🎉 완료!

배포가 완료되면:
- 배포된 URL을 다른 사람들과 공유
- 예: `https://paps-health-app.vercel.app`
