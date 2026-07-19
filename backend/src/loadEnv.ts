import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const backendRoot = path.resolve(__dirname, '..');
const repoRoot = path.resolve(backendRoot, '..');

/** Load repo root `.env` first, then `backend/.env` overrides. */
function loadBackendEnv(): void {
  const candidates = [
    path.join(repoRoot, '.env'),
    path.join(backendRoot, '.env'),
  ];

  for (const envPath of candidates) {
    if (fs.existsSync(envPath)) {
      dotenv.config({ path: envPath, override: true });
    }
  }
}

const REQUIRED_FOR_AUTH = ['CLERK_SECRET_KEY', 'CLERK_PUBLISHABLE_KEY'] as const;

function validateBackendEnv(): void {
  const missing = REQUIRED_FOR_AUTH.filter((key) => !process.env[key]?.trim());

  if (missing.length === 0) return;

  console.warn('\n⚠️  Backend env missing (ML API auth will fail):');
  for (const key of missing) {
    console.warn(`   - ${key}`);
  }
  console.warn('\nAdd keys to repo root `.env` or `backend/.env`.');
  console.warn('See `.env.example` and `backend/.env.example`.\n');
}

loadBackendEnv();
validateBackendEnv();

export function getBackendPort(): number {
  return Number(process.env.ML_BACKEND_PORT) || 3001;
}
