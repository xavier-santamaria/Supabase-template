export function generateBotKey(): string {
  const sessionSecret = Deno.env.get('SESSION_SECRET') ?? 'default-secret' // solo para testear .env

  return `${crypto.randomUUID()}-${crypto.randomUUID()}-${sessionSecret}`
}
