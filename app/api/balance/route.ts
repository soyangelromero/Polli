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

        // Fetch Total Balance (account/balance)
        const balanceRes = await fetch("https://gen.pollinations.ai/account/balance", { headers });

        // Fetch Tier/Daily Info (tiers/view)
        const tierRes = await fetch("https://gen.pollinations.ai/tiers/view", { headers });

        // Fetch Customer Balance (customer/balance) - trying to get paid credits
        const customerRes = await fetch("https://gen.pollinations.ai/customer/balance", { headers });

        let balance = 0;
        let tier = "anonymous";
        let dailyPollen = 0;
        let credits = 0;

        if (balanceRes.ok) {
            const data = await balanceRes.json();
            balance = data.balance || 0;
        }

        if (tierRes.ok) {
            const data = await tierRes.json();
            if (data.active) {
                tier = data.active.tier || "anonymous";
                dailyPollen = data.active.dailyPollen || 0;
            }
        }

        if (customerRes.ok) {
            const data = await customerRes.json();
            // Assuming customer/balance returns detailed info. 
            // We check for commonly used fields for credits.
            if (typeof data.credits === 'number') credits = data.credits;
            else if (typeof data.balance === 'number' && data.balance !== balance) credits = data.balance;
        }

        // Fallback: if credits is 0 but balance > dailyPollen, maybe the difference is credits?
        // But let's trust the APIs specifically.

        // If we found credits, let's ensure we return it.
        return NextResponse.json({
            balance,      // The value from account/balance (usually total pollen)
            tier,
            dailyPollen,
            credits       // The value from customer/balance or inferred
        });

    } catch (error: any) {
        console.error("Balance API Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
