import { NextRequest, NextResponse } from 'next/server';
import { supabase, handleSupabaseError } from '@/lib/supabase';
import { ExchangeRate } from '@/lib/models/ExchangeRate';

export async function GET() {
  try {
    const { data: exchangeRates, error } = await supabase
      .from('exchange_rates')
      .select('*')
      .eq('is_active', true)
      .order('from_currency', { ascending: true })
      .order('to_currency', { ascending: true });

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json(handleSupabaseError(error), { status: 500 });
    }

    return NextResponse.json({ success: true, data: exchangeRates });
  } catch (error) {
    console.error('Error fetching exchange rates:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch exchange rates' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { from_currency, to_currency, rate, is_active = true } = body;

    // Validate required fields
    if (!from_currency || !to_currency || !rate) {
      return NextResponse.json(
        { success: false, error: 'from_currency, to_currency, and rate are required' },
        { status: 400 }
      );
    }

    // Check if exchange rate already exists
    const { data: existingRate } = await supabase
      .from('exchange_rates')
      .select('*')
      .eq('from_currency', from_currency)
      .eq('to_currency', to_currency)
      .single();

    if (existingRate) {
      // Update existing rate
      const { data: updatedRate, error } = await supabase
        .from('exchange_rates')
        .update({
          rate,
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
        .from('exchange_rates')
        .insert([{
          from_currency,
          to_currency,
          rate,
          is_active,
          date: new Date().toISOString()
        }])
        .select()
        .single();

      if (error) {
        return NextResponse.json(handleSupabaseError(error), { status: 500 });
      }

      return NextResponse.json({ success: true, data: newRate }, { status: 201 });
    }
  } catch (error) {
    console.error('Error creating/updating exchange rate:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create/update exchange rate' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json(
        { success: false, error: 'ID is required' },
        { status: 400 }
      );
    }
    
    const { error } = await supabase
      .from('exchange_rates')
      .delete()
      .eq('id', id);

    if (error) {
      return NextResponse.json(handleSupabaseError(error), { status: 500 });
    }
    
    return NextResponse.json({ success: true, message: 'Exchange rate deleted successfully' });
  } catch (error) {
    console.error('Error deleting exchange rate:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete exchange rate' },
      { status: 500 }
    );
  }
} 