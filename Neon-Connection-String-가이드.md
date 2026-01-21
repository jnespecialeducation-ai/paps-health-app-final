# Neon Connection String 복사 방법

## 현재 상황
- ✅ 프로젝트 `paps-health-db`가 이미 생성되어 있습니다
- 이제 Connection String을 복사해야 합니다

## Connection String 복사 방법

### 방법 1: 프로젝트 클릭 후 복사 (추천)

1. **프로젝트 이름 클릭**
   - 화면에서 `paps-health-db` 프로젝트 이름을 클릭

2. **Connection Details 찾기**
   - 프로젝트 대시보드로 이동
   - "Connection Details" 또는 "Connection String" 섹션 찾기
   - 또는 "Connect" 버튼 클릭

3. **Connection String 복사**
   - "Connection String" 또는 "Connection URI" 옆의 복사 버튼 클릭
   - 형식: `postgresql://user:password@ep-xxx-xxx.region.neon.tech/dbname?sslmode=require`

### 방법 2: 프로젝트 설정에서 복사

1. **프로젝트 이름 클릭**
   - `paps-health-db` 클릭

2. **Settings 메뉴**
   - 왼쪽 사이드바에서 "Settings" 클릭
   - 또는 상단 메뉴에서 "Settings" 찾기

3. **Connection String 확인**
   - "Connection Details" 섹션에서 Connection String 확인
   - 복사 버튼 클릭

## ⚠️ 중요 사항

1. **전체 문자열 복사**
   - Connection String의 처음부터 끝까지 모두 복사
   - 예시: `postgresql://neondb_owner:npg_xxx@ep-xxx-xxx.us-east-1.aws.neon.tech/neondb?sslmode=require`

2. **안전하게 보관**
   - 이 문자열에는 비밀번호가 포함되어 있습니다
   - 메모장에 임시로 저장하거나 안전한 곳에 보관

3. **다음 단계**
   - 복사한 Connection String을 Vercel 환경 변수에 설정할 때 사용합니다
