import { db } from '../src/lib/db';
import { CreditsService } from '../src/lib/credits';

async function initializeCreditsSystem() {
  console.log('Initializing credits system...');
  
  try {
    // Initialize default operations
    await CreditsService.initializeDefaultOperations();
    console.log('✓ Default operations initialized');
    
    // Initialize default packages
    await CreditsService.initializeDefaultPackages();
    console.log('✓ Default packages initialized');
    
    console.log('Credits system initialized successfully!');
  } catch (error) {
    console.error('Error initializing credits system:', error);
    process.exit(1);
  }
}

initializeCreditsSystem();