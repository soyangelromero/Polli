import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
    try {
        const apiKey = req.headers.get("x-api-key");

        if (!apiKey) {
            return NextResponse.json({ error: "Missing API Key" }, { status: 401 });
        }

        const headers = {
            "Authorization": `Bearer ${apiKey}`,
            "Content-Type": "application/json"
        };

        // Fetch Total Balance
        const balanceRes = await fetch("https://gen.pollinations.ai/account/balance", { headers });

        // Fetch Tier/Daily Info
        const tierRes = await fetch("https://gen.pollinations.ai/tiers/view", { headers });

        let balance = 0;
        let tier = "anonymous";
        let dailyPollen = 0;

        if (balanceRes.ok) {
            const data = await balanceRes.json();
            balance = data.balance || 0;
        } else {
            console.error("Balance fetch failed:", await balanceRes.text());
        }

        if (tierRes.ok) {
            const data = await tierRes.json();
            if (data.active) {
                tier = data.active.tier || "anonymous";
                dailyPollen = data.active.dailyPollen || 0;
            }
        } else {
            console.error("Tier fetch failed:", await tierRes.text());
        }

        return NextResponse.json({
            balance,
            tier,
            dailyPollen
        });

    } catch (error: any) {
        console.error("Balance API Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
