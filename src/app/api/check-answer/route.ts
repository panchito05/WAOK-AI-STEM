import { NextRequest, NextResponse } from 'next/server';
import { checkAnswerAction } from '@/app/actions';

export async function POST(request: NextRequest) {
  try {
    const { problem, correctAnswer, userAnswer, attemptNumber } = await request.json();

    const result = await checkAnswerAction(
      problem,
      correctAnswer,
      userAnswer,
      attemptNumber
    );

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error in check-answer route:', error);
    return NextResponse.json(
      { error: 'Failed to check answer' },
      { status: 500 }
    );
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}