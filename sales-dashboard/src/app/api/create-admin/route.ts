import { NextRequest, NextResponse } from 'next/server';
import connectDB from '../../../lib/database';
import { supabase } from '../../../lib/supabase';

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    console.log('👤 Creating sample users...');

    // Sample users data
    const sampleUsers = [
      {
        username: 'admin',
        email: 'admin@trafficsolution.com',
        password: 'admin123',
        role: 'administrator',
        full_name: 'System Administrator'
      },
      {
        username: 'manager',
        email: 'manager@trafficsolution.com',
        password: 'manager123',
        role: 'manager',
        full_name: 'Manager User'
      },
      {
        username: 'operator',
        email: 'operator@trafficsolution.com',
        password: 'operator123',
        role: 'operator',
        full_name: 'Operator User'
      },
      {
        username: 'user1',
        email: 'user1@trafficsolution.com',
        password: 'user123',
        role: 'user',
        full_name: 'Regular User'
      },
      {
        username: 'viewer',
        email: 'viewer@trafficsolution.com',
        password: 'viewer123',
        role: 'viewer',
        full_name: 'Viewer User'
      }
    ];

    const createdUsers = [];

    for (const userData of sampleUsers) {
      // Delete existing user if any
      await supabase
        .from('users')
        .delete()
        .eq('username', userData.username);

      // Simple password hash
      const password_hash = Buffer.from(userData.password).toString('base64');
      console.log(`🔐 Password hash for ${userData.username} (${userData.password}):`, password_hash);

      const { data: newUser, error: insertError } = await supabase
        .from('users')
        .insert({
          username: userData.username,
          email: userData.email,
          password_hash: password_hash,
          role: userData.role,
          full_name: userData.full_name,
          is_active: true
        })
        .select('id, username, role, full_name')
        .single();

      if (insertError) {
        console.error(`❌ Error creating ${userData.username}:`, insertError);
        continue;
      }

      console.log(`✅ User created:`, newUser);
      createdUsers.push({
        ...newUser,
        credentials: {
          username: userData.username,
          password: userData.password
        }
      });
    }

    return NextResponse.json({
      success: true,
      message: `${createdUsers.length} sample users created successfully`,
      data: createdUsers
    });

  } catch (error) {
    console.error('❌ Create users error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to create sample users',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    // Check current users
    const { data: users, error } = await supabase
      .from('users')
      .select('id, username, email, role, full_name, is_active, created_at')
      .order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json({
        success: false,
        error: 'Error fetching users',
        details: error.message
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: 'Users fetched successfully',
      data: users,
      sampleCredentials: [
        { username: 'admin', password: 'admin123', role: 'administrator' },
        { username: 'manager', password: 'manager123', role: 'manager' },
        { username: 'operator', password: 'operator123', role: 'operator' },
        { username: 'user1', password: 'user123', role: 'user' },
        { username: 'viewer', password: 'viewer123', role: 'viewer' },
      ]
    });

  } catch (error) {
    console.error('❌ Get users error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch users',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 