import { NextRequest, NextResponse } from 'next/server';
import { generateExercisesAction } from '@/app/actions';

export async function POST(request: NextRequest) {
  try {
    const { level, topic } = await request.json();

    // Create FormData to match the action's expected input
    const formData = new FormData();
    formData.append('level', level);
    formData.append('topic', topic);

    const result = await generateExercisesAction(formData);

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error in generate-exercises route:', error);
    return NextResponse.json(
      { error: 'Failed to generate exercises' },
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