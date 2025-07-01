// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

// Setup type definitions for built-in Supabase Runtime APIs
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "@supabase/supabase-js";
import { generateBotKey } from "@/utils/apikey";
import { z } from "zod";

// Define el schema de validación
const CreateBotSchema = z.object({
  name: z
    .string()
    .min(3, "Name must be at least 3 characters long")
    .max(50, "Name must be less than 50 characters")
    .regex(
      /^[a-zA-Z0-9-_]+$/,
      "Name can only contain letters, numbers, hyphens and underscores",
    ),
});

// Type inference from schema
type CreateBotRequest = z.infer<typeof CreateBotSchema>;

interface CreateBotResponse {
  message: string;
  bot: {
    id: string;
    name: string;
    apiKey: string;
    createdAt: string;
    updatedAt: string;
  };
}

interface ErrorResponse {
  error: string;
  errors?: Record<string, string[]>;
}

const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY") ?? "";

console.log({ supabaseUrl, supabaseAnonKey });

const supabase = createClient(supabaseUrl, supabaseAnonKey);

Deno.serve(async (req: Request): Promise<Response> => {
  try {
    const body = await req.json();

    // Validar el request con Zod
    const result = CreateBotSchema.safeParse(body);

    if (!result.success) {
      return new Response(
        JSON.stringify({
          error: "Validation failed",
          errors: result.error.flatten().fieldErrors,
        } as ErrorResponse),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    const { name } = result.data;

    console.log(result);

    // Generate a unique API key for the bot
    const apiKey = generateBotKey();

    // Insert the bot into the database
    const { data: bot, error } = await supabase
      .from("Bot")
      .insert([
        {
          id: crypto.randomUUID(),
          name,
          apiKey,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ])
      .select()
      .single();

    if (error && Object.keys(error).length !== 0) throw error;

    return new Response(
      JSON.stringify({
        message: "Bot created successfully",
        bot,
      } as CreateBotResponse),
      { headers: { "Content-Type": "application/json" } },
    );
  } catch (error: unknown) {
    console.error("Error creating bot:", error);
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

  curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/seed-bot' \
    --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0' \
    --header 'Content-Type: application/json' \
    --data '{"name":"Functions"}'

*/
