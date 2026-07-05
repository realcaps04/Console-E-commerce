import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

export const requireEnv = (key) => {
  const value = process.env[key];
  if (!value) {
    console.error(
      `\nMissing ${key} in backend/.env\n` +
        'Copy .env.example to .env and set your MongoDB Atlas connection string:\n' +
        '  cp .env.example .env   (or copy the file on Windows)\n'
    );
    process.exit(1);
  }
  return value;
};
