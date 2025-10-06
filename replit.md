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
  - **Camera Flow**: Multi-state workflow optimized for mobile
    - Initial state: "Mulai Kamera" button with clear instructions
    - Streaming state: Live video preview with grid overlay, camera controls, and switch button
    - Captured state: Image preview with "Analisis Gambar" and "Ambil Ulang" buttons
    - Analysis state: Results display with save to history option
  - Enhanced camera preview with mobile-first design (autoplay, playsInline, muted for iOS/Android)
  - Front/back camera switching using facingMode toggle ("environment" ↔ "user")
  - Real-time video preview with composition grid overlay and visual indicators
  - Mirror effect for front-facing camera (scaleX transform)
  - Robust error handling with retry mechanisms and Indonesian error messages
  - Touch-friendly controls: large capture button, camera switch, and stop buttons
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
- **Interactive Feature Tour**: Professional onboarding system with game-like overlay
  - **Auto-launch**: Appears automatically on first visit after 1.5s delay
  - **Spotlight Effect**: Dark backdrop with SVG-based spotlight highlighting specific UI elements
  - **Smart Positioning**: Adaptive tooltip placement that prevents cropping on mobile/desktop
  - **7-Step Walkthrough**: 
    1. Welcome screen with app introduction
    2. Camera tab highlight and explanation
    3. Upload tab highlight and explanation
    4. History button highlight with feature description
    5. Goals button highlight with feature description
    6. Analysis area preview
    7. Completion screen with call-to-action
  - **Navigation Controls**: Previous/Next buttons, clickable progress dots, Skip button (X icon and "Lewati")
  - **Responsive Design**: 
    - Mobile-optimized with full-width cards and proper margins (16px)
    - Auto-scroll elements into view if off-screen
    - Smart fallback positioning (e.g., left/right becomes bottom on mobile)
    - Touch-friendly buttons with icon-only mode on small screens
  - **Animations**: Framer Motion-powered smooth transitions, pulsing highlight corners
  - **Persistence**: localStorage-based ("hasSeenFeatureTour") to prevent repeated tours
  - **Manual Trigger**: Reopen anytime via Help button (HelpCircle icon) in header
- **Legacy Feature Guide**: Step-by-step modal guide (still accessible)
  - 6 feature pages with detailed instructions
  - Card-based presentation with color-coded features
  - Full navigation with progress indicators
- **Meal History**: Complete meal tracking with localStorage
  - Save analyzed meals with automatic timestamps
  - Filter by period (7 days, 30 days, all)
  - Summary cards showing totals and averages
  - Delete individual meals
  - Export capabilities in multiple formats

### UI/UX Design
- **Mobile-First**: Responsive design optimized for mobile devices with professional UX patterns
  - Camera panel: Large touch targets, clear visual states, smooth transitions
  - Video preview: Proper aspect ratio handling with object-cover
  - Capture workflow: Intuitive flow matching upload experience
- **Indonesian Language**: Complete Indonesian localization for all user-facing text
  - All UI elements, buttons, labels, and notifications in Indonesian
  - Feature guide with step-by-step instructions in Indonesian
  - Toast notifications and error messages in Indonesian
  - Camera tips and instructions fully translated
- **Tab Navigation**: Clean interface switching between camera and upload modes
- **Loading States**: Comprehensive loading overlays and progress indicators
- **Educational Disclaimers**: Clear messaging about the educational nature of the analysis
- **Visual Feedback**: Badges, gradients, animations, and status indicators throughout
  - Active camera badge with pulse animation
  - Capture ready badge in green
  - Grid overlay during camera streaming
  - Toast notifications for all state changes

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