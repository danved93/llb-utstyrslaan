const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function createAdminUser() {
  try {
    // Brukerdetaljer
    const name = 'Trygve Admin';
    const email = 'trygve@admin.no';
    const password = 'Passord123'; // Oppdatert til å møte kravene
    
    console.log('Oppretter admin bruker...');
    console.log('Email:', email);
    console.log('Navn:', name);
    
    // Sjekk om bruker allerede eksisterer
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() }
    });
    
    if (existingUser) {
      console.log('❌ Bruker med denne email-adressen eksisterer allerede!');
      console.log('Eksisterende bruker:', {
        id: existingUser.id,
        name: existingUser.name,
        email: existingUser.email,
        role: existingUser.role,
        isApproved: existingUser.isApproved
      });
      
      // Oppdater eksisterende bruker til admin hvis ikke allerede admin
      if (existingUser.role !== 'ADMIN') {
        console.log('Oppdaterer eksisterende bruker til admin...');
        const updatedUser = await prisma.user.update({
          where: { id: existingUser.id },
          data: {
            role: 'ADMIN',
            isApproved: true
          }
        });
        console.log('✅ Bruker oppdatert til admin:', updatedUser);
      } else {
        console.log('✅ Bruker er allerede admin');
      }
      return;
    }
    
    // Hash passordet
    const saltRounds = 12;
    const passwordHash = await bcrypt.hash(password, saltRounds);
    
    // Opprett bruker
    const user = await prisma.user.create({
      data: {
        name: name.trim(),
        email: email.toLowerCase(),
        passwordHash,
        role: 'ADMIN',
        isApproved: true,
      },
    });
    
    console.log('✅ Admin bruker opprettet!');
    console.log('Brukerdetaljer:');
    console.log('- ID:', user.id);
    console.log('- Navn:', user.name);
    console.log('- Email:', user.email);
    console.log('- Rolle:', user.role);
    console.log('- Godkjent:', user.isApproved);
    console.log('- Opprettet:', user.createdAt);
    
    console.log('\n🔐 Innloggingsdetaljer:');
    console.log('Email:', email);
    console.log('Passord:', password);
    
  } catch (error) {
    console.error('❌ Feil ved opprettelse av admin bruker:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createAdminUser();