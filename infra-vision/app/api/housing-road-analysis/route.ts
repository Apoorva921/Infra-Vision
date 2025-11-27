import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function GET() {
  try {
    const filePath = path.join(process.cwd(), "data", "housing_road_analysis.csv");
    
    if (!fs.existsSync(filePath)) {
      console.error("Housing Road Analysis CSV not found at:", filePath);
      return NextResponse.json({ error: "Data file not found" }, { status: 404 });
    }

    const csv = fs.readFileSync(filePath, "utf-8");
    const [headerLine, ...lines] = csv.trim().split("\n");
    const headers = headerLine.split(",").map(h => h.trim());

    const rows = lines.map(line => {
      const values: string[] = [];
      let current = "";
      let inQuotes = false;
      
      for (let i = 0; i < line.length; i++) {
        const char = line[i];
        if (char === '"') {
          inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
          values.push(current.trim());
          current = "";
        } else {
          current += char;
        }
      }
      values.push(current.trim());
      return values;
    });

    const data = rows.map(cols =>
      Object.fromEntries(headers.map((h, i) => {
        const value = cols[i] || "";
        const numValue = parseFloat(value);
        return [h.trim(), isNaN(numValue) ? value : numValue];
      }))
    );

    // ----------------------------
    // SAFE STATISTICS (FIXED)
    // ----------------------------
    const safeNum = (v: any) => {
      const n = Number(v);
      return Number.isFinite(n) ? n : 0;
    };

    const total = (arr: any[], key: string) =>
      arr.reduce((sum, d) => sum + safeNum(d[key]), 0);

    const avgDensity = data.length ? total(data, "Avg_Density") / data.length : 0;
    const avgInfraScore = data.length ? total(data, "Infrastructure_Score") / data.length : 0;
    const avgCongestion = data.length ? total(data, "Congestion_Level") / data.length : 0;

    const totalHousing = total(data, "Total_Housing_Units");
    const totalRoadLength = total(data, "Total_Road_Length_KM");

    const modelMetrics = {
      r2Score: safeNum(data[0]?.Model_R2_Score),
      mse: safeNum(data[0]?.Model_MSE),
      mae: safeNum(data[0]?.Model_MAE)
    };

    const summary = {
      totalDistricts: data.length,
      avgDensity: Math.round(avgDensity),
      avgInfrastructureScore: Math.round(avgInfraScore * 10) / 10,
      avgCongestionLevel: Math.round(avgCongestion * 10) / 10,
      totalHousingUnits: totalHousing,
      totalRoadLength: Math.round(totalRoadLength * 10) / 10,
      modelMetrics
    };

    return NextResponse.json({ data, summary }, {
      headers: {
        "Cache-Control": "s-maxage=300, stale-while-revalidate=300"
      }
    });
  } catch (err) {
    console.error("Failed to load housing road analysis data:", err);
    return NextResponse.json({ error: "Data load failed" }, { status: 500 });
  }
}
