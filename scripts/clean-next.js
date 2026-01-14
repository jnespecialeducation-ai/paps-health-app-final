/**
 * Next.js 빌드 폴더(.next)를 정리하는 스크립트
 * Windows OneDrive 환경에서 발생하는 심볼릭 링크 오류를 방지합니다.
 */

const fs = require('fs');
const path = require('path');

const nextPath = path.join(__dirname, '..', '.next');

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function cleanNextFolder() {
  try {
    console.log('🧹 Next.js 빌드 폴더 정리 중...');

    if (!fs.existsSync(nextPath)) {
      console.log('✅ .next 폴더가 없습니다. 건너뜁니다.');
      return true;
    }

    // 재시도 로직으로 삭제 시도
    let retries = 3;
    while (retries > 0) {
      try {
        // Windows에서 심볼릭 링크 문제를 피하기 위해 재귀적으로 삭제
        fs.rmSync(nextPath, { recursive: true, force: true });
        await sleep(200);
        console.log('✅ .next 폴더 정리 완료');
        return true;
      } catch (error) {
        retries--;
        if (retries > 0) {
          console.log(`⚠️  삭제 재시도 중... (${retries}회 남음)`);
          await sleep(500);
        } else {
          console.log('⚠️  .next 폴더 삭제 실패 (계속 진행)');
          console.log('   OneDrive 동기화를 일시 중지하거나 프로젝트를 OneDrive 외부로 이동하세요.');
          return false;
        }
      }
    }
  } catch (error) {
    console.error('❌ .next 폴더 정리 중 오류:', error.message);
    return false;
  }
}

// 직접 실행 시
if (require.main === module) {
  (async () => {
    try {
      await cleanNextFolder();
      // 확실히 종료되도록 짧은 대기 후 종료
      await sleep(100);
      process.exit(0);
    } catch (error) {
      console.error('스크립트 실행 오류:', error);
      process.exit(1);
    }
  })();
}

module.exports = { cleanNextFolder };
