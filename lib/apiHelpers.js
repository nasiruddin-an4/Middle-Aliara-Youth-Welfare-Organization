import { NextResponse } from "next/server";

// ─── CORS Headers ────────────────────────────────────────────────────────────
const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, x-api-key",
};

export function withCors(response) {
  Object.entries(CORS_HEADERS).forEach(([key, value]) => {
    response.headers.set(key, value);
  });
  return response;
}

// Handle OPTIONS preflight requests
export function handleOptions() {
  return new NextResponse(null, { status: 204, headers: CORS_HEADERS });
}

// ─── API Key Verification ─────────────────────────────────────────────────────
const MOBILE_API_KEY = process.env.MOBILE_API_KEY;

export function verifyApiKey(request) {
  const keyFromHeader = request.headers.get("x-api-key");
  const { searchParams } = new URL(request.url);
  const keyFromQuery = searchParams.get("api_key");
  const provided = keyFromHeader || keyFromQuery;
  return provided === MOBILE_API_KEY;
}

// ─── Response Helpers ─────────────────────────────────────────────────────────
export function successResponse(data, meta = {}, status = 200) {
  return withCors(
    NextResponse.json({ success: true, data, meta }, { status })
  );
}

export function errorResponse(message, status = 400) {
  return withCors(
    NextResponse.json({ success: false, error: message }, { status })
  );
}

export function unauthorizedResponse() {
  return withCors(
    NextResponse.json(
      {
        success: false,
        error:
          "Unauthorized. Provide a valid API key via the x-api-key header or ?api_key= query parameter.",
      },
      { status: 401 }
    )
  );
}

// ─── Pagination Helper ────────────────────────────────────────────────────────
export function getPagination(searchParams) {
  const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
  const limit = Math.min(
    100,
    Math.max(1, parseInt(searchParams.get("limit") || "20", 10))
  );
  const skip = (page - 1) * limit;
  return { page, limit, skip };
}
