const bcrypt = require('bcryptjs');

async function generateTestCredentials() {
  console.log('🧪 Genererer test innloggingsdetaljer...\n');
  
  // Test brukerdetaljer
  const testUsers = [
    {
      name: 'Trygve Admin',
      email: 'trygve@admin.no',
      password: 'Passord123',
      role: 'ADMIN'
    },
    {
      name: 'Test Bruker',
      email: 'test@example.com', 
      password: 'TestPass123',
      role: 'BORROWER'
    }
  ];
  
  console.log('📋 Test innloggingsdetaljer:\n');
  
  for (const user of testUsers) {
    // Hash passordet
    const saltRounds = 12;
    const passwordHash = await bcrypt.hash(user.password, saltRounds);
    
    console.log(`👤 ${user.name} (${user.role})`);
    console.log(`   Email: ${user.email}`);
    console.log(`   Passord: ${user.password}`);
    console.log(`   Hash: ${passwordHash}`);
    console.log('');
    
    // Test at passordet matcher hashen
    const isValid = await bcrypt.compare(user.password, passwordHash);
    console.log(`   ✅ Passord verifikasjon: ${isValid ? 'OK' : 'FEIL'}`);
    console.log('   ' + '─'.repeat(50));
    console.log('');
  }
  
  console.log('💡 For å teste innlogging:');
  console.log('1. Start applikasjonen: npm run dev');
  console.log('2. Gå til registreringssiden');
  console.log('3. Registrer en bruker med email og passord over');
  console.log('4. Bruk SQL-kommando for å gjøre bruker til admin:');
  console.log('   UPDATE users SET role = \'ADMIN\', is_approved = true WHERE email = \'trygve@admin.no\';');
  console.log('');
  console.log('🔒 Passordkrav:');
  console.log('- Minst 8 tegn');
  console.log('- Minst én stor bokstav');
  console.log('- Minst én liten bokstav'); 
  console.log('- Minst ett tall');
}

generateTestCredentials().catch(console.error);