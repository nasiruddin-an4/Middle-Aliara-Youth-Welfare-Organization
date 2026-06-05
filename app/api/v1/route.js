import { handleOptions, withCors } from "@/lib/apiHelpers";
import { NextResponse } from "next/server";

export async function OPTIONS() {
  return handleOptions();
}

export async function GET() {
  return withCors(
    NextResponse.json({
      success: true,
      name: "Middle Aliara Youth Welfare Organization — Mobile API",
      version: "1.0.0",
      baseUrl: "/api/v1",
      authentication: {
        note: "Some endpoints require an API key. Pass it via the 'x-api-key' header or '?api_key=' query parameter.",
      },
      endpoints: {
        public: [
          {
            method: "GET",
            path: "/api/v1/activities",
            description: "List all activities",
            queryParams: ["page", "limit", "category", "status", "featured"],
          },
          {
            method: "GET",
            path: "/api/v1/activities/:id",
            description: "Get a single activity by ID",
          },
          {
            method: "GET",
            path: "/api/v1/members",
            description: "List all active members",
            queryParams: ["page", "limit", "search"],
          },
          {
            method: "GET",
            path: "/api/v1/members/:id",
            description: "Get a single member by memberId or _id",
          },
          {
            method: "GET",
            path: "/api/v1/gallery",
            description: "List gallery images",
            queryParams: ["page", "limit", "category", "featured"],
          },
          {
            method: "GET",
            path: "/api/v1/gallery/:id",
            description: "Get a single gallery item by ID",
          },
          {
            method: "GET",
            path: "/api/v1/stats",
            description: "Get summary statistics for the home screen",
          },
        ],
        protected: [
          {
            method: "GET",
            path: "/api/v1/payments",
            description: "List payments (requires API key)",
            queryParams: ["page", "limit", "memberId", "year", "month"],
            auth: "x-api-key header or ?api_key=",
          },
          {
            method: "GET",
            path: "/api/v1/expenses",
            description: "List expenses (requires API key)",
            queryParams: ["page", "limit", "year", "month", "category"],
            auth: "x-api-key header or ?api_key=",
          },
          {
            method: "GET",
            path: "/api/v1/expenses/:id",
            description: "Get a single expense with line items (requires API key)",
            auth: "x-api-key header or ?api_key=",
          },
        ],
      },
    })
  );
}
