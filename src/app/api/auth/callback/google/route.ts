import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const error = searchParams.get('error');

  if (error || !code) {
    return NextResponse.redirect(new URL('/login?error=' + (error || 'no_code'), request.url));
  }

  try {
    // Exchange Google Auth code with Google token endpoint
    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: '236404722141-le31cp7pcd9dpnta2haro6nlc9tfud0o.apps.googleusercontent.com',
        client_secret: process.env.GOOGLE_CLIENT_SECRET || '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',
        redirect_uri: 'http://localhost:3000/api/auth/callback/google',
        grant_type: 'authorization_code',
      }),
    });

    if (!tokenRes.ok) {
      const errText = await tokenRes.text();
      console.error('Google token exchange error:', errText);
      return NextResponse.redirect(new URL('/login?error=exchange_failed', request.url));
    }

    const tokenData = await tokenRes.json();
    const idToken = tokenData.id_token;

    // Verify against BambooKit API
    if (idToken) {
      const apiRes = await fetch('http://localhost:8080/v1/auth/google/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken }),
      });

      if (apiRes.ok) {
        const authData = await apiRes.json();
        const res = NextResponse.redirect(new URL('/dashboard', request.url));
        res.cookies.set('bambookit_token', authData.data.token, { path: '/', httpOnly: false });
        res.cookies.set('bambookit_user_email', authData.data.user.email, { path: '/', httpOnly: false });
        res.cookies.set('bambookit_user_name', authData.data.user.name, { path: '/', httpOnly: false });
        return res;
      }
    }

    return NextResponse.redirect(new URL('/dashboard', request.url));
  } catch (err: any) {
    console.error('Callback error:', err);
    return NextResponse.redirect(new URL('/login?error=' + encodeURIComponent(err.message), request.url));
  }
}
