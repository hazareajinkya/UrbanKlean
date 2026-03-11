import { NextRequest, NextResponse } from "next/server";
import { z, ZodSchema } from "zod";

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

export async function validateBody<T>(req: NextRequest, schema: ZodSchema<T>): Promise<T> {
  try {
    const body = await req.json();
    return schema.parse(body);
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      const message = (error as any).errors.map((e: any) => e.message).join(", ");
      throw new Error(`Validation Error: ${message}`);
    }
    throw new Error("Invalid request body");
  }
}
