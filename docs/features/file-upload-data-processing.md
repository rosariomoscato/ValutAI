# File Upload and Data Processing

## Overview
ValutAI's data ingestion system is designed to handle Excel and CSV file uploads with robust validation, guided column mapping, and automated data processing. The system ensures data quality and prepares it for machine learning workflows.

## File Upload Process

### Supported Formats
- **Excel Files**: .xlsx, .xls (max 50MB)
- **CSV Files**: .csv (max 50MB)
- **Encoding**: UTF-8, ISO-8859-1 (auto-detection)
- **Compression**: No compression (uncompressed files only)

### Upload Validation
```typescript
interface UploadValidation {
  // File requirements
  minRows: number;           // Minimum 30 rows required
  maxFileSize: number;      // 50MB maximum file size
  allowedFormats: string[];  // ['.xlsx', '.xls', '.csv']
  
  // Content validation
  requiredColumns: string[]; // ['outcome', 'totalPrice', 'date']
  optionalColumns: string[]; // ['customerSector', 'discountPercentage', etc.]
  
  // Data quality checks
  dataTypes: {
    outcome: 'won' | 'lost';
    totalPrice: 'number';
    date: 'date';
  };
}
```

### Upload Flow
1. **File Selection**: User selects Excel/CSV file
2. **Format Validation**: File type and size validation
3. **Content Preview**: Show first 10 rows for verification
4. **Column Mapping**: Guided mapping to system fields
5. **Data Validation**: Check data quality and requirements
6. **Processing**: Background job for data ingestion
7. **Confirmation**: Success/failure notification

## Column Mapping System

### Required Fields
```typescript
interface RequiredField {
  name: string;
  type: 'string' | 'number' | 'date' | 'boolean';
  description: string;
  examples: string[];
  validation: (value: any) => boolean;
}

const requiredFields: RequiredField[] = [
  {
    name: 'outcome',
    type: 'string',
    description: 'Final result of the quote',
    examples: ['won', 'lost', 'vinto', 'perso'],
    validation: (value) => ['won', 'lost', 'vinto', 'perso'].includes(value.toLowerCase())
  },
  {
    name: 'totalPrice',
    type: 'number',
    description: 'Total quote value in EUR',
    examples: ['10000', '15000.50', '25000'],
    validation: (value) => !isNaN(parseFloat(value)) && parseFloat(value) > 0
  },
  {
    name: 'date',
    type: 'date',
    description: 'Quote creation date',
    examples: ['2024-01-15', '15/01/2024', '01-15-2024'],
    validation: (value) => !isNaN(Date.parse(value))
  }
];
```

### Optional Fields
```typescript
interface OptionalField {
  name: string;
  type: 'string' | 'number' | 'date';
  description: string;
  examples: string[];
  defaultValue?: any;
}

const optionalFields: OptionalField[] = [
  {
    name: 'customerSector',
    type: 'string',
    description: 'Customer industry sector',
    examples: ['Technology', 'Manufacturing', 'Services', 'Retail']
  },
  {
    name: 'customerSize',
    type: 'string',
    description: 'Company size category',
    examples: ['Small', 'Medium', 'Large', 'Enterprise']
  },
  {
    name: 'discountPercentage',
    type: 'number',
    description: 'Discount percentage applied',
    examples: ['0', '10', '15.5', '20']
  },
  {
    name: 'deliveryTime',
    type: 'number',
    description: 'Delivery time in days',
    examples: ['30', '45', '60', '90']
  },
  {
    name: 'channel',
    type: 'string',
    description: 'Sales channel',
    examples: ['Direct', 'Partner', 'Online', 'Retail']
  },
  {
    name: 'salesRep',
    type: 'string',
    description: 'Sales representative name',
    examples: ['Mario Rossi', 'Laura Bianchi', 'Paolo Verdi']
  },
  {
    name: 'leadSource',
    type: 'string',
    description: 'Lead generation source',
    examples: ['Website', 'Referral', 'Cold Call', 'Event', 'Social Media']
  }
];
```

## Data Processing Pipeline

### Stage 1: File Parsing
```typescript
interface FileParser {
  // Excel parsing
  parseExcel(buffer: Buffer): Promise<any[]>;
  
  // CSV parsing
  parseCSV(buffer: Buffer, delimiter?: string): Promise<any[]>;
  
  // Encoding detection
  detectEncoding(buffer: Buffer): string;
  
  // Delimiter detection
  detectDelimiter(sample: string): string;
}
```

### Stage 2: Data Validation
```typescript
interface DataValidator {
  // Row validation
  validateRow(row: any, mapping: ColumnMapping): ValidationResult;
  
  // Data type conversion
  convertTypes(row: any, mapping: ColumnMapping): any;
  
  // Outlier detection
  detectOutliers(column: string, values: any[]): Outlier[];
  
  // Missing value handling
  handleMissingValues(data: any[], strategy: 'remove' | 'impute'): any[];
}
```

### Stage 3: Feature Engineering
```typescript
interface FeatureEngineer {
  // Calculate derived features
  calculateFeatures(quote: RawQuote): DerivedFeatures;
  
  // Normalize numerical features
  normalizeFeatures(features: DerivedFeatures): NormalizedFeatures;
  
  // Encode categorical features
  encodeFeatures(features: DerivedFeatures): EncodedFeatures;
  
  // Feature selection
  selectFeatures(features: EncodedFeatures): SelectedFeatures;
}
```

