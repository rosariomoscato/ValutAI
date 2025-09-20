import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { CreditsService } from '@/lib/credits';
import { dataset, quote } from '@/lib/schema';
import { eq } from 'drizzle-orm';
import { sql } from 'drizzle-orm';

export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if credit system is properly configured
    const isCreditSystemValid = await CreditsService.validateCreditSystem();
    if (!isCreditSystemValid) {
      console.log(`[${new Date().toISOString()}] Upload failed for user ${session.user.id}: Credit system not configured`);
      return NextResponse.json({ 
        error: 'Sistema crediti non configurato',
        userMessage: 'Il sistema di crediti non è disponibile. Contatta l\'amministratore.' 
      }, { status: 503 });
    }

    // Check if user has enough credits for dataset upload
    const datasetUploadCost = await CreditsService.getOperationCost('dataset_upload');
    const userCredits = await CreditsService.getUserCredits(session.user.id);
    const hasEnoughCredits = await CreditsService.hasEnoughCredits(session.user.id, datasetUploadCost);
    
    console.log(`[${new Date().toISOString()}] Upload attempt by user ${session.user.id}:`);
    console.log(`  - User credits: ${userCredits}`);
    console.log(`  - Operation cost: ${datasetUploadCost}`);
    console.log(`  - Has enough credits: ${hasEnoughCredits}`);
    
    if (!hasEnoughCredits) {
      console.log(`[${new Date().toISOString()}] Upload BLOCKED for user ${session.user.id}: Insufficient credits`);
      return NextResponse.json({ 
        error: 'Crediti insufficienti', 
        userMessage: `Crediti insufficienti per caricare un dataset. Richiesti ${datasetUploadCost} crediti, disponibili ${userCredits}.`,
        requiredCredits: datasetUploadCost,
        availableCredits: userCredits,
        actionNeeded: 'Ricarica i tuoi crediti per continuare',
        purchaseLink: '/credits'
      }, { status: 402 });
    }
    
    console.log(`[${new Date().toISOString()}] Upload ALLOWED for user ${session.user.id}: Sufficient credits`);

    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Validate file type
    const allowedTypes = [
      'text/csv',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel'
    ];
    
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ 
        error: 'Invalid file type. Please upload CSV or Excel files only.' 
      }, { status: 400 });
    }

    // Read file content
    const fileContent = await file.text();
    const lines = fileContent.split('\n').filter(line => line.trim());
    
    if (lines.length < 2) {
      return NextResponse.json({ 
        error: 'File must contain at least one row of data.' 
      }, { status: 400 });
    }

    // Parse CSV headers and data
    const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));
    const data = lines.slice(1).map(line => {
      const values = line.split(',').map(v => v.trim().replace(/^"|"$/g, ''));
      const row: Record<string, string> = {};
      headers.forEach((header, index) => {
        row[header] = values[index] || '';
      });
      return row;
    });

    // Validate required fields
    const requiredFields = ['Esito', 'Prezzo totale', 'Data preventivo'];
    const missingFields = requiredFields.filter(field => 
      !headers.some(header => 
        header.toLowerCase().includes(field.toLowerCase())
      )
    );

    if (missingFields.length > 0) {
      return NextResponse.json({ 
        error: `Missing required fields: ${missingFields.join(', ')}` 
      }, { status: 400 });
    }

    // Create dataset record
    const datasetResult = await db.insert(dataset).values({
      id: sql`gen_random_uuid()`,
      name: file.name.replace(/\.[^/.]+$/, ''), // Remove file extension
      fileName: file.name,
      fileSize: file.size,
      rowCount: data.length,
      columnMapping: { headers },
      userId: session.user.id,
      status: 'ready',
    }).returning({ id: dataset.id });

    const datasetId = datasetResult[0].id;

    // Process and insert quotes
    const quotesToInsert = data.map((row, index) => {
      // Find column indices for required fields
      const esitoIndex = headers.findIndex(h => h.toLowerCase().includes('esito'));
      
      return {
        id: sql`gen_random_uuid()`,
        datasetId,
        customerSector: row['Settore cliente'] || null,
        customerSize: row['Dimensione cliente'] || null,
        totalPrice: parseFloat(row['Prezzo totale (€)'] || row['Prezzo totale'] || '0').toString(),
        discountPercentage: parseFloat(row['Sconto (%)'] || row['Sconto'] || '0').toString(),
        deliveryTime: parseInt(row['Tempi consegna (giorni)'] || row['Tempi consegna'] || '0'),
        channel: row['Canale'] || row['Canale vendita'] || null,
        salesRep: row['Responsabile'] || null,
        leadSource: row['Sorgente lead'] || null,
        outcome: row[esitoIndex]?.toLowerCase() === 'vinto' ? 'won' : 'lost',
        outcomeDate: row['Data esito'] ? new Date(row['Data esito']) : null,
      };
    });

    await db.insert(quote).values(quotesToInsert);

    // Deduct credits for dataset upload
    const creditsDeducted = await CreditsService.deductCredits(
      session.user.id, 
      datasetUploadCost, 
      `Dataset upload: ${file.name}`,
      'dataset_upload',
      datasetId
    );

    // Trigger credit update event
    const { triggerCreditUpdate } = await import('@/lib/credit-events');
    triggerCreditUpdate();

    if (!creditsDeducted) {
      // Rollback - delete the dataset and quotes if credit deduction failed
      await db.delete(quote).where(eq(quote.datasetId, datasetId));
      await db.delete(dataset).where(eq(dataset.id, datasetId));
      return NextResponse.json({ 
        error: 'Failed to deduct credits. Please try again.' 
      }, { status: 500 });
    }

    const remainingCredits = await CreditsService.getUserCredits(session.user.id);
    
    return NextResponse.json({ 
      success: true, 
      message: `File "${file.name}" uploaded successfully. Processed ${data.length} records.`,
      datasetId,
      recordCount: data.length,
      creditsDeducted: datasetUploadCost,
      remainingCredits,
    });

  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ 
      error: 'Failed to process file. Please try again.' 
    }, { status: 500 });
  }
}