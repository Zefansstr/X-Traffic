import { NextResponse } from 'next/server';
import connectDB from '@/lib/database';
import { Sales } from '@/lib/models/Sales';

export async function GET() {
  try {
    console.log('Testing sales API with ALL populate operations...');
    
    await connectDB();
    console.log('✅ Database connected');
    
    // Test ALL populate operations together (like in original route)
    try {
      const sales = await Sales.find({})
        .populate('staffId', 'name position')
        .populate('agentId', 'name')
        .populate('trafficId', 'name')
        .populate('deviceId', 'name')
        .populate('gameId', 'name')
        .sort({ createdAt: -1 });

      console.log('✅ All populate operations together work! Count:', sales.length);
      
      return NextResponse.json({ 
        success: true, 
        data: sales,
        message: `Found ${sales.length} sales records with all populate operations`
      });
    } catch (error) {
      console.log('❌ Combined populate failed:', error);
      return NextResponse.json({ 
        success: false, 
        error: 'Combined populate failed', 
        details: error instanceof Error ? error.message : 'Unknown error'
      }, { status: 500 });
    }
  } catch (error) {
    console.error('❌ General test failed:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'General test failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 