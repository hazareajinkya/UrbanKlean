import { NextResponse } from "next/server";

// Standard response format for success
export function successResponse<T>(data: T, message: string = "Success") {
  return NextResponse.json(
    {
      success: true,
      message,
      data,
    },
    { status: 200 }
  );
}

// Standard response format for errors
export function errorResponse(message: string, status: number = 400) {
  return NextResponse.json(
    {
      success: false,
      message,
      data: null,
    },
    { status }
  );
}

// Standard response format for server errors
export function serverErrorResponse(error: any) {
  console.error("Server error:", error);

  return NextResponse.json(
    {
      success: false,
      message: "Internal server error",
      data: error,
    },
    { status: 500 }
  );
}
