import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
    const { searchParams } = request.nextUrl;

    // ?p=... または ?page_id=... パラメータが存在する場合、404を返す
    if (searchParams.has('p') || searchParams.has('page_id')) {
        return NextResponse.rewrite(new URL('/not-found', request.url));
    }

    return NextResponse.next();
}

export const config = {
    // 静的ファイルとAPI以外のすべてのパスに適用
    matcher: ['/((?!api|_next/static|_next/image|favicon.ico|.*\\.png$|.*\\.jpg$|.*\\.svg$).*)'],
};
