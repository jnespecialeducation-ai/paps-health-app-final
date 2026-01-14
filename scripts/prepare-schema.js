/**
 * Prisma 스키마를 DATABASE_URL 환경 변수에 따라 자동으로 준비하는 스크립트
 * - DATABASE_URL이 postgresql://로 시작하면 PostgreSQL 사용
 * - DATABASE_URL이 file:로 시작하면 SQLite 사용
 */

const fs = require('fs');
const path = require('path');

const schemaPath = path.join(__dirname, '..', 'prisma', 'schema.prisma');
const migrationLockPath = path.join(__dirname, '..', 'prisma', 'migrations', 'migration_lock.toml');
const schemaContent = fs.readFileSync(schemaPath, 'utf-8');

// DATABASE_URL 확인
const databaseUrl = process.env.DATABASE_URL || 'file:./prisma/dev.db';

let provider = 'sqlite'; // 기본값
if (databaseUrl.startsWith('postgresql://') || databaseUrl.startsWith('postgres://')) {
  provider = 'postgresql';
} else if (databaseUrl.startsWith('file:')) {
  provider = 'sqlite';
}

// 스키마 파일에서 datasource provider 찾아서 교체
// 정규식으로 더 확실하게 교체
const datasourceRegex = /datasource\s+db\s*\{[^}]*\}/s;
const newDatasource = `datasource db {
  provider = "${provider}"
  url      = env("DATABASE_URL")
}`;

let updatedContent = schemaContent;
if (datasourceRegex.test(schemaContent)) {
  updatedContent = schemaContent.replace(datasourceRegex, newDatasource);
} else {
  // 정규식이 실패하면 라인별로 처리
  const lines = schemaContent.split('\n');
  let datasourceStart = -1;
  let datasourceEnd = -1;
  let braceCount = 0;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (line.trim().startsWith('datasource db')) {
      datasourceStart = i;
      braceCount = (line.match(/\{/g) || []).length - (line.match(/\}/g) || []).length;
    } else if (datasourceStart >= 0) {
      braceCount += (line.match(/\{/g) || []).length - (line.match(/\}/g) || []).length;
      if (braceCount === 0) {
        datasourceEnd = i;
        break;
      }
    }
  }
  
  if (datasourceStart >= 0 && datasourceEnd >= 0) {
    const before = lines.slice(0, datasourceStart).join('\n');
    const after = lines.slice(datasourceEnd + 1).join('\n');
    updatedContent = before + '\n' + newDatasource + '\n' + after;
  }
}

fs.writeFileSync(schemaPath, updatedContent, 'utf-8');

// migration_lock.toml도 업데이트
if (fs.existsSync(migrationLockPath)) {
  const lockContent = fs.readFileSync(migrationLockPath, 'utf-8');
  const updatedLockContent = lockContent.replace(
    /provider\s*=\s*["']?[^"'\s]+["']?/,
    `provider = "${provider}"`
  );
  fs.writeFileSync(migrationLockPath, updatedLockContent, 'utf-8');
}

console.log(`✅ Prisma 스키마가 ${provider}로 설정되었습니다.`);
console.log(`   DATABASE_URL: ${databaseUrl.substring(0, 20)}...`);
