import { NextRequest, NextResponse } from 'next/server';
import connectDB from '../../../lib/database';
import { supabase } from '../../../lib/supabase';

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    console.log('🔍 Setup Database - Starting...');

    // Create users table
    const createTableSQL = `
      CREATE TABLE IF NOT EXISTS users (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        username VARCHAR(50) UNIQUE NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        role VARCHAR(20) NOT NULL CHECK (role IN ('admin', 'operator', 'viewer')),
        full_name VARCHAR(100) NOT NULL,
        is_active BOOLEAN DEFAULT true,
        last_login TIMESTAMP WITH TIME ZONE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        created_by UUID REFERENCES users(id)
      );
    `;

    // Execute table creation
    const { error: createError } = await supabase.rpc('exec_sql', { 
      sql: createTableSQL 
    });

    if (createError) {
      console.error('❌ Error creating table:', createError);
      
      // Try alternative approach using direct SQL
      try {
        console.log('🔄 Trying alternative table creation...');
        
        // Check if table exists first
        const { data: tableExists, error: checkError } = await supabase
          .from('information_schema.tables')
          .select('table_name')
          .eq('table_name', 'users')
          .eq('table_schema', 'public');

        if (checkError) {
          console.log('📝 Table check failed, assuming table needs creation');
        }

        if (!tableExists || tableExists.length === 0) {
          console.log('📋 Users table does not exist, please create manually');
          return NextResponse.json({
            success: false,
            error: 'Users table needs to be created manually in Supabase',
            sql: createTableSQL
          }, { status: 500 });
        }
      } catch (altError) {
        console.error('❌ Alternative check failed:', altError);
        return NextResponse.json({
          success: false,
          error: 'Database setup failed',
          details: createError.message,
          sql: createTableSQL
        }, { status: 500 });
      }
    }

    // Create indexes
    const indexSQL = [
      'CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);',
      'CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);',
      'CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);',
      'CREATE INDEX IF NOT EXISTS idx_users_is_active ON users(is_active);'
    ];

    for (const sql of indexSQL) {
      const { error: indexError } = await supabase.rpc('exec_sql', { sql });
      if (indexError) {
        console.log('⚠️ Index creation warning:', indexError.message);
      }
    }

    // Insert default admin user if not exists
    const { data: existingAdmin, error: checkAdminError } = await supabase
      .from('users')
      .select('id')
      .eq('username', 'admin')
      .limit(1);

    if (checkAdminError) {
      console.error('❌ Error checking admin user:', checkAdminError);
      return NextResponse.json({
        success: false,
        error: 'Error checking existing admin user',
        details: checkAdminError.message
      }, { status: 500 });
    }

    if (!existingAdmin || existingAdmin.length === 0) {
      console.log('👤 Creating default admin user...');
      
      // Simple password hash for admin123
      const password_hash = Buffer.from('admin123').toString('base64');
      
      const { data: newAdmin, error: insertError } = await supabase
        .from('users')
        .insert({
          username: 'admin',
          email: 'admin@trafficsolution.com',
          password_hash: password_hash,
          role: 'admin',
          full_name: 'System Administrator',
          is_active: true
        })
        .select('id, username, role')
        .single();

      if (insertError) {
        console.error('❌ Error creating admin user:', insertError);
        return NextResponse.json({
          success: false,
          error: 'Failed to create admin user',
          details: insertError.message
        }, { status: 500 });
      }

      console.log('✅ Admin user created:', newAdmin);
    } else {
      console.log('✅ Admin user already exists');
    }

    // Test database connection
    const { data: testQuery, error: testError } = await supabase
      .from('users')
      .select('id, username, role, full_name')
      .eq('is_active', true)
      .limit(5);

    if (testError) {
      console.error('❌ Database test failed:', testError);
      return NextResponse.json({
        success: false,
        error: 'Database test failed',
        details: testError.message
      }, { status: 500 });
    }

    console.log('✅ Database setup completed successfully');

    return NextResponse.json({
      success: true,
      message: 'Database setup completed successfully',
      data: {
        usersCount: testQuery?.length || 0,
        users: testQuery
      }
    });

  } catch (error) {
    console.error('❌ Setup database error:', error);
    return NextResponse.json({
      success: false,
      error: 'Database setup failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    // Check if users table exists and get current users
    const { data: users, error } = await supabase
      .from('users')
      .select('id, username, email, role, full_name, is_active, created_at')
      .order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json({
        success: false,
        error: 'Users table might not exist or database connection failed',
        details: error.message,
        setup_required: true
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: 'Database is properly configured',
      data: {
        usersCount: users?.length || 0,
        users: users
      }
    });

  } catch (error) {
    console.error('❌ Database check error:', error);
    return NextResponse.json({
      success: false,
      error: 'Database check failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 