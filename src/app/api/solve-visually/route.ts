import { NextRequest, NextResponse } from 'next/server';
import { solveVisuallyAction } from '@/app/actions';

export async function POST(request: NextRequest) {
  try {
    const { photoDataUri } = await request.json();

    const result = await solveVisuallyAction(photoDataUri);

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error in solve-visually route:', error);
    return NextResponse.json(
      { error: 'Failed to solve problem visually' },
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