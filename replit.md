# Overview

Kids-B-Care is a nutrition analysis application that helps identify food items in images and provides detailed nutritional information. The app supports both image upload and camera capture functionality, using AI models to analyze food composition and generate comprehensive nutrition data including macronutrients, micronutrients, and estimated serving sizes.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **React + TypeScript**: Modern React application built with TypeScript for type safety
- **Vite Build System**: Fast development server and optimized production builds
- **Component Library**: Extensive use of shadcn/ui components built on Radix UI primitives
- **Styling**: Tailwind CSS with CSS variables for theming and responsive design
- **State Management**: TanStack Query for server state management and caching

### Backend Architecture
- **Express.js Server**: Node.js backend with Express framework
- **API Route Structure**: RESTful API endpoints for image analysis
- **AI Integration**: Dual-model approach using Sumopod API
  - Gemini 2.0 Flash for uploaded images (more powerful multimodal analysis)
  - GPT-5 Nano for camera captures (lightweight and fast)
- **Image Processing**: Client-side image resizing and optimization before API calls

### Data Management
- **Drizzle ORM**: Type-safe database toolkit with PostgreSQL dialect
- **Schema Validation**: Zod schemas for runtime type checking and validation
- **File Exports**: JSON and CSV download functionality for nutrition data

### Core Features
- **Dual Input Methods**: Camera capture with device selection and file upload with drag-and-drop
  - Enhanced camera preview with better mobile visibility (black background, metadata loading)
  - Front/back camera switching using facingMode (environment/user)
  - Real-time video preview with grid overlay for composition guidance
  - Mirror effect for front-facing camera
- **Food Item Detection**: Multi-item food composition analysis with bounding box overlays
- **Nutrition Analysis**: Comprehensive nutritional breakdown including:
  - Macronutrients (protein, carbs, fat, fiber, sugar)
  - Micronutrients (vitamins, minerals)
  - Estimated serving sizes in grams
  - Allergen identification
- **Visual Feedback**: Precise bounding box overlays on analyzed images
- **Data Export**: Multiple export formats for meal history
  - JSON: Full data backup with complete analysis details
  - CSV: Spreadsheet format for Excel/Google Sheets analysis
  - TXT: Readable report with summary and detailed breakdowns
  - Period-specific exports (week, month, or all time)
- **Feature Guide**: Interactive onboarding and help system
  - Automatically shows on first visit (localStorage-based)
  - 6 feature pages with step-by-step instructions
  - Reopen anytime via Help button in header
  - Full navigation with progress indicators
- **Meal History**: Complete meal tracking with localStorage
  - Save analyzed meals with automatic timestamps
  - Filter by period (7 days, 30 days, all)
  - Summary cards showing totals and averages
  - Delete individual meals
  - Export capabilities in multiple formats

### UI/UX Design
- **Mobile-First**: Responsive design optimized for mobile devices
- **Indonesian Language**: Complete Indonesian localization for all user-facing text
  - All UI elements, buttons, labels, and notifications in Indonesian
  - Feature guide with step-by-step instructions in Indonesian
  - Toast notifications and error messages in Indonesian
- **Tab Navigation**: Clean interface switching between camera and upload modes
- **Loading States**: Comprehensive loading overlays and progress indicators
- **Educational Disclaimers**: Clear messaging about the educational nature of the analysis

## External Dependencies

### AI Services
- **Sumopod API**: Primary AI service for food recognition and nutrition analysis
  - Gemini 2.0 Flash model for uploaded images
  - GPT-5 Nano model for camera captures

### Database
- **PostgreSQL**: Primary database using Neon serverless PostgreSQL
- **Drizzle Kit**: Database migrations and schema management

### UI Framework
- **Radix UI**: Headless UI primitives for accessibility and functionality
- **Lucide React**: Icon library for consistent iconography
- **TanStack Query**: Server state management and data fetching

### Development Tools
- **Vite**: Build tool and development server
- **TypeScript**: Static type checking
- **Tailwind CSS**: Utility-first CSS framework
- **PostCSS**: CSS processing and optimization

### Deployment
- **Replit Integration**: Development environment plugins and tooling
- **Environment Variables**: Secure API key management through environment configuration