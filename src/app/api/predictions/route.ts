import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { CreditsService } from '@/lib/credits';
import { prediction, model } from '@/lib/schema';
import { eq, and } from 'drizzle-orm';

export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user has enough credits for prediction (2 credits per prediction)
    const predictionCost = await CreditsService.getOperationCost('prediction');
    if (predictionCost === null) {
      // Try to initialize default operations if they don't exist
      try {
        await CreditsService.initializeDefaultOperations();
        const retryCost = await CreditsService.getOperationCost('prediction');
        if (retryCost === null) {
          return NextResponse.json({ 
            error: 'Sistema crediti non disponibile',
            userMessage: 'Al momento non è possibile verificare i crediti. Riprova più tardi.' 
          }, { status: 503 });
        }
      } catch (error) {
        return NextResponse.json({ 
          error: 'Sistema crediti non disponibile', 
          userMessage: 'Al momento non è possibile verificare i crediti. Riprova più tardi.' 
        }, { status: 503 });
      }
    }

    const hasEnoughCredits = await CreditsService.hasEnoughCredits(session.user.id, predictionCost || 2);
    if (!hasEnoughCredits) {
      const userCredits = await CreditsService.getUserCredits(session.user.id);
      return NextResponse.json({ 
        error: 'Crediti insufficienti', 
        userMessage: `Crediti insufficienti per effettuare una predizione. Richiesti ${predictionCost || 2} crediti, disponibili ${userCredits}.`,
        requiredCredits: predictionCost || 2,
        availableCredits: userCredits,
        actionNeeded: 'Ricarica i tuoi crediti per continuare',
        purchaseLink: '/credits'
      }, { status: 402 });
    }

    const { formData, modelId } = await request.json();

    // Validate input
    if (!formData || !modelId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Verify the model belongs to the user
    const modelRecord = await db
      .select()
      .from(model)
      .where(and(eq(model.id, modelId), eq(model.userId, session.user.id)))
      .limit(1);

    if (modelRecord.length === 0) {
      return NextResponse.json({ error: 'Model not found' }, { status: 404 });
    }

    // Simple prediction logic based on form data
    // In a real implementation, this would use the actual trained model
    const { totalPrice, discountPercentage, deliveryTime, customerSector, customerSize } = formData;
    
    // Base probability
    let probability = 0.5;
    
    // Adjust based on price (moderate prices have higher success rate)
    const price = parseFloat(totalPrice) || 0;
    if (price > 5000 && price < 50000) {
      probability += 0.1;
    } else if (price > 100000) {
      probability -= 0.15;
    }
    
    // Adjust based on discount (lower discounts are better)
    const discount = parseFloat(discountPercentage) || 0;
    if (discount < 10) {
      probability += 0.1;
    } else if (discount > 25) {
      probability -= 0.1;
    }
    
    // Adjust based on delivery time
    const delivery = parseInt(deliveryTime) || 0;
    if (delivery > 0 && delivery <= 30) {
      probability += 0.05;
    } else if (delivery > 90) {
      probability -= 0.1;
    }
    
    // Adjust based on customer sector
    if (customerSector === 'technology') {
      probability += 0.05;
    } else if (customerSector === 'retail') {
      probability -= 0.05;
    }
    
    // Adjust based on customer size
    if (customerSize === 'medium' || customerSize === 'large') {
      probability += 0.05;
    } else if (customerSize === 'small') {
      probability -= 0.05;
    }
    
    // Clamp probability between 0 and 1
    probability = Math.max(0, Math.min(1, probability));
    
    // Add some randomness to simulate model uncertainty
    const confidence = 0.7 + (Math.random() * 0.25); // 70-95% confidence
    
    // Generate feature importance (static for demo)
    const factors = [
      { name: 'Prezzo Totale', impact: 0.25 },
      { name: 'Sconto %', impact: 0.20 },
      { name: 'Tempi Consegna', impact: 0.15 },
      { name: 'Settore Cliente', impact: 0.15 },
      { name: 'Dimensione Cliente', impact: 0.10 },
    ];
    
    // Generate recommendations based on probability
    const recommendations = [];
    if (probability < 0.5) {
      recommendations.push('Considera ridurre il prezzo totale del preventivo');
      recommendations.push('Rivedi i tempi di consegna proposti');
      recommendations.push('Valuta un approccio più personalizzato per il cliente');
    } else if (probability < 0.7) {
      recommendations.push('Ottimizza lo sconto per migliorare le possibilità di successo');
      recommendations.push('Sottolinea i vantaggi unici della tua offerta');
    } else {
      recommendations.push('Mantieni i termini attuali, sembrano efficaci');
      recommendations.push('Preparati a seguire rapidamente con il cliente');
    }

    // Save prediction to database
    const predictionResult = await db.insert(prediction).values({
      id: crypto.randomUUID(),
      modelId: modelId,
      customerSector: formData.customerSector || null,
      customerSize: formData.customerSize || null,
      discountPercentage: formData.discountPercentage ? parseFloat(formData.discountPercentage).toString() : null,
      totalPrice: formData.totalPrice ? parseFloat(formData.totalPrice).toString() : null,
      deliveryTime: formData.deliveryTime ? parseInt(formData.deliveryTime) : null,
      channel: formData.channel || null,
      salesRep: formData.salesRep || null,
      leadSource: formData.leadSource || null,
      winProbability: probability.toString(),
      confidence: confidence.toString(),
      featureContributions: factors as any,
      recommendations: recommendations as any,
    }).returning();

    // Deduct credits for prediction
    const creditsDeducted = await CreditsService.deductCredits(
      session.user.id, 
      predictionCost || 2, 
      `Prediction for model ${modelId}`,
      'prediction',
      predictionResult[0].id
    );

    if (!creditsDeducted) {
      // Rollback - delete the prediction if credit deduction failed
      await db.delete(prediction).where(eq(prediction.id, predictionResult[0].id));
      return NextResponse.json({ 
        error: 'Failed to deduct credits. Please try again.' 
      }, { status: 500 });
    }

    return NextResponse.json({
      successProbability: probability,
      confidence: confidence,
      factors: factors,
      recommendations: recommendations,
      predictionId: predictionResult[0].id
    });

  } catch (error) {
    console.error('Error making prediction:', error);
    return NextResponse.json({ 
      error: 'Failed to make prediction. Please try again.' 
    }, { status: 500 });
  }
}