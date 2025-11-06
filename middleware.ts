import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    // Add any additional middleware logic here
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        // Protect dashboard and agent creation routes
        const path = req.nextUrl.pathname;
        const protectedPaths = ["/dashboard", "/agents/create", "/workflows/create"];
        
        if (protectedPaths.some((p) => path.startsWith(p))) {
          return !!token;
        }
        
        return true;
      },
    },
  }
);

export const config = {
  matcher: ["/dashboard/:path*", "/agents/create/:path*", "/workflows/create/:path*"],
};
