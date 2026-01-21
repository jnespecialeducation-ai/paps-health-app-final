# Neon 새 프로젝트 생성 가이드

## 새 프로젝트 만들기

### 1단계: New Project 버튼 클릭

현재 화면에서:
- 오른쪽 상단의 **"New project"** 버튼 클릭
- (흰색 배경에 검은색 텍스트 버튼)

### 2단계: 프로젝트 정보 입력

1. **프로젝트 이름 입력**
   - Project name: `paps-health` (또는 원하는 이름)
   - 예: `paps-health-app`, `student-health-db` 등

2. **Region 선택**
   - Region: **Seoul (ap-northeast-2)** 또는 **Tokyo (ap-northeast-1)** 선택
   - 한국에서 사용하시면 Seoul이 가장 빠릅니다
   - 또는 가장 가까운 지역 선택

3. **PostgreSQL 버전**
   - PostgreSQL version: `15` (기본값, 그대로 두면 됨)

4. **데이터베이스 이름** (선택사항)
   - Database name: 기본값 그대로 사용 가능
   - 또는 `paps_health` 등으로 변경 가능

### 3단계: 프로젝트 생성

- **"Create project"** 버튼 클릭
- 몇 초 정도 기다리면 프로젝트가 생성됩니다

### 4단계: Connection String 복사

프로젝트가 생성되면:

1. **프로젝트 대시보드로 이동**
   - 자동으로 프로젝트 페이지로 이동합니다

2. **Connection String 찾기**
   - 화면 상단 또는 중앙에 "Connection String" 섹션이 보입니다
   - 또는 "Connect" 버튼 클릭

3. **복사 버튼 클릭**
   - Connection String 옆의 **복사 아이콘** 클릭
   - 형식: `postgresql://user:password@ep-xxx-xxx.region.neon.tech/dbname?sslmode=require`

4. **메모장에 저장**
   - 복사한 Connection String을 메모장에 붙여넣어 저장
   - ⚠️ **이 문자열을 안전하게 보관하세요!**

---

## 다음 단계

Connection String을 복사했다면:
1. Vercel 배포로 진행
2. 환경 변수 `DATABASE_URL`에 붙여넣기

---

## 참고사항

- **무료 플랜**: Neon 무료 플랜은 충분히 사용 가능합니다
- **데이터베이스 크기**: 무료 플랜은 약 500MB 제공
- **백업**: 자동으로 백업됩니다
