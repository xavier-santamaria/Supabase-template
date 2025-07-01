# Supabase Edge Functions

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Editor Configuration](#editor-configuration)
3. [Initial Setup](#initial-setup)
4. [Local Development](#local-development)
   - [Start the local environment](#start-the-local-environment)
   - [Create a new Edge Function](#create-a-new-edge-function)
   - [Run Function Locally](#run-function-locally)
5. [Authentication and Security](#authentication-and-security)
   - [API Keys](#api-keys)
   - [Environment Variables](#environment-variables)
6. [Deploy to Supabase Cloud](#deploy-to-supabase-cloud)
7. [Database and Prisma](#database-and-prisma)
   - [Create Migration](#create-migration)
8. [Edge Function Imports](#edge-function-imports)
   - [Using deno.json (Recommended)](#using-denojson-recommended)
   - [Raw Imports](#raw-imports-not-recommended)
   - [Import with deno add](#import-with-deno-add)
   - [Import Best Practices](#import-best-practices)
9. [Additional Resources](#additional-resources)

## Prerequisites

This project requires installing both Deno as a plugin and on your computer:

- VSCode Plugin:
  https://marketplace.visualstudio.com/items?itemName=denoland.vscode-deno
- Install Deno: https://docs.deno.com/runtime/
- Supabase CLI: https://supabase.com/docs/guides/cli

## Editor Configuration

This project already includes the VSCode configuration (`.vscode`), but if
you're using another editor whose configuration isn't compatible, check this
guide to configure it:
https://docs.deno.com/runtime/getting_started/setup_your_environment/

If you need to configure a project with these characteristics in VSCode that
doesn't have the .vscode created, you should do the following:

Ctrl + p to open the search menu, and type: >Deno: initialize Workspace
Configuration

## Initial Setup

This project is already prepared for operation, therefore the following command
is sufficient:

```bash
cp .env.example .env
npm install
npx prisma migrate dev
```

If there's a seeder:

```bash
npx prisma db seed
```

> If you need to initialize supabase from scratch in a project:
>
> ```bash
> supabase init
> ```
>
> But in this case it's already initialized, so it's not necessary

## Local Development

### Start the local Supabase environment

```bash
supabase start
```

This will start a complete local Supabase environment with:

- REST and GraphQL APIs
- **Admin Console (Studio)**
- Storage
- Websockets
- **PostgreSQL database**
- Authentication service
- ...

When running the command, it will show you the URLs to access each service.

### Create a new Edge Function

```bash
supabase functions new <function-name>
```

This will create a new folder in `supabase/functions/<function-name>` with a
basic `index.ts` file.

### Run Function Locally

```bash
supabase functions serve <function-name>
```

Important flags:

- `--no-verify-jwt`: Disables JWT verification in local development. **Very
  useful** for initial testing without authentication.
- `--env-file ./env.local`: (Optional) If you need to specify a different .env
  file

Then you can execute it locally:

```bash
curl -i --location --request POST 'http://localhost:54321/functions/v1/<function-name>' \
  --header 'Content-Type: application/json' \
  --data '{"name": "Functions"}'
```

## Authentication and Security

### API Keys

By default, Supabase authenticates all requests with an API key. To find it:

1. Open the Supabase console
2. Go to Project Settings > API Keys
3. Use the "anon public" key for client requests
4. Use the "service_role" key for administrative operations (never expose this
   key!)

### Environment Variables

Sensitive variables should be stored as secrets:

- In local development: Use `.env` file
- In production: Configure in Dashboard > Edge Functions > Secrets

## Deploy to Supabase Cloud

1. Deploy the function:

```bash
supabase functions deploy <function-name>
```

2. After deployment:

- The function will be available at:
  https://<project-id>.supabase.co/functions/v1/<function-name>
- You'll need the anon API key for calls
- You can view the function in the Dashboard:
  https://supabase.com/dashboard/project/<project-id>/functions

⚠️ **Important**: In Supabase's free plan, the database is suspended after 1
week of inactivity. To prevent suspension:

- Perform some database activity at least once every 7 days
- Or upgrade to a paid plan

## Database and Prisma

Working without Prisma might be more convenient in some ways, but I believe
Prisma's schema has many advantages:

- Easy migration management
- Better database structure visibility

However, using Prisma with edge functions has some challenges:

- Requires manual handling of **id** creation and **createAt/updateAt**
  management
- Currently not possible to make Prisma queries with Supabase Edge functions, so
  queries must be made using Supabase

### Create Migration

To create a new migration, you should modify the Prisma schema in:
/prisma/schema.prisma

Once modified, run:

```bash
npx prisma migrate dev
```

## Edge Function Imports

Imports in Edge Functions are different from Node.js. There are several ways to
handle them, with `deno.json` being the recommended approach:

### Using deno.json (Recommended)

Each Edge Function can have its own `deno.json` to manage its imports. This
method offers several advantages:

- Cleaner and maintainable paths
- Editor autocompletion
- Easier refactoring
- Centralized dependency versions

1. Create `deno.json` in the function folder:

```json
{
  "imports": {
    "@supabase/supabase-js": "jsr:@supabase/supabase-js@^2.50.1",
    "@/utils/": "../_shared/utils/",
    "@/types/": "../_shared/types/",
    "@/constants": "../_shared/constants.ts"
  },
  "tasks": {
    "serve": "supabase functions serve --no-verify-jwt",
    "deploy": "supabase functions deploy"
  }
}
```

2. Use imports in your code:

```typescript
import { createClient } from "@supabase/supabase-js";
import { generateApiKey } from "@/utils/apikey.ts";
import { UserType } from "@/types/user.ts";
import { API_VERSION } from "@/constants";
```

### Raw Imports (Not Recommended)

You can also import directly using full paths, but it's not the most
maintainable way:

```typescript
import { createClient } from "jsr:@supabase/supabase-js@^2.50.1";
import { generateBotKey } from "../_shared/utils/apikey.ts";
```

### Import with deno add

Another option is to use the `deno add` command, which will automatically modify
the `deno.json`:

```bash
cd supabase/functions/<function-name>
deno add jsr:@supabase/supabase-js
```

### Import Best Practices

1. **Recommended Folder Structure**:

```
supabase/functions/
├── _shared/          # Shared code between functions
│   ├── utils/        # Common utilities
│   ├── types/        # TypeScript types
├── function1/
│   ├── deno.json     # Specific configuration
│   └── index.ts      # Function code
└── function2/
    ├── deno.json
    └── index.ts
```

2. **Versioning**: Always specify the version in external dependencies:

```json
{
  "imports": {
    "@supabase/supabase-js": "jsr:@supabase/supabase-js@^2.50.1"
  }
}
```

3. **Aliases**: Use meaningful aliases to improve readability:

```json
{
  "imports": {
    "@/api/": "./api/",
    "@/lib/": "./lib/",
    "@/shared/": "../_shared/"
  }
}
```

## Additional Resources

- [Official Supabase Documentation](https://supabase.com/docs)
- [Edge Functions Examples](https://github.com/supabase/supabase/tree/master/examples/edge-functions)
- [Deno Guide](https://deno.land/manual)
