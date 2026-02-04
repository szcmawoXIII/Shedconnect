// ===============================
// TWITCH AUTH CONFIG
// ===============================
const TWITCH_CLIENT_ID = "ВСТАВЬ_СВОЙ_CLIENT_ID";
const TWITCH_REDIRECT_URI = window.location.origin + window.location.pathname;
const TWITCH_SCOPES = "user:read:email";

// ===============================
// START LOGIN
// ===============================
export function startTwitchLogin() {
    const url =
        "https://id.twitch.tv/oauth2/authorize" +
        `?client_id=${TWITCH_CLIENT_ID}` +
        `&redirect_uri=${encodeURIComponent(TWITCH_REDIRECT_URI)}` +
        `&response_type=token` +
        `&scope=${encodeURIComponent(TWITCH_SCOPES)}`;

    window.location.href = url;
}

// ===============================
// PARSE HASH
// ===============================
function parseHashParams() {
    if (!window.location.hash.startsWith("#")) return null;

    const params = {};
    window.location.hash.substring(1).split("&").forEach(p => {
        const [key, val] = p.split("=");
        params[key] = val;
    });

    return params;
}

// ===============================
// FETCH TWITCH USER
// ===============================
async function fetchTwitchUser(accessToken) {
    const res = await fetch("https://api.twitch.tv/helix/users", {
        headers: {
            "Client-ID": TWITCH_CLIENT_ID,
            "Authorization": `Bearer ${accessToken}`
        }
    });

    const json = await res.json();
    return json.data?.[0] ?? null;
}

// ===============================
// SUPABASE CLIENT
// ===============================
import { createClient } from "https://esm.sh/@supabase/supabase-js";

const SUPABASE_URL = "https://fezlfobvavcxpwzovsoz.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_HjeSTZJOE2JEKBfuG1BxAQ_8oj30LvD";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ===============================
// ENSURE BALANCE
// ===============================
async function ensureBalance(twitch_id, display_name) {
    const { data } = await supabase
        .from("balances")
        .select("*")
        .eq("user_id", twitch_id)
        .single();

    if (data) return;

    await supabase.from("balances").insert({
        user: display_name,
        user_id: twitch_id,
        balance: 0
    });
}

// ===============================
// ENSURE PAWN
// ===============================
async function ensurePawn(twitch_id, display_name) {
    const { data } = await supabase
        .from("pawns")
        .select("*")
        .eq("user_id", twitch_id)
        .single();

    if (data) return;

    await supabase.from("commands").insert({
        viewer: display_name,
        user_id: twitch_id,
        command: "join",
        args: "{}"
    });
}

// ===============================
// MAIN AUTH FLOW
// ===============================
document.addEventListener("DOMContentLoaded", async () => {

    const loginBtn = document.querySelector("#twitch-login");
    if (loginBtn) loginBtn.onclick = startTwitchLogin;

    // 1. Check if Twitch redirected back with token
    const hash = parseHashParams();
    if (hash?.access_token) {
        localStorage.setItem("twitch_token", hash.access_token);
        window.location.hash = "";
    }

    // 2. If token exists → fetch user
    const token = localStorage.getItem("twitch_token");
    if (!token) return;

    const user = await fetchTwitchUser(token);
    if (!user) return;

    window.twitch_id = user.id;
    window.twitch_name = user.display_name;

    const status = document.querySelector("#login-status");
    if (status) status.textContent = `Вы вошли как ${user.display_name}`;

    // 3. Ensure balance and pawn exist
    await ensureBalance(user.id, user.display_name);
    await ensurePawn(user.id, user.display_name);

    // 4. Auto-select pawn
    if (window.selectPawn) {
        window.selectPawn(user.display_name);
    }
});

