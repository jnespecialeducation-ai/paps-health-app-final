/**
 * Prisma 스키마를 DATABASE_URL 환경 변수에 따라 자동으로 준비하는 스크립트
 * - DATABASE_URL이 postgresql://로 시작하면 PostgreSQL 사용
 * - DATABASE_URL이 file:로 시작하면 SQLite 사용
 */

const fs = require('fs');
const path = require('path');

const schemaPath = path.join(__dirname, '..', 'prisma', 'schema.prisma');
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
// 더 확실한 방법: 라인별로 처리
const lines = schemaContent.split('\n');
let inDatasource = false;
let datasourceStart = -1;
let datasourceEnd = -1;

for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  if (line.trim().startsWith('datasource db')) {
    inDatasource = true;
    datasourceStart = i;
  }
  if (inDatasource && line.trim() === '}') {
    datasourceEnd = i;
    break;
  }
}

let updatedContent = schemaContent;
if (datasourceStart >= 0 && datasourceEnd >= 0) {
  // datasource 블록 교체
  const before = lines.slice(0, datasourceStart).join('\n');
  const after = lines.slice(datasourceEnd + 1).join('\n');
  updatedContent = before + `\ndatasource db {
  provider = "${provider}"
  url      = env("DATABASE_URL")
}` + after;
}

fs.writeFileSync(schemaPath, updatedContent, 'utf-8');

console.log(`✅ Prisma 스키마가 ${provider}로 설정되었습니다.`);
console.log(`   DATABASE_URL: ${databaseUrl.substring(0, 20)}...`);
