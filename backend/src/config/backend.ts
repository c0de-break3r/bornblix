import { config as loadEnv } from 'dotenv';
import { resolve } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
// Bun loads .env from cwd; explicit load keeps behavior predictable in production/docker
loadEnv({ path: resolve(__dirname, '../../.env') });

const requiredInProduction = ['CLERK_SECRET_KEY', 'CLERK_PUBLISHABLE_KEY'] as const;

export function assertProductionEnv(): void {
  if (process.env.NODE_ENV !== 'production') return;
  for (const key of requiredInProduction) {
    if (!process.env[key]?.trim()) {
      console.warn(`[Bornblix] Missing ${key} in production.`);
    }
  }
}

assertProductionEnv();

console.log('Bornblix Backend configuration loaded');

export default {};
