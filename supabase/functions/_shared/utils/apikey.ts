export function generateBotKey(): string {
    const sessionSecret = Deno.env.get("SESSION_SECRET") ?? "default-secret"; // solo para testear .env
    const a = 1;
    return crypto.randomUUID() + "-" + crypto.randomUUID() + "-" +
        sessionSecret;
}
