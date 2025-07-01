const { relative } = require('path');

const getFunctionDir = (file) => {
  const rel = relative(process.cwd(), file);
  const match = rel.match(/^supabase\/functions\/([^/_][^/]+)/);
  return match ? match[1] : null;
};

module.exports = {
  // Archivos de Deno (Supabase Edge Functions)
  'supabase/functions/[!_]**/*.ts': (files) => {
    const functionDirs = new Set(files.map(getFunctionDir).filter(Boolean));

    return [
      'prettier --write ' + files.join(' '),
      ...Array.from(functionDirs).map((dir) => {
        return `cd supabase/functions/${dir} && deno check index.ts`;
      }),
    ];
  },
  // Otros archivos
  '*.{json,yaml,yml,md}': ['prettier --write'],
};
