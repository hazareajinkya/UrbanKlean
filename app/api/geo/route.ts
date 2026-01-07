import { NextRequest } from "next/server";
import { geolocation } from "@vercel/functions";
import { successResponse, errorResponse } from "@/lib/types/api-response";

export async function GET(req: NextRequest) {
  try {
    const geo = geolocation(req);

    if (!geo) {
      return successResponse(
        { country: null, isIndia: false },
        "Geo data not available"
      );
    }

    const isIndia = geo.country === "IN";
    // const isIndia = false;

    return successResponse(
      {
        country: geo.country,
        // country: geo.country || "India",
        city: geo.city || null,
        region: geo.region || null,
        isIndia,
      },
      "Geo data retrieved successfully"
    );
  } catch (error: any) {
    console.error("Error retrieving geo data:", error);
    return errorResponse("Failed to retrieve geo data", 500);
  }
}
