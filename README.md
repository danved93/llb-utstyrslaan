# LLB Utstyrslån

En webapplikasjon for utlån av utstyr bygget med TypeScript, React, Express og PostgreSQL.

## 🚀 Funksjoner

- **Brukerautentisering**: Registrering og innlogging med JWT
- **Admin godkjenning**: Admin kan godkjenne nye lånetakere
- **Lånhåndtering**: Opprett, håndter og returner lån
- **Bildeopplasting**: Last opp bilder ved låning og retur
- **Dashboard**: Oversikt over lån og statistikk
- **Responsivt design**: Fungerer på desktop og mobil

## 🛠 Teknologier

- **Frontend**: React 18, TypeScript, React Router
- **Backend**: Node.js, Express, TypeScript
- **Database**: PostgreSQL (Neon)
- **ORM**: Prisma
- **Autentisering**: JWT
- **Filbehandling**: Multer
- **Build**: Vite

## 📁 Prosjektstruktur

```
llb-utstyrslaan/
├── src/
│   ├── client/          # React frontend
│   │   ├── components/  # React komponenter
│   │   ├── pages/       # Sidekomponenter
│   │   ├── contexts/    # React contexts
│   │   ├── utils/       # Hjelpefunksjoner
│   │   └── styles/      # CSS filer
│   ├── server/          # Express backend
│   │   ├── routes/      # API routes
│   │   ├── middleware/  # Express middleware
│   │   └── utils/       # Backend hjelpefunksjoner
│   └── shared/          # Delte typer
├── prisma/              # Database schema
├── dist/                # Bygde filer
└── uploads/             # Opplastede bilder
```

## 🔧 Installasjon og oppsett

### 1. Klon prosjektet

```bash
git clone <repository-url>
cd llb-utstyrslaan
```

### 2. Installer avhengigheter

```bash
npm install
```

### 3. Sett opp miljøvariabler

Kopier `env.example` til `.env` og fyll inn verdiene:

```bash
cp env.example .env
```

Rediger `.env` filen:

```env
# Database URL fra Neon PostgreSQL
DATABASE_URL="postgresql://username:password@hostname:port/database_name?sslmode=require"

# JWT Secret (generer en sterk hemmelighet)
JWT_SECRET="din_sterke_jwt_hemmelighet_her"

# Server konfigurasjon
PORT=5000
NODE_ENV=development

# Client URL for CORS
CLIENT_URL=http://localhost:3000

# Upload konfigurasjon
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=5242880
```

### 4. Sett opp database

```bash
# Generer Prisma client
npm run generate

# Kjør database migrasjoner
npx prisma migrate dev --name init

# (Valgfritt) Åpne Prisma Studio for å se databasen
npm run studio
```

### 5. Opprett admin bruker

Etter at du har startet applikasjonen, registrer en bruker og oppdater den direkte i databasen:

```sql
UPDATE users SET role = 'ADMIN', is_approved = true WHERE email = 'din@email.com';
```

## 🚦 Utvikling

### Start utviklingsserver

```bash
# Start både frontend og backend
npm run dev

# Eller start separat:
npm run dev:server  # Backend på port 5000
npm run dev:client  # Frontend på port 3000
```

### Bygg for produksjon

```bash
npm run build
```

### Start produksjonsserver

```bash
npm start
```

## 🌐 Deployment til Domeneshop

### 1. Forbered bygget

```bash
npm run build
```

### 2. Last opp til server

Last opp følgende filer til din Domeneshop webhosting:

```
dist/                 # Bygde filer
node_modules/         # Kun produksjonsavhengigheter
package.json
.env                  # Med produksjonsverdier
```

### 3. Miljøvariabler for produksjon

Oppdater `.env` for produksjon:

```env
NODE_ENV=production
PORT=80
CLIENT_URL=https://ditdomene.no
DATABASE_URL="postgresql://..."
JWT_SECRET="..."
```

### 4. Start applikasjonen

På Domeneshop server:

```bash
npm run migrate  # Kjør migrasjoner
npm start        # Start produksjonsserver
```

## 📊 Bruk av applikasjonen

### For admin

1. Registrer en bruker
2. Oppdater brukeren til admin i databasen
3. Logg inn og gå til Admin panel
4. Godkjenn nye brukere som ønsker å låne utstyr

### For lånetakere

1. Registrer en konto
2. Vent på godkjenning fra admin
3. Etter godkjenning kan du:
   - Opprette nye lån
   - Last opp bilder av utstyr
   - Registrere retur med bilder
   - Se oversikt over alle dine lån

## 🔒 Sikkerhet

- Passord hashet med bcrypt
- JWT tokens for autentisering
- Input validering på frontend og backend
- CORS konfigurasjon
- File upload begrensninger

## 🐛 Feilsøking

### Vanlige problemer

1. **Database forbindelse feil**
   - Sjekk at DATABASE_URL er korrekt
   - Verifiser at Neon database er tilgjengelig

2. **Build feil**
   - Slett `node_modules` og kjør `npm install` på nytt
   - Sjekk at alle miljøvariabler er satt

3. **File upload feil**
   - Kontroller at `uploads/` mappen eksisterer
   - Sjekk MAX_FILE_SIZE innstilling

### Logger

Applikasjonen logger til console. I produksjon, sett opp logging til fil hvis nødvendig.

## 📝 API Dokumentasjon

### Autentisering

- `POST /api/auth/register` - Registrer ny bruker
- `POST /api/auth/login` - Logg inn
- `GET /api/auth/me` - Hent innlogget brukers info
- `POST /api/auth/logout` - Logg ut

### Brukere (Admin)

- `GET /api/users` - Hent alle brukere
- `GET /api/users/pending` - Hent ventende brukere
- `PUT /api/users/:id/approve` - Godkjenn/avslå bruker

### Lån

- `GET /api/loans` - Hent lån
- `POST /api/loans` - Opprett nytt lån
- `PUT /api/loans/:id/return` - Registrer retur
- `GET /api/loans/stats` - Hent statistikk (Admin)

## 🤝 Bidrag

1. Fork prosjektet
2. Opprett en feature branch
3. Commit endringene dine
4. Push til branchen
5. Opprett en Pull Request

## 📄 Lisens

Dette prosjektet er lisensiert under MIT lisensen.