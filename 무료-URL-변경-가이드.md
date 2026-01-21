# 무료로 URL 변경하기

## 방법 1: Vercel 프로젝트 이름 변경 (가장 간단)

### 현재 URL
```
https://paps-health-app.vercel.app/
```

### 변경 방법

1. **Vercel 대시보드 접속**
   - https://vercel.com
   - 프로젝트 `paps-health-app` 선택

2. **Settings → General**
   - 상단 메뉴에서 "Settings" 클릭
   - 왼쪽 사이드바에서 "General" 클릭

3. **Project Name 변경**
   - "Project Name" 섹션 찾기
   - 현재: `paps-health-app`
   - 변경: `paps-health` (더 짧게)
   - "Save" 클릭

4. **새 도메인 확인**
   - 변경 후 새로운 기본 도메인이 생성됩니다
   - 예: `https://paps-health.vercel.app/`

### 제한사항
- ⚠️ 프로젝트 이름은 영문, 숫자, 하이픈(-)만 사용 가능
- ⚠️ 이미 사용 중인 이름은 사용 불가
- ⚠️ `.vercel.app` 도메인은 여전히 포함됨

---

## 방법 2: 무료 도메인 서비스 (비권장)

### Freenom (무료 도메인)
- https://www.freenom.com
- `.tk`, `.ml`, `.ga`, `.cf` 등 무료 도메인 제공
- ⚠️ **주의**: 신뢰성이 낮고, SEO에 불리할 수 있음
- ⚠️ 일부 국가에서 차단될 수 있음

### 사용 방법
1. Freenom에서 무료 도메인 등록
2. Vercel에서 커스텀 도메인으로 추가
3. DNS 설정

---

## 방법 3: GitHub Pages + 커스텀 도메인 (무료)

GitHub Pages는 무료로 커스텀 도메인을 지원하지만, Next.js 앱을 배포하기에는 제한이 있습니다.

---

## 추천 방법

**방법 1 (프로젝트 이름 변경)**을 추천합니다:
- ✅ 완전 무료
- ✅ 즉시 적용 가능
- ✅ 간단함

### 예시 변경

**현재:**
```
https://paps-health-app.vercel.app/
```

**변경 후:**
```
https://paps-health.vercel.app/
```

더 짧고 깔끔해집니다!

---

## 추가 팁

### 더 짧은 이름 시도
- `paps-health` ✅
- `paps` (너무 짧을 수 있음)
- `health-paps` ✅
- `paps-app` ✅

프로젝트 이름을 변경하면 자동으로 새로운 도메인이 생성됩니다.
