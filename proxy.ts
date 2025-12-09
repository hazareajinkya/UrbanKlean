import { withAuth } from "next-auth/middleware";
import { NextRequest, NextResponse } from "next/server";

const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:3002",
  "https://www.magicalcx.com",
];

const corsOptions = {
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

const INTERNAL_KEY = process.env.INTERNAL_SECRET;

function proxy(request: NextRequest) {
  return NextResponse.next();
}

export default withAuth(proxy, {
  callbacks: {
    authorized: ({ req, token }) => {
      // If user has valid auth token, allow access
      if (token) {
        return true;
      }

      // If no auth token, check for internal auth key (for internal services)
      if (req.nextUrl.pathname.startsWith("/api/embeddings")) {
        const key = req.headers.get("x-internal-auth");
        if (key === INTERNAL_KEY) {
          return true;
        }
      }

      return false;
    },
  },
});

export const config = {
  matcher: ["/workspaces/:path*", "/api/embeddings/:path*"],
};
