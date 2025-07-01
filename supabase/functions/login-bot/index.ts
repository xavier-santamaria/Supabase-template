// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

// Setup type definitions for built-in Supabase Runtime APIs
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

interface LoginRequest {
  name: string;
  apiKey: string;
}

interface LoginResponse {
  message: string;
  token?: string;
}

interface ErrorResponse {
  error: string;
}

const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY") ?? "";

const supabase = createClient(supabaseUrl, supabaseAnonKey);

Deno.serve(async (req: Request): Promise<Response> => {
  try {
    const { name, apiKey } = (await req.json()) as LoginRequest;

    // Validar que se proporcionen ambos campos
    if (!name || !apiKey) {
      return new Response(
        JSON.stringify({
          error: "Name and apiKey are required",
        } as ErrorResponse),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    // Buscar el bot en la base de datos
    const { data: bot, error } = await supabase
      .from("Bot")
      .select()
      .match({ name, apiKey })
      .single();

    if (error || !bot) {
      return new Response(
        JSON.stringify({
          error: "Invalid credentials",
        } as ErrorResponse),
        {
          status: 401,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    // Si las credenciales son correctas, generamos un token simple
    const token = crypto.randomUUID();

    return new Response(
      JSON.stringify({
        message: "Login successful",
        token,
      } as LoginResponse),
      {
        headers: { "Content-Type": "application/json" },
      },
    );
  } catch (error: unknown) {
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Unknown error",
      } as ErrorResponse),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      },
    );
  }
});

/* To invoke locally:

  1. Run `supabase start` (see: https://supabase.com/docs/reference/cli/supabase-start)
  2. Make an HTTP request:

  curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/login-bot' \
    --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0' \
    --header 'Content-Type: application/json' \
    --data '{"name":"Functions"}'

*/
