import { NextRequest, NextResponse } from 'next/server';
import { generatePracticeSessionAction } from '@/app/actions';

export async function POST(request: NextRequest) {
  try {
    const card = await request.json();

    const result = await generatePracticeSessionAction(card);

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error in generate-practice route:', error);
    return NextResponse.json(
      { error: 'Failed to generate practice session' },
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