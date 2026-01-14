# 내 손안의 AI 체력 코치

학생 건강체력평가(PAPS) 시스템을 기반으로 한 AI 기반 체력 관리 웹 애플리케이션입니다.

## 🚀 빠른 시작

### 1. 의존성 설치

```bash
npm install
```

### 2. 환경 변수 설정

`.env` 파일을 생성하고 다음 내용을 추가하세요:

```env
DATABASE_URL="file:./prisma/dev.db"
OPENAI_API_KEY="your-openai-api-key-here"
```

### 3. 데이터베이스 초기화

```bash
npm run db:push
```

### 4. 개발 서버 실행

```bash
npm run dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000)을 열어 확인하세요.

---

## 🛠️ 문제 해결

### EPERM 오류 (Windows OneDrive 환경)

Windows에서 OneDrive 폴더 내에서 Prisma 파일 잠금 오류가 발생하는 경우:

#### 방법 1: 자동 정리 스크립트 사용 (권장)

개발 서버를 실행하기 전에:

```bash
npm run clean:prisma
```

또는 개발 서버 실행 시 자동으로 정리됩니다:

```bash
npm run dev
```

#### 방법 2: 수동 정리

1. **모든 Node.js 프로세스 종료**
   ```powershell
   taskkill /F /IM node.exe
   ```

2. **Prisma 캐시 삭제**
   ```powershell
   Remove-Item -Recurse -Force node_modules\.prisma
   ```

3. **개발 서버 재시작**
   ```bash
   npm run dev
   ```

#### 방법 3: OneDrive 동기화 일시 중지

1. 작업 표시줄의 OneDrive 아이콘 우클릭
2. "일시 중지 동기화" 선택
3. 개발 서버 실행

#### 방법 4: OneDrive 동기화 제외 설정 (권장)

OneDrive에서 `.prisma` 폴더를 동기화 제외 목록에 추가:

1. **OneDrive 설정 열기**
   - 작업 표시줄의 OneDrive 아이콘 우클릭 → "설정"
   - 또는 Windows 설정 → 계정 → 파일을 클라우드에 저장

2. **동기화 제외 폴더 추가**
   - "백업" 탭 → "폴더 관리"
   - 또는 "계정" 탭 → "폴더 선택"
   - 프로젝트 폴더의 `node_modules\.prisma` 폴더를 제외 목록에 추가

3. **또는 `.onedriveignore` 파일 생성** (프로젝트 루트에)
   ```
   node_modules/.prisma/
   .next/
   ```

#### 방법 5: 프로젝트를 OneDrive 외부로 이동 (근본 해결)

OneDrive 폴더에서 벗어나 로컬 폴더로 이동:

```powershell
# 예: C:\Projects\진짜
Move-Item "C:\Users\wh_ca\OneDrive\Desktop\진짜" "C:\Projects\진짜"
cd "C:\Projects\진짜"
npm run dev
```

**참고**: 프로젝트를 이동한 후 `.env` 파일을 다시 확인하세요.

#### 방법 6: 지속적인 오류 발생 시

여전히 오류가 발생한다면:

1. **개발 서버를 완전히 종료**
   ```powershell
   taskkill /F /IM node.exe
   ```

2. **강제 정리 실행**
   ```powershell
   npm run clean
   ```

3. **OneDrive 동기화 일시 중지** (5-10분)
   - 작업 표시줄 OneDrive 아이콘 → "일시 중지 동기화" → "2시간"

4. **개발 서버 재시작**
   ```powershell
   npm run dev
   ```

---

## 📁 프로젝트 구조

```
.
├── app/                    # Next.js App Router 페이지
│   ├── api/               # API 라우트 핸들러
│   │   ├── ai/           # AI 추천 API
│   │   ├── students/     # 학생 관리 API
│   │   └── sessions/     # 측정 세션 API
│   ├── student/          # 학생 관련 페이지
│   │   ├── [id]/        # 학생 상세 페이지
│   │   │   ├── measure/ # 측정 입력 페이지
│   │   │   └── result/  # 결과 페이지
│   │   └── new/         # 새 학생 등록
│   └── page.tsx          # 홈 페이지
├── data/                  # 데이터 파일
│   └── paps_criteria_full.json  # PAPS 평가 기준
├── lib/                   # 핵심 로직
│   ├── paps.ts           # PAPS 평가 로직
│   ├── ai-recommendation.ts  # AI 추천 로직
│   └── db.ts             # Prisma 클라이언트
├── prisma/                # Prisma 스키마 및 마이그레이션
│   └── schema.prisma     # 데이터베이스 스키마
└── scripts/              # 유틸리티 스크립트
    ├── prepare-schema.js # Prisma 스키마 자동 설정
    └── clean-prisma.js   # Prisma 파일 정리
```

---

## 🗄️ 데이터베이스

### 로컬 개발 (SQLite)

기본적으로 SQLite를 사용합니다. `prisma/dev.db` 파일이 자동으로 생성됩니다.

### 프로덕션 (PostgreSQL)

환경 변수 `DATABASE_URL`을 PostgreSQL 연결 문자열로 설정하면 자동으로 전환됩니다:

```env
DATABASE_URL="postgresql://user:password@host:5432/database"
```

---

## 🧪 테스트

```bash
npm test
```

UI 모드로 테스트:

```bash
npm run test:ui
```

---

## 📦 빌드 및 배포

### 프로덕션 빌드

```bash
npm run build
```

### 로컬에서 프로덕션 모드 실행

```bash
npm run build
npm start
```

### Vercel 배포

자세한 배포 가이드는 `DEPLOYMENT.md`를 참조하세요.

---

## 🔧 주요 스크립트

- `npm run dev` - 개발 서버 실행
- `npm run build` - 프로덕션 빌드
- `npm run start` - 프로덕션 서버 실행
- `npm run db:push` - 데이터베이스 스키마 동기화
- `npm run db:migrate` - 데이터베이스 마이그레이션
- `npm run clean:prisma` - Prisma 파일 정리
- `npm test` - 테스트 실행

---

## 📝 라이선스

이 프로젝트는 교육용으로 제작되었습니다.
