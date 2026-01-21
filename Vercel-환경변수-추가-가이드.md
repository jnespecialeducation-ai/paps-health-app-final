# Vercel 환경 변수 추가 가이드

## 현재 설정 중인 환경 변수

### 1. DATABASE_URL (필수)
```
Name: DATABASE_URL
Value: postgresql://neondb_owner:npg_GUcSvxo9Q4fI@ep-cool-sun-ahv32tfd-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require
Environment: Production, Preview, Development 모두 체크
```

### 2. OPENAI_API_KEY (선택사항 - AI 추천 기능용)

#### OpenAI API 키가 있는 경우:

1. **환경 변수 추가**
   - "Add" 또는 "+" 버튼을 다시 클릭
   - 다음 정보 입력:
   
   ```
   Name: OPENAI_API_KEY
   Value: (OpenAI API 키를 여기에 붙여넣기)
   Environment: Production, Preview, Development 모두 체크
   ```

2. **OpenAI API 키 얻는 방법** (없는 경우)
   - https://platform.openai.com 접속
   - 계정 생성 또는 로그인
   - API Keys 메뉴 클릭
   - "Create new secret key" 클릭
   - 키 이름 입력 (예: "paps-health-app")
   - 생성된 키 복사 (한 번만 표시되므로 안전하게 저장)

#### OpenAI API 키가 없는 경우:

- **생략 가능**: AI 추천 기능을 사용하지 않으면 이 변수는 추가하지 않아도 됩니다
- 웹사이트는 정상 작동하지만, AI 추천 기능만 사용할 수 없습니다

---

## 환경 변수 설정 순서

1. **DATABASE_URL 추가**
   - Name: `DATABASE_URL`
   - Value: (위의 PostgreSQL 연결 문자열)
   - Environment: 모두 체크
   - "Save" 클릭

2. **OPENAI_API_KEY 추가** (선택사항)
   - "Add" 또는 "+" 버튼 다시 클릭
   - Name: `OPENAI_API_KEY`
   - Value: (OpenAI API 키)
   - Environment: 모두 체크
   - "Save" 클릭

3. **모든 환경 변수 확인**
   - 설정한 환경 변수 목록 확인
   - DATABASE_URL과 OPENAI_API_KEY가 모두 있는지 확인

4. **배포 시작**
   - "Deploy" 버튼 클릭

---

## ⚠️ 주의사항

1. **API 키 보안**
   - OpenAI API 키는 절대 GitHub에 올리지 마세요
   - `.env` 파일은 `.gitignore`에 포함되어 있습니다
   - Vercel 환경 변수에만 설정하세요

2. **비용**
   - OpenAI API는 사용량에 따라 비용이 발생합니다
   - 무료 크레딧이 제공되지만, 사용량이 많으면 비용이 발생할 수 있습니다
   - OpenAI 대시보드에서 사용량을 확인할 수 있습니다

3. **AI 기능 없이 사용**
   - OPENAI_API_KEY를 설정하지 않아도 웹사이트는 정상 작동합니다
   - 다만 AI 추천 기능만 사용할 수 없습니다
   - 학생 등록, 측정 입력, 결과 확인 등 모든 기본 기능은 정상 작동합니다

---

## 배포 후 확인

배포가 완료되면:
1. 웹사이트 접속 테스트
2. 학생 등록 및 측정 입력 테스트
3. AI 추천 기능 테스트 (OPENAI_API_KEY를 설정한 경우)
