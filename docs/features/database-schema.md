# Database Schema

## Overview
ValutAI uses a comprehensive database schema designed to handle sales prediction workflows, including data ingestion, model training, predictions, and reporting.

## Core Tables

### User Management
- **user**: Stores user information with role-based access control
- **session**: Manages user sessions and authentication
- **account**: OAuth account linkage
- **verification**: Email verification tokens

### Data Management
- **dataset**: Stores uploaded dataset information and metadata
- **quote**: Individual quote records with raw and derived features

### Machine Learning
- **model**: Model metadata, training parameters, and performance metrics
- **prediction**: Prediction results with feature contributions and recommendations

### Reporting
- **report**: Generated reports with insights and analysis

## Key Features

### Role-Based Access Control
Users can have one of three roles:
- **owner**: Full access, can manage team and delete data
- **analyst**: Can upload data, train models, and export results
- **viewer**: Can view predictions and reports only

### Data Validation
All datasets undergo validation ensuring:
- Minimum 30 rows of historical data
- Required fields (outcome, price, date)
- Proper data types and formatting
- Column mapping validation

### Model Tracking
Complete audit trail for all ML models:
- Training parameters and hyperparameters
- Performance metrics (AUC-ROC, precision, recall, F1)
- Feature importance analysis
- Training time and resource usage

### Prediction Explainability
Every prediction includes:
- Win probability score
- Confidence intervals
- Feature contribution analysis
- Actionable recommendations

## Relationships
- Users → Datasets → Quotes (hierarchical data ownership)
- Datasets → Models → Predictions (ML workflow)
- Models → Reports (analysis output)

## Security
- Tenant isolation at the database level
- Encrypted sensitive data at rest
- Secure file upload handling
- Audit logging for all operations

## Performance
- Optimized for queries up to 50k rows
- Indexed for fast prediction lookups
- Efficient feature storage with JSONB columns
- Time-based partitioning for large datasets