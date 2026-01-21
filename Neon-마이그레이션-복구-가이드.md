# Neon 데이터베이스 마이그레이션 복구 가이드

## 현재 문제
- P3009 오류: 이전 마이그레이션이 실패한 상태로 데이터베이스에 남아있음
- 실패한 마이그레이션: `20260113060855_init`

## 해결 방법

### 방법 1: Neon SQL Editor에서 수동 복구 (권장)

1. **Neon 대시보드 접속**
   - https://console.neon.tech 접속
   - 프로젝트 `paps-health-db` 선택

2. **SQL Editor 열기**
   - 왼쪽 사이드바에서 "SQL Editor" 클릭
   - 또는 상단 메뉴에서 "SQL Editor" 찾기

3. **실패한 마이그레이션 확인**
   ```sql
   SELECT * FROM "_prisma_migrations";
   ```

4. **실패한 마이그레이션 삭제**
   ```sql
   DELETE FROM "_prisma_migrations" 
   WHERE migration_name = '20260113060855_init';
   ```

5. **확인**
   ```sql
   SELECT * FROM "_prisma_migrations";
   ```
   - 결과가 비어있거나 다른 마이그레이션만 있어야 합니다

6. **Vercel에서 재배포**
   - Vercel 대시보드로 돌아가기
   - "Redeploy" 클릭

---

### 방법 2: 데이터베이스 초기화 (모든 데이터 삭제)

⚠️ **주의**: 이 방법은 모든 데이터를 삭제합니다!

1. **Neon 대시보드 접속**
   - 프로젝트 `paps-health-db` 선택

2. **데이터베이스 초기화**
   - "Settings" → "Reset Database" 또는
   - "Branches" → 새 브랜치 생성 후 기존 브랜치 삭제

3. **Vercel에서 재배포**

---

### 방법 3: Prisma migrate resolve 사용

로컬에서 Vercel 환경 변수를 가져와서 실행:

```bash
# Vercel CLI 설치 (없는 경우)
npm i -g vercel

# Vercel 로그인
vercel login

# 환경 변수 가져오기
vercel env pull .env.local

# 실패한 마이그레이션 해결
npx prisma migrate resolve --applied 20260113060855_init

# 또는 실패로 표시
npx prisma migrate resolve --rolled-back 20260113060855_init
```

---

## 추천 방법

**방법 1 (SQL Editor)**을 추천합니다:
- 가장 빠르고 안전함
- 데이터 손실 없음
- 간단한 SQL 명령어만 실행

---

## 재배포 후 확인

1. Vercel에서 "Redeploy" 클릭
2. Build Logs 확인:
   - ✅ Migration applied successfully
   - ✅ Build completed
