import { NextResponse } from "next/server";
import { getSchoolCoverageSummary } from "@/lib/schoolCoverage";

export async function GET() {
  try {
    const summary = await getSchoolCoverageSummary();
    return NextResponse.json(summary, {
      headers: { "Cache-Control": "s-maxage=60, stale-while-revalidate=300" },
    });
  } catch (err) {
    console.error("[API] Failed to load school coverage:", err);
    return new NextResponse("Failed to load school coverage", { status: 500 });
  }
}








