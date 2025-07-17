import { NextRequest, NextResponse } from 'next/server';
import connectDB from '../../../../lib/database';
import { supabase } from '../../../../lib/supabase';

// Note: bcrypt dan jsonwebtoken perlu diinstall terlebih dahulu
// Untuk sementara kita gunakan simple hash comparison
// npm install bcrypt @types/bcrypt jsonwebtoken @types/jsonwebtoken

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    console.log('🔑 Login API - Starting...');
    
    const { username, password } = await request.json();
    console.log('📝 Login attempt for username:', username);
    
    if (!username || !password) {
      return NextResponse.json({
        success: false,
        error: 'Username dan password harus diisi'
      }, { status: 400 });
    }

    // Find user by username
    const { data: users, error } = await supabase
      .from('users')
      .select('*')
      .eq('username', username)
      .eq('is_active', true)
      .limit(1);

    if (error) {
      console.error('❌ Database error:', error);
      return NextResponse.json({
        success: false,
        error: 'Database error'
      }, { status: 500 });
    }

    if (!users || users.length === 0) {
      console.log('❌ User not found:', username);
      return NextResponse.json({
        success: false,
        error: 'Username atau password salah'
      }, { status: 401 });
    }

    const user = users[0];
    console.log('👤 User found:', { id: user.id, username: user.username, role: user.role });

    // Simple password verification (sementara sampai bcrypt diinstall)
    // Check base64 encoded password
    const expectedHash = Buffer.from(password).toString('base64');
    const isValidPassword = user.password_hash === expectedHash;
    
    console.log('🔐 Password check:', { 
      provided: password,
      expectedHash,
      storedHash: user.password_hash,
      isValid: isValidPassword 
    });
    
    // Handle legacy role mapping
    let normalizedRole = user.role;
    if (user.role === 'admin') {
      normalizedRole = 'administrator';
      console.log('🔄 Converting legacy role "admin" to "administrator"');
    }
    
    if (!isValidPassword) {
      console.log('❌ Invalid password for user:', username);
      return NextResponse.json({
        success: false,
        error: 'Username atau password salah'
      }, { status: 401 });
    }

    // Update last login
    await supabase
      .from('users')
      .update({ last_login: new Date().toISOString() })
      .eq('id', user.id);

    // Simple token generation (sementara sampai jwt diinstall)
    const token = Buffer.from(`${user.id}:${user.username}:${Date.now()}`).toString('base64');

    // Remove password from response and normalize role
    const { password_hash, ...userWithoutPassword } = user;
    userWithoutPassword.role = normalizedRole; // Use normalized role

    console.log('✅ Login successful for:', username, 'with role:', normalizedRole);

    // Create response with token in both body and cookie
    const response = NextResponse.json({
      success: true,
      data: {
        user: userWithoutPassword,
        token,
        expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
      }
    });

    // Set HTTP-only cookie for authentication
    response.cookies.set('authToken', token, {
      httpOnly: false, // Set to false so JavaScript can read it for now
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 24 * 60 * 60, // 24 hours
      path: '/'
    });

    return response;

  } catch (error) {
    console.error('❌ Login error:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 });
  }
} 