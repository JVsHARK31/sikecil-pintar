# Sikecil Pintar - Kids B-Care

🍎 **AI-powered food nutrition analysis tool for tracking meals and monitoring children's nutrition intake**

## Overview

Sikecil Pintar (Kids B-Care) is an advanced nutrition analysis application designed to help parents and caregivers monitor and track children's dietary intake. Using AI technology powered by Google Gemini, the app analyzes food images to provide detailed nutritional information and recommendations.

## Features

### 📸 Image Analysis
- **Camera Capture**: Take photos directly from your device
- **File Upload**: Upload existing food images
- **AI-Powered Recognition**: Automatic food item detection and identification

### 📊 Nutritional Information
- Detailed breakdown of:
  - Calories
  - Proteins
  - Carbohydrates
  - Fats
  - Vitamins and minerals
  - Fiber content
  
### 📈 Visual Data Representation
- Interactive nutrition charts
- Color-coded nutrient indicators
- Easy-to-understand visual overlays on food items

### 💾 Data Management
- Save analysis results
- Track meal history
- Export nutrition reports

## Tech Stack

- **Frontend**: React + TypeScript + Vite
- **UI Components**: Radix UI + Tailwind CSS
- **Backend**: Express.js + Node.js
- **Database**: PostgreSQL (Neon)
- **AI Integration**: Google Gemini API
- **Authentication**: Passport.js
- **Data Visualization**: Recharts

## Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn
- PostgreSQL database (Neon account)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/JVsHARK31/sikecil-pintar.git
cd sikecil-pintar
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
Create a `.env.local` file with:
```
DATABASE_URL=your_postgresql_connection_string
```

4. Run database migrations:
```bash
npm run db:push
```

5. Start development server:
```bash
npm run dev
```

## Deployment

### Deploy to Vercel

1. Install Vercel CLI:
```bash
npm i -g vercel
```

2. Deploy:
```bash
vercel --prod
```

3. Set environment variables in Vercel Dashboard

For detailed deployment instructions, see [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run db:push` - Push database schema
- `npm run check` - Type checking

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT License - see LICENSE file for details

## Support

For issues and questions, please open an issue on GitHub or contact the development team.

---

Made with ❤️ for children's health and nutrition
