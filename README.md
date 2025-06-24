# Supabase Backend Project

Este proyecto implementa un backend utilizando Supabase con las siguientes características:

## Características

- Gestión de base de datos con Prisma
- Edge Functions con entornos de staging y producción
- Cron jobs gestionados desde código
- Sistema de storage
- CI/CD con GitHub Actions

## Estructura del Proyecto

```
.
├── prisma/               # Esquemas y migraciones de base de datos
├── supabase/
│   ├── functions/       # Edge functions
│   ├── migrations/      # Migraciones de Supabase
│   └── config.toml      # Configuración de Supabase
├── .github/
│   └── workflows/       # GitHub Actions workflows
└── scripts/             # Scripts de utilidad
```

## Entornos

El proyecto mantiene dos entornos:

- Staging (stg)
- Producción (pro)

Cada entorno tiene su propia base de datos y configuración.

## Setup Inicial

1. Instalar dependencias:

```bash
npm install
```

2. Configurar variables de entorno:

```bash
cp .env.example .env
```

3. Inicializar Supabase:

```bash
npx supabase init
```

4. Configurar Prisma:

```bash
npx prisma init
```

## Desarrollo

### Base de datos

Las migraciones se gestionan con Prisma:

```bash
npx prisma migrate dev
```

### Edge Functions

Las Edge Functions se encuentran en `supabase/functions/`. Para desarrollo local:

```bash
npx supabase functions serve
```

### Cron Jobs

Los cron jobs se configuran en `supabase/config.toml` y se pueden probar localmente.

## Despliegue

El despliegue se realiza automáticamente mediante GitHub Actions:

- Push a `main` -> deploy a producción
- Push a `develop` -> deploy a staging

## Storage

La gestión de archivos se realiza a través de Supabase Storage. Los buckets y políticas se configuran en `supabase/storage.sql`.
