import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

/**
 * Leser .env fra prosjektroten og setter fornuftige standarder for utvikling.
 * Avslutter prosessen tidlig hvis kritiske variabler mangler.
 */
export function config(): void {
  // Sett standard NODE_ENV
  if (!process.env.NODE_ENV) {
    process.env.NODE_ENV = 'development';
  }

  // Forsøk å laste .env fra prosjektroten (antar kjøring fra prosjektrot)
  const envPath = path.resolve(process.cwd(), '.env');
  if (fs.existsSync(envPath)) {
    const result = dotenv.config({ path: envPath });
    if (result.error) {
      console.warn('⚠️  Kunne ikke laste .env:', result.error.message);
    }
  } else {
    // I noen miljøer (prod) kan variablene være satt i systemet
    console.warn('ℹ️  Fant ikke .env i prosjektrot. Forutsetter at miljøvariabler er satt i systemet.');
  }

  // Standarder for utvikling
  if (!process.env.PORT) {
    process.env.PORT = '5000';
  }
  if (!process.env.CLIENT_URL) {
    process.env.CLIENT_URL = 'http://localhost:3000';
  }
  if (!process.env.UPLOAD_DIR) {
    process.env.UPLOAD_DIR = './uploads';
  }
  if (!process.env.MAX_FILE_SIZE) {
    process.env.MAX_FILE_SIZE = '5242880'; // 5MB
  }

  // Sikkerhet: advarsel ved svak/ manglende JWT_SECRET
  if (!process.env.JWT_SECRET) {
    console.warn('⚠️  JWT_SECRET ikke satt. Sett en sterk hemmelighet i .env');
  } else if ((process.env.JWT_SECRET || '').length < 32 && process.env.NODE_ENV === 'production') {
    console.warn('⚠️  JWT_SECRET er kortere enn 32 tegn i produksjon. Anbefales å øke lengden.');
  }

  // Kritisk: DATABASE_URL må finnes
  if (!process.env.DATABASE_URL) {
    console.error('❌ DATABASE_URL må være satt. Legg den til i .env eller som miljøvariabel.');
    process.exit(1);
  }
}