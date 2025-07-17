import { NextRequest, NextResponse } from 'next/server';
import { supabase, handleSupabaseError } from '@/lib/supabase';
import { CommissionRate } from '@/lib/models/CommissionRate';

export async function GET() {
  try {
    const { data: commissionRates, error } = await supabase
      .from('commission_rates')
      .select('*')
      .eq('is_active', true)
      .order('position', { ascending: true });

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json(handleSupabaseError(error), { status: 500 });
    }

    return NextResponse.json({ success: true, data: commissionRates });
  } catch (error) {
    console.error('Error fetching commission rates:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch commission rates' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { position, tmt_rate, crt_rate, kpi_target, depositor_target, is_active = true } = body;

    // Validate required fields
    if (!position || tmt_rate === undefined || crt_rate === undefined) {
      return NextResponse.json(
        { success: false, error: 'position, tmt_rate, and crt_rate are required' },
        { status: 400 }
      );
    }

    // Check if commission rate already exists for this position
    const { data: existingRate } = await supabase
      .from('commission_rates')
      .select('*')
      .eq('position', position)
      .single();

    if (existingRate) {
      // Update existing rate
      const { data: updatedRate, error } = await supabase
        .from('commission_rates')
        .update({
          tmt_rate,
          crt_rate,
          kpi_target,
          depositor_target,
          is_active,
          updated_at: new Date().toISOString()
        })
        .eq('id', existingRate.id)
        .select()
        .single();

      if (error) {
        return NextResponse.json(handleSupabaseError(error), { status: 500 });
      }

      return NextResponse.json({ success: true, data: updatedRate });
    } else {
      // Create new rate
      const { data: newRate, error } = await supabase
        .from('commission_rates')
        .insert([{
          position,
          tmt_rate,
          crt_rate,
          kpi_target,
          depositor_target,
          is_active
        }])
        .select()
        .single();

      if (error) {
        return NextResponse.json(handleSupabaseError(error), { status: 500 });
      }

      return NextResponse.json({ success: true, data: newRate }, { status: 201 });
    }
  } catch (error) {
    console.error('Error creating/updating commission rate:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create/update commission rate' },
      { status: 500 }
    );
  }
} 