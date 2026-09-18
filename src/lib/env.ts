import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),
  DATABASE_URL: z.string().optional(),
  COOKIE_SECRET: z
    .string()
    .min(16, "COOKIE_SECRET must be at least 16 characters")
    .default("default_secret_key_for_nalar_development_only"),
  AI_PROVIDER: z
    .enum(["none", "mock", "gemini", "openai", "gemma", "google", "anthropic", "curated"])
    .optional(),
  AI_DEFAULT_PROVIDER: z
    .enum(["gemma", "google", "openai", "anthropic", "curated", "mock", "none", "gemini"])
    .optional(),
  AI_API_KEY: z.string().optional(),
  GEMMA_API_KEY: z.string().optional(),
  GEMINI_API_KEY: z.string().optional(),
  GOOGLE_API_KEY: z.string().optional(),
  OPENAI_API_KEY: z.string().optional(),
  ANTHROPIC_API_KEY: z.string().optional(),
  GEMMA_ENDPOINT: z.string().optional(),
  GEMMA_MODEL: z.string().optional(),
  OPENAI_BASE_URL: z.string().optional(),
  OPENAI_MODEL: z.string().optional(),
  ANTHROPIC_BASE_URL: z.string().optional(),
  ANTHROPIC_MODEL: z.string().optional(),
});

export type Env = z.infer<typeof envSchema>;

function parseEnv(): Env {
  const result = envSchema.safeParse(process.env);
  if (!result.success) {
    console.error("Invalid environment variables:", result.error.format());
    throw new Error("Invalid environment variables");
  }
  return result.data;
}

export const env = parseEnv();
