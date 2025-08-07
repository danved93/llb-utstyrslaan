# LLB Utstyrslån - Komplett oversikt

## 🎯 Prosjektbeskrivelse

LLB Utstyrslån er en fullstack webapplikasjon bygget i TypeScript for håndtering av utstyrslån. Applikasjonen har admin-panel for godkjenning av brukere og komplett funksjonalitet for låning og retur av utstyr med bildedokumentasjon.

## ⚡ Kjernefunksjoner

### Autentisering og autorisasjon
- **Brukerregistrering**: Sikker registrering med e-post og passord
- **JWT-basert autentisering**: Tokener med 7 dagers gyldighet
- **Rollebasert tilgang**: Admin og Låntaker roller
- **Godkjenningsystem**: Admin må godkjenne nye låntakere

### Lånhåndtering
- **Opprett lån**: Detaljert registrering med beskrivelse og lokasjon
- **Bildedokumentasjon**: Opplasting av bilder ved låning og retur
- **Statussporing**: Aktiv, Returnert, Forfalt, Kansellert
- **Returhåndtering**: Komplett returprosess med notater

### Admin-funksjoner
- **Brukergodkjenning**: Oversikt og håndtering av ventende brukere
- **Statistikk**: Dashbord med lån- og brukerstatistikk
- **Brukerstyring**: Oversikt over alle brukere og deres aktivitet

## 🏗 Teknisk arkitektur

### Frontend (React + TypeScript)
```
src/client/
├── components/         # Gjenbrukbare komponenter
│   ├── Header.tsx     # Navigasjon og brukerinfo
│   ├── LoanCard.tsx   # Lånvisning
│   ├── FileUpload.tsx # Bildeopplasting
│   └── LoadingSpinner.tsx
├── pages/             # Sidekomponenter
│   ├── LoginPage.tsx
│   ├── DashboardPage.tsx
│   ├── CreateLoanPage.tsx
│   ├── LoansPage.tsx
│   ├── AdminPage.tsx
│   └── NotApprovedPage.tsx
├── contexts/          # React Context
│   └── AuthContext.tsx
├── utils/             # Hjelpefunksjoner
│   └── api.ts         # API kommunikasjon
└── styles/            # CSS styling
    └── index.css
```

### Backend (Express + TypeScript)
```
src/server/
├── routes/            # API endepunkter
│   ├── auth.ts       # Autentisering
│   ├── users.ts      # Brukerhåndtering
│   └── loans.ts      # Lånhåndtering
├── middleware/        # Express middleware
│   ├── auth.ts       # JWT verifikasjon
│   ├── errorHandler.ts
│   └── logger.ts
├── utils/            # Backend verktøy
│   ├── database.ts   # Prisma client
│   ├── auth.ts       # Auth hjelpefunksjoner
│   ├── upload.ts     # Bildeopplasting
│   └── dotenv.ts     # Environment konfig
└── index.ts          # Server oppstart
```

### Database (PostgreSQL med Prisma)
```sql
-- Hovedtabeller
Users       # Brukerdata og roller
Loans       # Lånregistreringer
LoanPhotos  # Bildedokumentasjon

-- Enums
UserRole    # ADMIN, BORROWER
LoanStatus  # ACTIVE, RETURNED, OVERDUE, CANCELLED
PhotoType   # LOAN, RETURN
```

## 🚀 Installasjon og oppsett

### 1. Forutsetninger
- Node.js 16+
- npm eller yarn
- PostgreSQL database (Neon anbefalt)
- Git

### 2. Lokal utvikling
```bash
# Klon og installer
git clone <repository>
cd llb-utstyrslaan
npm install

# Konfigurer miljøvariabler
cp env.example .env
# Rediger .env med dine verdier

# Database oppsett
npm run generate
npx prisma migrate dev --name init

# Start utvikling
npm run dev
```

### 3. Produksjon (Domeneshop)
```bash
# Bygg applikasjonen
npm run build

# Eller bruk deploy script
./scripts/deploy.sh

# Se DEPLOYMENT.md for detaljerte instruksjoner
```

## 📊 API Endepunkter

### Autentisering
- `POST /api/auth/register` - Registrer bruker
- `POST /api/auth/login` - Logg inn
- `GET /api/auth/me` - Hent brukerinfo
- `POST /api/auth/logout` - Logg ut