### Stage 4: Quality Assurance
```typescript
interface QualityAssurance {
  // Data completeness
  checkCompleteness(data: any[]): CompletenessReport;
  
  // Data consistency
  checkConsistency(data: any[]): ConsistencyReport;
  
  // Data accuracy
  checkAccuracy(data: any[]): AccuracyReport;
  
  // Generate quality report
  generateReport(data: any[]): QualityReport;
}
```

## Column Mapping Interface

### Mapping Component
```typescript
interface ColumnMapping {
  sourceColumn: string;       // Original column name in file
  targetField: string;        // System field name
  dataType: string;           // Expected data type
  required: boolean;          // Is this field required?
  mapped: boolean;           // Has been mapped by user?
  confidence: number;         // Auto-mapping confidence
}
```

### Auto-Mapping Algorithm
```typescript
interface AutoMapping {
  // Fuzzy matching for column names
  fuzzyMatch(source: string, targets: string[]): MatchResult;
  
  // Content-based detection
  detectByContent(column: any[], fieldType: string): number;
  
  // Pattern matching
  detectByPattern(columnName: string): string;
  
  // Confidence scoring
  calculateConfidence(match: MatchResult, contentScore: number): number;
}
```

## Error Handling and Validation

### Upload Errors
```typescript
interface UploadError {
  code: string;
  message: string;
  severity: 'error' | 'warning' | 'info';
  suggestions: string[];
  details?: any;
}

const errorCodes = {
  FILE_TOO_LARGE: {
    message: 'File size exceeds 50MB limit',
    suggestions: ['Compress file', 'Remove unnecessary columns', 'Split into multiple files']
  },
  INVALID_FORMAT: {
    message: 'Unsupported file format',
    suggestions: ['Convert to Excel (.xlsx)', 'Save as CSV (.csv)', 'Check file extension']
  },
  INSUFFICIENT_ROWS: {
    message: 'File contains less than 30 rows',
    suggestions: ['Add more historical data', 'Check file content', 'Combine multiple files']
  },
  MISSING_REQUIRED_COLUMNS: {
    message: 'Required columns not found',
    suggestions: ['Add outcome column', 'Add price column', 'Add date column']
  }
};
```

### Data Validation Errors
```typescript
interface ValidationError {
  row: number;
  column: string;
  value: any;
  error: string;
  severity: 'error' | 'warning';
  suggestion: string;
}

const validationErrors = {
  INVALID_OUTCOME: {
    error: 'Invalid outcome value',
    suggestion: 'Use "won" or "lost"'
  },
  INVALID_PRICE: {
    error: 'Invalid price value',
    suggestion: 'Use positive numbers only'
  },
  INVALID_DATE: {
    error: 'Invalid date format',
    suggestion: 'Use YYYY-MM-DD format'
  },
  OUTLIER_DETECTED: {
    error: 'Outlier value detected',
    suggestion: 'Verify data accuracy'
  }
};
```

## Progress Tracking

### Upload Progress
```typescript
interface UploadProgress {
  stage: 'uploading' | 'validating' | 'mapping' | 'processing' | 'complete';
  progress: number;           // 0-100 percentage
  currentStep: string;
  totalSteps: number;
  estimatedTime: number;     // Estimated completion time
  errors: ValidationError[];
  warnings: ValidationWarning[];
}
```

### Background Processing
```typescript
interface BackgroundJob {
  id: string;
  type: 'data_import' | 'feature_engineering' | 'model_training';
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: number;
  startTime: Date;
  estimatedCompletion: Date;
  result?: any;
  error?: string;
}
```

## Performance Optimization

### Large File Handling
- **Streaming Processing**: Process files in chunks to avoid memory issues
- **Parallel Processing**: Multi-threaded data validation and transformation
- **Caching**: Cache validation results and processed data
- **Batch Operations**: Process data in batches for efficiency

### Memory Management
- **Chunk Processing**: Process 1000 rows at a time
- **Garbage Collection**: Clean up intermediate objects
- **Memory Limits**: Enforce memory usage limits
- **Progressive Loading**: Load data progressively

## Security Considerations

### File Security
- **Virus Scanning**: Scan uploaded files for malware
- **File Type Validation**: Verify actual file content matches extension
- **Size Limits**: Enforce file size restrictions
- **Secure Storage**: Store files in secure, non-public directories

### Data Privacy
- **Anonymization**: Option to anonymize sensitive data
- **Encryption**: Encrypt files at rest
- **Access Control**: Restrict file access to authorized users
- **Audit Logging**: Log all file access and processing

## Integration with ML Pipeline

### Data Preparation
- **Training Set Preparation**: Split data for model training
- **Feature Store**: Store processed features for model training
- **Versioning**: Track data versions for reproducibility
- **Metadata**: Store data processing metadata

### Model Integration
- **Training Data Pipeline**: Direct integration with model training
- **Feature Consistency**: Ensure consistent feature engineering
- **Data Validation**: Validate input data for predictions
- **Monitoring**: Monitor data quality over time