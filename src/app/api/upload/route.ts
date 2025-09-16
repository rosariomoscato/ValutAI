import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
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

    return NextResponse.json({ 
      success: true, 
      message: `File "${file.name}" uploaded successfully. Processed ${data.length} records.`,
      datasetId,
      recordCount: data.length,
    });

  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ 
      error: 'Failed to process file. Please try again.' 
    }, { status: 500 });
  }
}