
import { NextResponse } from "next/server";
// @ts-ignore
const googleTrends = require("google-trends-api");

export async function POST(request: Request) {
    try {
        const { keyword, timeframe = "today 12-m", geo = "US" } = await request.json();

        if (!keyword) {
            return NextResponse.json({ error: "Missing keyword" }, { status: 400 });
        }

        // Fetch Interest Over Time
        const rawJson = await googleTrends.interestOverTime({
            keyword: keyword,
            startTime: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Past 30 days
            geo: geo,
            granularTime: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Optional
        });

        const data = JSON.parse(rawJson);
        const timelineData = data.default.timelineData.map((d: any) => ({
            date: d.formattedAxisTime,
            value: d.value[0], // interest score
            hasData: d.hasData
        }));

        return NextResponse.json({ timeline: timelineData });

    } catch (error: any) {
        console.error("Trends API Error:", error);
        // Fallback or empty
        return NextResponse.json({ error: error.message, timeline: [] }, { status: 500 });
    }
}
