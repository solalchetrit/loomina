import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";
import { createClient } from "@supabase/supabase-js";

export async function GET(request: NextRequest) {
    try {
        const cookie = request.cookies.get('loomina_session');

        if (!cookie || !cookie.value) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Verify JWT
        const secret = new TextEncoder().encode(process.env.JWT_SECRET || process.env.SUPABASE_SERVICE_ROLE_KEY || "fallback-secret-change-me");

        // This will throw if invalid
        const { payload } = await jwtVerify(cookie.value, secret);
        const { phone } = payload;

        if (!phone) {
            return NextResponse.json({ error: "Invalid token payload" }, { status: 401 });
        }

        // Now safe to call RPC or query DB using Service Role
        // because we validated ownership of the session
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
        const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
        const supabase = createClient(supabaseUrl, supabaseServiceKey);

        const { data, error } = await supabase.rpc('get_client_stories', {
            phone_input: phone as string
        });

        if (error) {
            console.error("RPC Error (Secure Proxy):", error);
            return NextResponse.json({ error: "Database error" }, { status: 500 });
        }

        return NextResponse.json(data);

    } catch (err) {
        console.error("Auth Error:", err);
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
}