### Brukere (Admin)
- `GET /api/users` - Alle brukere
- `GET /api/users/pending` - Ventende brukere
- `PUT /api/users/:id/approve` - Godkjenn/avslå bruker

### Lån
- `GET /api/loans` - Hent lån (med filtrering)
- `POST /api/loans` - Opprett lån (med bilder)
- `PUT /api/loans/:id/return` - Registrer retur
- `GET /api/loans/stats` - Statistikk (Admin)

## 🔒 Sikkerhet

### Implementerte sikkerhetstiltak
- **Passord hashing**: bcrypt med salt rounds 12
- **JWT tokens**: Signerte med hemmelighet, 7 dagers utløp
- **Input validering**: På frontend og backend
- **CORS konfigurasjon**: Begrenset til tillatte domener
- **File upload sikkerhet**: Type- og størrelsesbegrensninger
- **SQL injection beskyttelse**: Prisma ORM

### Produksjonssikkerhet
- Bruk HTTPS i produksjon
- Sett sterk JWT_SECRET (minimum 32 tegn)
- Begrens file upload størrelse
- Implementer rate limiting hvis nødvendig

## 🎨 Brukeropplevelse

### Responsive design
- Mobile-first tilnærming
- Fungerer på alle skjermstørrelser
- Touch-vennlig grensesnitt

### Brukervennlighet
- Intuitivt navigasjon
- Tydelige tilbakemeldinger
- Feilhåndtering med beskrivende meldinger
- Drag-and-drop bildeopplasting

## 📱 Skjermbilder av funksjonalitet

### Brukerflyt
1. **Registrering** → Bruker oppretter konto
2. **Venting** → Admin godkjenner bruker
3. **Låning** → Bruker registrerer lån med bilder
4. **Retur** → Bruker dokumenterer retur
5. **Historikk** → Oversikt over alle lån

### Admin flyt
1. **Dashboard** → Oversikt og statistikk
2. **Godkjenning** → Behandle ventende brukere
3. **Brukeradmin** → Håndter alle brukere
4. **Lånsoversikt** → Se alle lån på tvers av brukere

## 🔧 Konfigurasjon

### Miljøvariabler
```env
# Database
DATABASE_URL="postgresql://..."

# Sikkerhet
JWT_SECRET="sterk_hemmelighet_32_tegn_minimum"

# Server
PORT=5000
NODE_ENV=production
CLIENT_URL=https://ditdomene.no

# Upload
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=5242880  # 5MB
```

### Valgfrie tilpasninger
- Endre maksimal filstørrelse
- Tilpass JWT token utløpstid
- Konfigurer CORS for andre domener
- Legg til flere filtyper for upload

## 📈 Skalering og utvidelser

### Mulige forbedringer
- **E-postnotifikasjoner**: Ved godkjenning og påminnelser
- **Push-notifikasjoner**: For mobile brukere
- **Rapportering**: Avanserte rapporter og eksport
- **Integrasjoner**: Kalender, Slack, etc.
- **Booking-system**: Forhåndsreservering av utstyr
- **QR-koder**: For rask identifikasjon av utstyr

### Skalering
- **Database**: Postgres støtter høy trafikk
- **Storage**: Migrer til cloud storage (AWS S3, etc.)
- **Caching**: Redis for session/data caching
- **Load balancing**: For høy trafikk

## 🛟 Support og vedlikehold

### Logging og monitoring
- Console logging implementert
- Feilhåndtering på alle nivåer
- Health check endepunkt: `/api/health`

### Backup og gjenoppretting
- Database backup via Neon console
- Kode backup via Git
- Bildebacking anbefales til ekstern storage

### Oppdateringer
1. Test lokalt
2. Bygg ny versjon: `npm run build`
3. Deploy til staging først
4. Backup database før produksjon
5. Deploy til produksjon

## 📞 Kontakt og bidrag

### Utvikling
- Kodestandard: TypeScript strict mode
- Testing: Anbefalt å legge til enhetstester
- Git workflow: Feature branches + pull requests

### Lisens
MIT - Se LICENSE fil for detaljer

## 🎯 Sammendrag

LLB Utstyrslån er en komplett, produksjonsklar applikasjon som dekker alle aspekter av utstyrslån fra brukerregistrering til returhåndtering. Med robust sikkerhet, responsivt design og skalerbar arkitektur er den klar for deployment og bruk i produksjon.