export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";

export async function GET() {
    const url = process.env.DATABASE_URL || "";
    return NextResponse.json({
        hasDB: !!url,
        host: url.includes("pooler.supabase.com")
            ? "SUPABASE ✅"
            : url.includes("localhost")
                ? "LOCALHOST ❌"
                : "OTHER ⚠️",
        preview: url.slice(0, 60) + "...",
    });
}
