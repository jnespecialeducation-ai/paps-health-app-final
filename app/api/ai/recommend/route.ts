import { NextRequest, NextResponse } from 'next/server';
import { generateAIRecommendation, generateRuleBasedRecommendation } from '@/lib/ai-recommendation';
import type { RecommendationRequest } from '@/lib/ai-recommendation';
import { prisma } from '@/lib/db';

// 간단한 Rate Limiting (메모리 기반, 프로덕션에서는 Redis 등 사용 권장)
const rateLimitMap = new Map<string, number>();
const RATE_LIMIT_WINDOW = 60 * 1000; // 1분
const RATE_LIMIT_MAX = 1; // 1분당 1회

function checkRateLimit(identifier: string): boolean {
  const now = Date.now();
  const lastRequest = rateLimitMap.get(identifier);

  if (!lastRequest || now - lastRequest > RATE_LIMIT_WINDOW) {
    rateLimitMap.set(identifier, now);
    return true;
  }

  return false;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      sessionId,
      grade,
      sex,
      grades,
      weakAreas,
      strongAreas,
      bmiCategory,
      fitnessGroups,
    } = body as RecommendationRequest & { sessionId?: string };

    // Rate limiting (IP 기반)
    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
    if (!checkRateLimit(ip)) {
      return NextResponse.json(
        { error: '요청이 너무 빈번합니다. 1분 후 다시 시도해주세요.' },
        { status: 429 }
      );
    }

    // 세션 ID가 있으면 캐시된 추천 확인 (forceRefresh 파라미터로 강제 새로고침 가능)
    const forceRefresh = body.forceRefresh === true;
    
    if (sessionId && !forceRefresh) {
      const session = await prisma.measurementSession.findUnique({
        where: { id: sessionId },
        select: { aiRecommendation: true },
      });

      if (session?.aiRecommendation) {
        return NextResponse.json({
          recommendation: session.aiRecommendation,
          cached: true,
        });
      }
    }

    // 요청 데이터 검증
    if (!grade || !sex || !grades || !bmiCategory) {
      return NextResponse.json(
        { error: '필수 데이터가 누락되었습니다.' },
        { status: 400 }
      );
    }

    const recommendationRequest: RecommendationRequest = {
      grade,
      sex,
      grades,
      weakAreas: weakAreas || [],
      strongAreas: strongAreas || [],
      bmiCategory,
      fitnessGroups: fitnessGroups || {
        cardio: 0,
        flexibility: 0,
        strengthEndurance: 0,
        power: 0,
        obesity: 0,
      },
    };

    // OpenAI API 키 확인
    const apiKey = process.env.OPENAI_API_KEY;

    // AI 추천 생성 (실패 시 룰 기반으로 폴백)
    const recommendation = await generateAIRecommendation(recommendationRequest, apiKey);

    // 세션 ID가 있으면 추천 저장
    if (sessionId) {
      try {
        await prisma.measurementSession.update({
          where: { id: sessionId },
          data: { aiRecommendation: recommendation },
        });
      } catch (error) {
        console.error('추천 저장 실패:', error);
        // 저장 실패해도 추천은 반환
      }
    }

    return NextResponse.json({
      recommendation,
      cached: false,
    });
  } catch (error) {
    console.error('AI 추천 API 오류:', error);
    return NextResponse.json(
      { error: '추천 생성 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
