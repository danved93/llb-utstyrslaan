# Deployment Guide for Domeneshop

Denne guiden viser hvordan du deployer LLB Utstyrslån applikasjonen til Domeneshop webhosting.

## 📋 Forutsetninger

- Domeneshop webhosting konto med Node.js støtte
- Neon PostgreSQL database opprettet
- Git installert lokalt

## 🚀 Steg-for-steg deployment

### 1. Forbered databasen

1. **Opprett Neon PostgreSQL database**
   - Gå til [console.neon.tech](https://console.neon.tech)
   - Opprett ny database
   - Kopier connection string

2. **Kjør migrasjoner lokalt først (for testing)**
   ```bash
   DATABASE_URL="din_neon_url" npx prisma migrate dev
   ```

### 2. Bygg applikasjonen

```bash
# Installer avhengigheter
npm install

# Bygg produksjonsversjonen
npm run build
```

### 3. Forbered filer for upload

Opprett en deployment mappe med følgende struktur:

```
deployment/
├── dist/              # Fra npm run build
├── prisma/            # Database schema
├── package.json       # Produksjonsversjon
├── .env              # Med produksjonsverdier
└── uploads/          # Tom mappe for bilder
```

### 4. Opprett produksjon package.json

Opprett en forenklet `package.json` for produksjon:

```json
{
  "name": "llb-utstyrslaan",
  "version": "1.0.0",
  "main": "dist/server.js",
  "scripts": {
    "start": "node dist/server.js",
    "migrate": "prisma migrate deploy",
    "generate": "prisma generate"
  },
  "dependencies": {
    "@prisma/client": "^5.7.1",
    "bcryptjs": "^2.4.3",
    "cors": "^2.8.5",
    "express": "^4.18.2",
    "jsonwebtoken": "^9.0.2",
    "multer": "^1.4.5-lts.1",
    "prisma": "^5.7.1"
  },
  "engines": {
    "node": ">=16.0.0"
  }
}
```

### 5. Konfigurer miljøvariabler

Opprett `.env` fil for produksjon:

```env
NODE_ENV=production
PORT=80
DATABASE_URL="postgresql://username:password@hostname:port/database_name?sslmode=require"
JWT_SECRET="din_sterke_hemmelighet_minst_32_tegn"
CLIENT_URL=https://ditdomene.no
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=5242880
```

### 6. Last opp til Domeneshop

1. **Via FTP/SFTP**
   - Last opp alle filer til webserver rot (vanligvis `public_html/` eller `www/`)

2. **Via Domeneshop File Manager**
   - Gå til cPanel → File Manager
   - Last opp filene

### 7. Installer avhengigheter på serveren

SSH inn på serveren eller bruk terminal i cPanel:

```bash
# Naviger til applikasjonsmappen
cd /path/to/your/app

# Installer kun produksjonsavhengigheter
npm install --production

# Generer Prisma client
npm run generate

# Kjør database migrasjoner
npm run migrate
```

### 8. Start applikasjonen

```bash
# Start applikasjonen
npm start

# Eller for bakgrunnskjøring
nohup npm start > app.log 2>&1 &
```

### 9. Konfigurer web server

**For Apache (.htaccess)**
```apache
RewriteEngine On
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule ^(.*)$ http://localhost:5000/$1 [P,L]
```

**For Nginx**
```nginx
location / {
    proxy_pass http://localhost:5000;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
    proxy_cache_bypass $http_upgrade;
}
```

## 🔧 Troubleshooting

### Vanlige problemer

1. **Port konfigurasjon**
   - Sjekk at PORT er satt riktig i .env
   - Domeneshop kan kreve spesifikke porter

2. **Database tilkobling**
   - Verifiser at Neon database er tilgjengelig
   - Sjekk at SSL er aktivert

3. **File permissions**
   ```bash
   chmod 755 uploads/
   chmod 644 .env
   ```

4. **Node.js versjon**
   - Sjekk at Domeneshop støtter Node.js 16+
   - Bruk `node --version` for å sjekke

### Logging

Sjekk applikasjonslogger:
```bash
tail -f app.log
```

### Restart applikasjonen

```bash
# Stopp prosess
pkill -f "node dist/server.js"

# Start på nytt
npm start
```

## 🔄 Oppdateringer

For å oppdatere applikasjonen:

1. Bygg ny versjon lokalt
2. Last opp kun `dist/` mappen
3. Restart applikasjonen

## 🛡 Sikkerhet

- Sett sterke JWT_SECRET
- Bruk HTTPS i produksjon
- Begrens file upload størrelse
- Valider all input

## 📞 Support

Ved problemer:
1. Sjekk applikasjonslogger
2. Verifiser database tilkobling
3. Test API endepunkter direkte
4. Kontakt Domeneshop support for server-spesifikke problemer