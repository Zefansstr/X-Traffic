import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET() {
  try {
    console.log('🔍 Debug sales table...');
    
    // Test 1: Basic sales table access
    console.log('Test 1: Basic table access');
    const { data: basicTest, error: basicError } = await supabase
      .from('sales')
      .select('count', { count: 'exact', head: true });
    
    if (basicError) {
      console.error('❌ Basic access failed:', basicError);
      return NextResponse.json({
        success: false,
        test: 'basic_access',
        error: basicError.message,
        code: basicError.code
      });
    }
    
    console.log('✅ Basic access OK, count:', basicTest);
    
    // Test 2: Simple select
    console.log('Test 2: Simple select');
    const { data: simpleData, error: simpleError } = await supabase
      .from('sales')
      .select('id, customer_name, amount')
      .limit(5);
    
    if (simpleError) {
      console.error('❌ Simple select failed:', simpleError);
      return NextResponse.json({
        success: false,
        test: 'simple_select',
        error: simpleError.message,
        basicAccessWorked: true
      });
    }
    
    console.log('✅ Simple select OK, data:', simpleData);
    
    // Test 3: Full select like in API
    console.log('Test 3: Full select like API');
    const { data: fullData, error: fullError } = await supabase
      .from('sales')
      .select(`
        id,
        customer_name,
        amount,
        department,
        staff_id,
        agent_id,
        traffic_id,
        device_id,
        game_id,
        notes,
        created_at,
        updated_at
      `)
      .limit(3);
    
    if (fullError) {
      console.error('❌ Full select failed:', fullError);
      return NextResponse.json({
        success: false,
        test: 'full_select',
        error: fullError.message,
        simpleSelectWorked: true
      });
    }
    
    console.log('✅ Full select OK, data:', fullData);
    
    return NextResponse.json({
      success: true,
      message: 'All sales table tests passed',
      tests: {
        basicAccess: 'PASS',
        simpleSelect: 'PASS', 
        fullSelect: 'PASS'
      },
      sampleData: fullData,
      totalCount: basicTest
    });
    
  } catch (error) {
    console.error('❌ Debug failed:', error);
    return NextResponse.json({
      success: false,
      error: 'Debug test failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
} 