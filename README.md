# Set up

## Requisitos

Install extension: Deno

Intalar Deno: https://docs.deno.com/runtime/

Mas informacion:
Guia para deno: https://docs.deno.com/runtime/getting_started/setup_your_environment/

## Empezzar supabase

supabase init

## Poner Deno en el projcto

Crlt + p para abrar el menu de busqueda, y escribit: >Deno

Selecionar ">Deno: initialize Workspace Configuration"

# BD

## Ejecutar en local

```zsh
npx supabase start
```

Esto levantara un Bd local, accesible en: http://localhost:54323/

Las endge function locales interactuaran con esta

## Migration

```zsh
npx supabase migration new <nombre-migration>
```

luego hay que rellenar el fichero con el codgio, supabase no tiene funcion para crear un BD a partid de un fichero de confirguracion

# Crear function

supabase functions new <nombre funcion>

## Correr un fucnion para test

supabase functions serve <nombre funcion>

**Para ejecutar functions sin autentificacion**

supabase functions serve <nombre funcion> --no-verify-jwt

## Deploy de una funcion por cli

supabase functions deploy <nombre funcion>

esto te ara elegir una de los projectos que se tiene creado y en la consola aparecera una linea como "You can inspect your deployment in the Dashboard: https://supabase.com/dashboard/project/fltwndhckcsvpdrztqog/functions" en esta podras ver la api y un ejemplo de ejecucion

Una vez hecho el deploy necesitara el apy key de anon para ser ejecutada

# Imports

hay varias formas de usar los imports

Hay que matizar que Deno no es compatible con los improts de Node.js, es decir solo se puedenimprtar librerias compatibles con Deno

## Raw

Simplemente poner la ruta de lo que se quiera importar, ej:

import { createClient } from "jsr:@supabase/supabase-js@^2.50.1";
import { generateBotKey } from "../\_shared/utils/apikey.ts";

## deno.json

Se puede usar el fichero deno.json de una function para simplicar las rutas, por ejemplo

```json
{
  "imports": {
    "@supabase/supabase-js": "jsr:@supabase/supabase-js@^2.50.1",
    "@/utils/apikey": "../_shared/utils/apikey.ts"
  }
}
```

de esta forma en el fichero de la function podemos haccer:

```ts
import { createClient } from '@supabase/supabase-js';
import { generateBotKey } from '@/utils/apikey';
```

Hay que matizar que las keys del json es lo que se usara para importar. El deno.json solo es util para esa fucion

Tambien se puede importar haciendo algo similar al un npm i, ej:

```
cd supabase/functions/<nombre function>
deno add jsr:@supabase/supabase-js
```

## import_map.json

Parecido al deno.json pero podria servir para todas las funcionts (no he sido capaz de configurarlo)

# Variables de entorno

en local mirara el .env en la raiz del projecto, en deploy se tendra que ir al projecte > Edge Functions > Secrets

# Crons

Muy facil de usar: https://supabase.com/blog/supabase-cron
