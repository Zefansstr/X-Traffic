import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET() {
  try {
    console.log('🔍 Health check starting...');
    
    // Test basic connection
    const { data: health, error: healthError } = await supabase
      .from('staff')
      .select('count')
      .limit(1);
    
    if (healthError) {
      console.error('❌ Basic connection failed:', healthError);
      return NextResponse.json({
        success: false,
        error: 'Database connection failed',
        details: healthError.message
      }, { status: 500 });
    }
    
    console.log('✅ Basic connection OK');
    
    // Test sales table structure
    try {
      const { data: salesStructure, error: salesError } = await supabase
        .from('sales')
        .select('*')
        .limit(1);
      
      if (salesError) {
        console.error('❌ Sales table error:', salesError);
        return NextResponse.json({
          success: false,
          error: 'Sales table not accessible',
          details: salesError.message,
          suggestion: 'Table might not exist or have wrong structure'
        }, { status: 500 });
      }
      
      console.log('✅ Sales table accessible, sample data:', salesStructure);
      
      // Test other required tables
      const tableTests = await Promise.all([
        supabase.from('staff').select('id, name').limit(1),
        supabase.from('agents').select('id, name').limit(1),
        supabase.from('departments').select('id, name').limit(1),
        supabase.from('traffic').select('id, name').limit(1),
        supabase.from('devices').select('id, name').limit(1),
        supabase.from('games').select('id, name').limit(1)
      ]);
      
      const tableStatus = {
        staff: tableTests[0].error ? 'ERROR' : 'OK',
        agents: tableTests[1].error ? 'ERROR' : 'OK',
        departments: tableTests[2].error ? 'ERROR' : 'OK',
        traffic: tableTests[3].error ? 'ERROR' : 'OK',
        devices: tableTests[4].error ? 'ERROR' : 'OK',
        games: tableTests[5].error ? 'ERROR' : 'OK'
      };
      
      console.log('📊 Table status:', tableStatus);
      
      return NextResponse.json({
        success: true,
        message: 'Database health check completed',
        tableStatus,
        salesTableSample: salesStructure,
        timestamp: new Date().toISOString()
      });
      
    } catch (salesErr) {
      console.error('❌ Sales table test failed:', salesErr);
      return NextResponse.json({
        success: false,
        error: 'Sales table test failed',
        details: salesErr instanceof Error ? salesErr.message : 'Unknown error'
      }, { status: 500 });
    }
    
  } catch (error) {
    console.error('❌ Health check failed:', error);
    return NextResponse.json({
      success: false,
      error: 'Health check failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 