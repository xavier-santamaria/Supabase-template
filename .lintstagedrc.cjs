const { relative, dirname } = require('path');
const { execSync } = require('child_process');

const getFunctionDir = (file) => {
  const rel = relative(process.cwd(), file);
  const match = rel.match(/^supabase\/functions\/([^/_][^/]+)/);
  return match ? match[1] : null;
};

module.exports = {
  // Archivos de Deno (Supabase Edge Functions)
  'supabase/functions/**/*.ts': [
    'prettier --write',
    'deno check supabase/functions/**/*.ts',
    'deno lint supabase/functions/**/*.ts',
  ],
  // Otros archivos
  '*.{json,yaml,yml,md}': ['prettier --write'],
};
