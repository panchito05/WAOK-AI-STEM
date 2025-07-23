import { NextRequest, NextResponse } from 'next/server';
import { generateExamplesForSingleLevelAction } from '@/app/actions';

export async function POST(request: NextRequest) {
  try {
    const { topic, level, customInstructions } = await request.json();

    if (!topic || !level) {
      return NextResponse.json(
        { error: 'Missing topic or level' },
        { status: 400 }
      );
    }

    const result = await generateExamplesForSingleLevelAction(topic, level, customInstructions);

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error in generate-single-level route:', error);
    return NextResponse.json(
      { error: 'Failed to generate examples' },
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