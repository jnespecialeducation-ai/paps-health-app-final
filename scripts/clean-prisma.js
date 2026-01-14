/**
 * Prisma 클라이언트 생성 전 잠긴 파일들을 정리하는 스크립트
 * Windows OneDrive 환경에서 발생하는 EPERM 오류를 방지합니다.
 */

const fs = require('fs');
const path = require('path');
const { execSync, spawn } = require('child_process');
const os = require('os');

const prismaClientPath = path.join(__dirname, '..', 'node_modules', '.prisma', 'client');
const prismaPath = path.join(__dirname, '..', 'node_modules', '.prisma');

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function killNodeProcesses() {
  try {
    const currentPid = process.pid;
    const parentPid = process.ppid;
    const allPids = new Set([currentPid, parentPid]);
    
    if (os.platform() === 'win32') {
      // Windows: 현재 프로세스와 부모 프로세스를 제외하고 종료
      try {
        // tasklist로 모든 node.exe 프로세스의 PID를 가져온 후 필터링
        const tasklistOutput = execSync('tasklist /FI "IMAGENAME eq node.exe" /FO CSV /NH', { encoding: 'utf-8', stdio: 'pipe' });
        const lines = tasklistOutput.split('\n').filter(line => line.trim());
        let killedCount = 0;
        
        for (const line of lines) {
          const match = line.match(/"node\.exe","(\d+)"/);
          if (match) {
            const pid = parseInt(match[1]);
            // 현재 프로세스와 부모 프로세스는 제외
            if (!allPids.has(pid)) {
              try {
                execSync(`taskkill /F /PID ${pid} /T 2>nul`, { stdio: 'ignore' });
                killedCount++;
              } catch (e) {
                // 개별 프로세스 종료 실패는 무시
              }
            }
          }
        }
        
        if (killedCount > 0) {
          console.log(`🔄 ${killedCount}개의 다른 Node.js 프로세스 종료 완료`);
        }
      } catch (e) {
        // 프로세스가 없거나 명령 실행 실패는 무시
      }
    } else {
      // Unix/Linux/Mac: 현재 프로세스와 부모 프로세스를 제외하고 종료
      try {
        execSync(`pkill -9 -P ${parentPid} node 2>/dev/null || true`, { stdio: 'ignore' });
      } catch (e) {
        // 프로세스가 없으면 무시
      }
    }
  } catch (e) {
    // 무시
  }
}

async function forceDeleteFile(filePath, retries = 5) {
  for (let i = 0; i < retries; i++) {
    try {
      if (fs.existsSync(filePath)) {
        const stats = fs.statSync(filePath);
        if (stats.isFile()) {
          // 파일 속성을 일반으로 변경 (읽기 전용 해제)
          try {
            if (os.platform() === 'win32') {
              execSync(`attrib -R "${filePath}" 2>nul`, { stdio: 'ignore' });
            }
          } catch (e) {
            // 속성 변경 실패는 무시
          }
          fs.unlinkSync(filePath);
          return true;
        } else if (stats.isDirectory()) {
          fs.rmSync(filePath, { recursive: true, force: true });
          return true;
        }
      }
      return true;
    } catch (e) {
      if (i < retries - 1) {
        await sleep(300 * (i + 1)); // 재시도할수록 더 오래 대기
      } else {
        return false;
      }
    }
  }
  return false;
}

async function cleanPrismaFiles() {
  try {
    console.log('🧹 Prisma 파일 정리 중...');

    // Node.js 프로세스 종료는 건너뛰기 (멈춤 방지)
    // 필요시 수동으로 taskkill /F /IM node.exe 실행

    // 2. .prisma/client 폴더 전체 삭제 (간단하게)
    if (fs.existsSync(prismaClientPath)) {
      console.log('   - .prisma/client 폴더 삭제 중...');
      try {
        fs.rmSync(prismaClientPath, { recursive: true, force: true });
      } catch (e) {
        console.log('   ⚠️  .prisma/client 폴더 삭제 실패 (계속 진행)');
      }
    } else {
      console.log('   - .prisma/client 폴더가 없습니다.');
    }

    // 3. .prisma 폴더의 query_engine 파일들 삭제 (간단하게)
    if (fs.existsSync(prismaPath)) {
      try {
        const entries = fs.readdirSync(prismaPath, { withFileTypes: true });
        for (const entry of entries) {
          const filePath = path.join(prismaPath, entry.name);
          // query_engine 관련 파일과 임시 파일 모두 삭제
          if (entry.name.includes('query_engine') || 
              entry.name.endsWith('.tmp') || 
              entry.name.endsWith('.node')) {
            try {
              fs.unlinkSync(filePath);
            } catch (e) {
              // 개별 파일 삭제 실패는 무시하고 계속 진행
            }
          }
        }
      } catch (e) {
        // 읽기 실패는 무시
      }
    }

    console.log('✅ Prisma 파일 정리 완료');
    return true;
  } catch (error) {
    console.error('❌ Prisma 파일 정리 중 오류:', error.message);
    // 오류가 발생해도 계속 진행
    return false;
  }
}

// 직접 실행 시
if (require.main === module) {
  (async () => {
    try {
      // 타임아웃 설정: 최대 1초 안에 완료되어야 함
      const timeoutPromise = new Promise((resolve) => 
        setTimeout(() => {
          console.log('⚠️  Prisma 파일 정리 시간 초과 (계속 진행)');
          resolve();
        }, 1000)
      );
      
      await Promise.race([
        cleanPrismaFiles(),
        timeoutPromise
      ]);
      
      process.exit(0);
    } catch (error) {
      // 오류가 있어도 exit code 0으로 종료 (다음 단계 계속 진행)
      process.exit(0);
    }
  })();
}

module.exports = { cleanPrismaFiles };
