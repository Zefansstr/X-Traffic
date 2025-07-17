import { NextRequest, NextResponse } from 'next/server';
import connectDB from '../../../lib/database';
import { supabase } from '../../../lib/supabase';

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { data: users, error } = await supabase
      .from('users')
      .select('id, username, email, phone, role, full_name, is_active, last_login, created_at, updated_at')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching users:', error);
      return NextResponse.json({
        success: false,
        error: 'Failed to fetch users'
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      data: users
    });

  } catch (error) {
    console.error('Error in users GET:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('📝 POST /api/users - Starting user creation...');
    await connectDB();

    const body = await request.json();
    console.log('📥 Request body:', { ...body, password: body.password ? '[HIDDEN]' : undefined });
    
    const { username, email, phone, password, role, full_name, created_by } = body;

    if (!username || !email || !password || !role || !full_name) {
      console.log('❌ Validation failed. Missing fields:', {
        username: !username ? 'MISSING' : 'OK',
        email: !email ? 'MISSING' : 'OK',
        password: !password ? 'MISSING' : 'OK',
        role: !role ? 'MISSING' : 'OK',
        full_name: !full_name ? 'MISSING' : 'OK'
      });
      return NextResponse.json({
        success: false,
        error: 'Semua field wajib diisi'
      }, { status: 400 });
    }
    
    console.log('✅ Validation passed for user:', username);

    // Check if username or email already exists
    console.log('🔍 Checking for existing users...');
    const { data: existingUsers, error: checkError } = await supabase
      .from('users')
      .select('username, email')
      .or(`username.eq.${username},email.eq.${email}`);

    if (checkError) {
      console.error('❌ Error checking existing users:', checkError);
      return NextResponse.json({
        success: false,
        error: 'Database error',
        details: checkError.message
      }, { status: 500 });
    }

    console.log('📊 Existing users check result:', existingUsers);

    if (existingUsers && existingUsers.length > 0) {
      console.log('❌ User already exists:', existingUsers);
      return NextResponse.json({
        success: false,
        error: 'Username atau email sudah digunakan',
        existing: existingUsers
      }, { status: 400 });
    }
    
    console.log('✅ No existing users found, proceeding with creation...');

    // Simple password hash (dalam production gunakan bcrypt)
    const password_hash = Buffer.from(password).toString('base64');
    
    console.log('🔐 Creating user with password hash:', { 
      username, 
      providedPassword: password,
      generatedHash: password_hash 
    });

    console.log('💾 Inserting user into database...');
    const { data: newUser, error } = await supabase
      .from('users')
      .insert({
        username,
        email,
        phone,
        password_hash,
        role,
        full_name,
        created_by: created_by || null
      })
      .select('id, username, email, phone, role, full_name, is_active, created_at')
      .single();

    if (error) {
      console.error('❌ Error creating user:', error);
      console.error('❌ Error details:', {
        message: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint
      });
      return NextResponse.json({
        success: false,
        error: 'Failed to create user',
        details: error.message,
        code: error.code
      }, { status: 500 });
    }
    
    console.log('✅ User created successfully:', {
      id: newUser.id,
      username: newUser.username,
      role: newUser.role
    });

    return NextResponse.json({
      success: true,
      data: newUser
    });

  } catch (error) {
    console.error('Error in users POST:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    await connectDB();

    const { id, username, email, phone, password, role, full_name, is_active } = await request.json();

    if (!id) {
      return NextResponse.json({
        success: false,
        error: 'User ID is required'
      }, { status: 400 });
    }

    const updateData: any = {};
    
    if (username !== undefined) updateData.username = username;
    if (email !== undefined) updateData.email = email;
    if (phone !== undefined) updateData.phone = phone;
    if (password !== undefined) {
      // Simple password hash (dalam production gunakan bcrypt)
      updateData.password_hash = Buffer.from(password).toString('base64');
      console.log('🔐 Updating password hash for user:', id, 'new hash:', updateData.password_hash);
    }
    if (role !== undefined) updateData.role = role;
    if (full_name !== undefined) updateData.full_name = full_name;
    if (is_active !== undefined) updateData.is_active = is_active;

    const { data: updatedUser, error } = await supabase
      .from('users')
      .update(updateData)
      .eq('id', id)
      .select('id, username, email, phone, role, full_name, is_active, updated_at')
      .single();

    if (error) {
      console.error('Error updating user:', error);
      return NextResponse.json({
        success: false,
        error: 'Failed to update user'
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      data: updatedUser
    });

  } catch (error) {
    console.error('Error in users PUT:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    await connectDB();

    const { id } = await request.json();

    if (!id) {
      return NextResponse.json({
        success: false,
        error: 'User ID is required'
      }, { status: 400 });
    }

    const { error } = await supabase
      .from('users')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting user:', error);
      return NextResponse.json({
        success: false,
        error: 'Failed to delete user'
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: 'User deleted successfully'
    });

  } catch (error) {
    console.error('Error in users DELETE:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 });
  }
} 