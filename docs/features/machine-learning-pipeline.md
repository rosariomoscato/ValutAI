# Machine Learning Pipeline

## Overview
ValutAI implements a comprehensive machine learning pipeline designed specifically for sales prediction in Italian SMEs. The system focuses on interpretability, performance, and actionable insights.

## Model Architecture

### Primary Algorithm: Logistic Regression
- **Why Logistic Regression?**
  - High interpretability for business users
  - Provides probability scores suitable for sales prediction
  - Handles both numerical and categorical features
  - Computationally efficient for real-time predictions
  - Built-in feature importance through coefficients

### Model Training Pipeline

#### 1. Data Preprocessing
```typescript
// Feature engineering pipeline
interface FeaturePipeline {
  // Raw data cleaning
  removeDuplicates(data: Quote[]): Quote[];
  handleMissingValues(data: Quote[]): Quote[];
  
  // Feature engineering
  calculateDiscountPercentage(quote: Quote): number;
  deriveResponseTime(quote: Quote): number;
  normalizePriceRanges(price: number): number;
  
  // Categorical encoding
  encodeCustomerSector(sector: string): number[];
  encodeCustomerSize(size: string): number;
  
  // Temporal features
  extractSeasonalFeatures(date: Date): number[];
  calculateLeadTime(createdAt: Date, outcomeDate: Date): number;
}
```

#### 2. Feature Selection
- **Variance Threshold**: Remove low-variance features
- **Correlation Analysis**: Eliminate highly correlated features
- **Feature Importance**: Select top predictive features
- **Domain Knowledge**: Business-relevant feature selection

#### 3. Model Training
```typescript
interface ModelTraining {
  // Algorithm selection
  algorithm: 'logistic_regression' | 'random_forest' | 'catboost';
  
  // Hyperparameter optimization
  hyperparameters: {
    regularization: 'l1' | 'l2';
    C: number; // Regularization strength
    class_weight: 'balanced' | 'auto';
    max_iter: number;
    random_state: number;
  };
  
  // Cross-validation
  cvStrategy: {
    type: 'temporal_split' | 'k_fold';
    n_splits: number;
    test_size: number;
  };
}
```

#### 4. Validation Strategy
- **Temporal Split**: Respect time series nature of sales data
- **5-Fold CV**: Robust performance estimation
- **Stratified Sampling**: Maintain class distribution
- **Business Metrics**: Focus on AUC-ROC and Brier score

### Performance Metrics

#### Primary Metrics
- **AUC-ROC**: Area Under ROC Curve (target > 0.70)
- **Brier Score**: Probability calibration (target < 0.25)
- **Log Loss**: Proper scoring rule
- **Accuracy**: Overall correctness

#### Secondary Metrics
- **Precision**: Positive predictive value
- **Recall**: Sensitivity or true positive rate
- **F1-Score**: Harmonic mean of precision and recall
- **Specificity**: True negative rate

#### Business Metrics
- **Expected Value**: ROI-based model evaluation
- **Lift Analysis**: Improvement over random selection
- **Decile Analysis**: Performance across probability ranges

## Feature Engineering

### Raw Features
```typescript
interface RawQuote {
  // Customer information
  customerSector: string;        // Industry classification
  customerSize: string;         // Company size category
  
  // Quote details
  totalPrice: number;          // Total quote value
  discountPercentage: number;  // Discount percentage
  deliveryTime: number;        // Delivery time in days
  
  // Sales process
  channel: string;             // Sales channel
  salesRep: string;            // Sales representative
  leadSource: string;         // Lead source
  
  // Outcome
  outcome: 'won' | 'lost';     // Final result
  outcomeDate: Date;          // Decision date
}
```

### Derived Features
```typescript
interface DerivedFeatures {
  // Price-based features
  discountAmount: number;       // Absolute discount value
  priceRange: string;          // Price category
  averageTicket: number;        // Historical average
  
  // Time-based features
  responseTime: number;        // Time to first response
  leadTime: number;            // Quote to decision time
  seasonality: number;         // Seasonal indicators
  
  // Behavioral features
  discountSensitivity: number; // Discount vs win rate correlation
  channelPerformance: number;  // Historical channel success
  representativeEffectiveness: number; // Rep performance
  
  // Composite features
  priceDeliveryRatio: number;  // Price vs delivery time
  customerRiskScore: number;   // Customer risk assessment
  opportunityScore: number;    // Overall opportunity quality
}
```

## Prediction API

### Request Format
```typescript
interface PredictionRequest {
  modelId: string;
  features: {
    customerSector: string;
    customerSize: string;
    totalPrice: number;
    discountPercentage: number;
    deliveryTime: number;
    channel: string;
    salesRep: string;
    leadSource: string;
  };
}
```

### Response Format
```typescript
interface PredictionResponse {
  prediction: {
    winProbability: number;     // 0-1 probability score
    confidence: number;         // Model confidence
    predictionId: string;       // Unique prediction identifier
  };
  
  explainability: {
    featureContributions: Array<{
      feature: string;
      contribution: number;     // Log-odds contribution
      importance: number;       // Normalized importance
      direction: 'positive' | 'negative';
    }>;
    topDrivers: string[];       // Top 3 influential features
  };
  
  recommendations: {
    quickWins: string[];        // Immediate improvements
    riskFactors: string[];      // Risk warnings
    optimalRanges: {            // Recommended value ranges
      [feature: string]: {
        min: number;
        max: number;
        optimal: number;
      };
    };
  };
  
  metadata: {
    modelVersion: string;
    timestamp: Date;
    processingTime: number;
  };
}
```

## Model Monitoring

### Performance Tracking
- **Concept Drift Detection**: Monitor feature distribution changes
- **Performance Degradation**: Track accuracy over time
- **Data Quality Monitoring**: Ensure input data consistency
- **Business Impact**: Monitor ROI and business metrics

### Automated Retraining
- **Trigger Conditions**: Performance drop or data drift
- **Version Management**: Track model versions and comparisons
- **A/B Testing**: Compare new models with production
- **Rollback Capability**: Quick revert to previous versions

## Scalability Considerations

### Performance Requirements
- **Training Time**: < 60 seconds for typical datasets
- **Prediction Time**: < 300ms for single predictions
- **Batch Processing**: < 5 seconds for 1000 predictions
- **Memory Usage**: < 2GB RAM for model operations

### Infrastructure
- **Model Serving**: Node.js-based prediction service
- **Caching**: Redis for frequent predictions
- **Queue System**: Background job processing for training
- **Monitoring**: Real-time performance dashboards

## Future Enhancements

### Advanced Algorithms
- **Random Forest**: For non-linear relationships
- **CatBoost**: For categorical feature dominance
- **Neural Networks**: For complex pattern recognition
- **Ensemble Methods**: Combining multiple models

### Advanced Features
- **Time Series Analysis**: Seasonal trends and patterns
- **Competitive Analysis**: Market position analysis
- **Customer Lifetime Value**: Long-term customer value
- **Market Conditions**: Economic indicators integration

### Explainability Enhancements
- **SHAP Values**: Advanced feature attribution
- **Counterfactual Explanations**: "What-if" scenarios
- **Interactive Explanations**: User-driven feature analysis
- **Natural Language Explanations**: Human-readable insights