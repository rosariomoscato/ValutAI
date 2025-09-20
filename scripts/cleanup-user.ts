import { db } from '../src/lib/db';
import { deletedUserEmails } from '../src/lib/schema';
import { eq } from 'drizzle-orm';

async function cleanupUserEmail() {
  console.log('Rimuovendo ros.moscato@gmail.com dal sistema...');
  
  try {
    // Rimuovi l'utente dalla tabella deletedUserEmails
    const deletedResult = await db
      .delete(deletedUserEmails)
      .where(eq(deletedUserEmails.email, 'ros.moscato@gmail.com'))
      .returning();
    
    console.log('✓ Rimossi', deletedResult.length, 'record da deletedUserEmails');
    
    // Verifica che l'email non esista più nel sistema
    const checkDeleted = await db
      .select()
      .from(deletedUserEmails)
      .where(eq(deletedUserEmails.email, 'ros.moscato@gmail.com'));
    
    if (checkDeleted.length === 0) {
      console.log('✓ Verifica completata: email non trovata in deletedUserEmails');
    } else {
      console.log('✗ Attenzione: email ancora presente nel sistema');
    }
    
    console.log('');
    console.log('✅ PULIZIA COMPLETATA!');
    console.log('Ora ros.moscato@gmail.com può registrarsi come nuovo utente e ricevereà 50 crediti gratuiti.');
  } catch (error) {
    console.error('Errore durante la pulizia:', error);
    process.exit(1);
  }
}

cleanupUserEmail();