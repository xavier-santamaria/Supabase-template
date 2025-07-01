const { relative, dirname } = require('path');
const { readdirSync, existsSync } = require('fs');
const { join } = require('path');

const FUNCTIONS_DIR = 'supabase/functions';

// Encuentra todas las carpetas que tienen deno.json
const getFunctionDirs = () => {
  return readdirSync(FUNCTIONS_DIR, { withFileTypes: true })
    .filter(
      (dirent) =>
        dirent.isDirectory() &&
        !dirent.name.startsWith('_') &&
        existsSync(join(FUNCTIONS_DIR, dirent.name, 'deno.json')),
    )
    .map((dirent) => dirent.name);
};

module.exports = {
  'supabase/functions/**/*.ts': (files) => {
    const commands = [];

    // Prettier para todos los archivos staged
    commands.push(`prettier --write ${files.join(' ')}`);

    // Check y lint para cada función que tenga deno.json
    const functionDirs = getFunctionDirs();
    for (const functionName of functionDirs) {
      const functionDir = `${FUNCTIONS_DIR}/${functionName}`;
      commands.push(
        `sh -c "cd ${functionDir} && deno check *.ts && deno lint *.ts"`,
      );
    }

    return commands;
  },
  '*.{json,yaml,yml,md}': ['prettier --write'],
};
