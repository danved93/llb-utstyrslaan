#!/bin/bash

# Deployment script for LLB Utstyrslån
echo "🚀 Starter deployment av LLB Utstyrslån..."

# Sjekk at vi er i riktig mappe
if [ ! -f "package.json" ]; then
    echo "❌ Feil: Må kjøres fra prosjektets rotmappe"
    exit 1
fi

# Installer avhengigheter
echo "📦 Installerer avhengigheter..."
npm install

# Generer Prisma client
echo "🔧 Genererer Prisma client..."
npm run generate

# Bygg applikasjonen
echo "🏗️  Bygger applikasjonen..."
npm run build

# Sjekk at build filen eksisterer
if [ ! -f "dist/server.js" ]; then
    echo "❌ Build feilet - server.js ikke funnet"
    exit 1
fi

# Opprett deployment mappe
echo "📁 Forbereder deployment filer..."
rm -rf deployment
mkdir -p deployment/uploads

# Kopier nødvendige filer
cp -r dist/ deployment/
cp -r prisma/ deployment/
cp package.json deployment/
cp env.example deployment/.env.example

# Opprett produksjon package.json
cat > deployment/package.json << 'EOF'
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
EOF

echo "✅ Deployment filer klargjort i 'deployment/' mappen"
echo ""
echo "📋 Neste steg:"
echo "1. Kopier .env.example til .env og fyll inn produksjonsverdier"
echo "2. Last opp 'deployment/' mappen til Domeneshop server"
echo "3. SSH inn på serveren og kjør:"
echo "   npm install --production"
echo "   npm run generate"
echo "   npm run migrate"
echo "   npm start"
echo ""
echo "📖 Se DEPLOYMENT.md for detaljerte instruksjoner"