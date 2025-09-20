import { db } from './src/lib/db.js';
import { deletedUserEmails } from './src/lib/schema.js';
import { eq } from 'drizzle-orm';

async function cleanupUser() {
  try {
    // Rimuovi l'utente dalla tabella deletedUserEmails
    const deletedResult = await db
      .delete(deletedUserEmails)
      .where(eq(deletedUserEmails.email, 'ros.moscato@gmail.com'))
      .returning();
    
    console.log('Rimosso da deletedUserEmails:', deletedResult.length, 'record');
    
    // Verifica che l'email non esista più nel sistema
    const checkDeleted = await db
      .select()
      .from(deletedUserEmails)
      .where(eq(deletedUserEmails.email, 'ros.moscato@gmail.com'));
    
    console.log('Email ancora in deletedUserEmails:', checkDeleted.length);
    
    console.log('Pulizia completata! Ora ros.moscato@gmail.com può registrarsi come nuovo utente.');
  } catch (error) {
    console.error('Errore:', error);
  }
}

cleanupUser();