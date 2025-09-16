# User Interface Components

## Design System
ValutAI uses a modern, responsive design built with:
- **Tailwind CSS** for utility-first styling
- **shadcn/ui** components for consistent UI elements
- **Lucide React** for consistent iconography
- **Dark mode support** with theme switching

## Core Components

### Navigation (`site-header.tsx`)
- Responsive navigation with mobile menu support
- Active state indicators for current page
- User profile integration with avatar dropdown
- Italian language interface throughout

### Dashboard (`/dashboard`)
- Overview cards showing key metrics
- Quick action buttons for common tasks
- Getting started guide for new users
- Real-time statistics and status indicators

### Data Management (`/data`)
- Drag-and-drop file upload interface
- File format validation (Excel/CSV)
- Required field guidance and templates
- Dataset list with status indicators

### Model Training (`/model`)
- Model configuration interface
- Algorithm selection and parameter tuning
- Training progress visualization
- Performance metrics display

### Quote Scoring (`/scoring`)
- Multi-step input form for new quotes
- Real-time validation and error handling
- Prediction results with confidence scores
- Feature importance visualization

### Reports (`/reports`)
- Comprehensive performance dashboards
- Interactive charts and visualizations
- PDF export functionality
- Historical report management

### Settings (`/settings`)
- User profile management
- Security and privacy controls
- Team management (for owners)
- Data export and deletion options

## Key UI Features

### Responsive Design
- Mobile-first approach
- Breakpoints: sm (640px), md (768px), lg (1024px)
- Touch-friendly controls on mobile
- Collapsible navigation on small screens

### Accessibility
- Semantic HTML5 structure
- ARIA labels and landmarks
- Keyboard navigation support
- High contrast mode compatibility

### Loading States
- Skeleton loaders for async operations
- Progress indicators for long-running tasks
- Toast notifications for user feedback
- Error boundaries for graceful failure handling

### Italian Localization
- All UI text in Italian
- culturally appropriate date and number formatting
- Industry-specific terminology for sales teams
- Clear, professional communication style

## Visual Design

### Color Palette
- **Primary**: Blue gradient (#3B82F6 to #8B5CF6)
- **Success**: Green for positive actions
- **Warning**: Orange for caution states
- **Error**: Red for destructive actions
- **Neutral**: Gray backgrounds and text

### Typography
- Clean, readable sans-serif fonts
- Consistent spacing and hierarchy
- Professional business aesthetic
- Mobile-optimized text sizes

### Iconography
- Consistent Lucide React icons throughout
- Meaningful icon choices for actions
- Proper sizing and spacing
- Dark mode color adaptation

## Form Design
- Clear field labels and placeholders
- Real-time validation feedback
- Grouped related fields
- Progress indicators for multi-step forms
- Save/cancel action patterns

## Data Visualization
- Chart components for metrics display
- Progress bars and status indicators
- Color-coded performance metrics
- Interactive filtering and sorting