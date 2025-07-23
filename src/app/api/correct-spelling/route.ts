import { NextRequest, NextResponse } from 'next/server';
import { correctSpellingWithAIAction, correctSpellingAction } from '@/app/actions';

export async function POST(request: NextRequest) {
  try {
    const { text, useAI } = await request.json();

    const result = useAI 
      ? await correctSpellingWithAIAction(text)
      : await correctSpellingAction(text);

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error in correct-spelling route:', error);
    return NextResponse.json(
      { error: 'Failed to correct spelling' },
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