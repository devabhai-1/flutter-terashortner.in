# ShortEarn - Smart Link Shortener PWA

A modern, professional URL shortener with PWA support, Firebase integration, and earning capabilities. Create short, trackable links and earn money through CPM-based revenue sharing.

## ✨ Features

- 🔗 **URL Shortening** - Create short, trackable links instantly
- 💰 **Earn Money** - CPM-based earning system (₹150-₹400 per 1000 impressions)
- 📊 **Real-time Analytics** - Track clicks, earnings, and performance
- 📱 **PWA Support** - Installable Progressive Web App
- 🔐 **Firebase Authentication** - Secure login/signup system
- 💸 **Withdrawal System** - UPI, Bank Transfer, and Crypto withdrawals
- 🤖 **Telegram Bot Integration** - Shorten links via Telegram
- 📈 **Dashboard** - 120 days of data with 10-day earnings chart
- 🎨 **Professional UI** - Modern, responsive design optimized for iPhone

## 🚀 Tech Stack

- **Frontend**: React 19 + TypeScript
- **Build Tool**: Vite
- **Backend**: Firebase (Authentication, Realtime Database)
- **PWA**: vite-plugin-pwa + Workbox
- **Charts**: Recharts
- **Routing**: React Router DOM

## 📋 Prerequisites

- Node.js 18+ installed
- Firebase project with Realtime Database enabled
- npm or yarn package manager

## 🛠️ Setup Instructions

### 1. Clone the Repository

```bash
git clone https://github.com/YOUR_USERNAME/terashortner.git
cd terashortner
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Create a `.env` file in the root directory:

```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
VITE_FIREBASE_DATABASE_URL=your_database_url
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id
```

**Get Firebase credentials from:**
- Firebase Console → Project Settings → General → Your apps → Web app config

### 4. Start Development Server

```bash
npm run dev
```

The app will be available at `http://localhost:5173`

## 📦 Build for Production

```bash
npm run build
```

The production build will be in the `dist/` folder.

### Preview Production Build

```bash
npm run preview
```

## 📱 PWA Installation

### Chrome/Edge (Desktop)

1. Visit the deployed website
2. Click the install icon in the address bar
3. Or click "Install" in the install prompt
4. The app will open in a standalone window

### Mobile (Chrome/Edge)

1. Visit the website
2. Tap the menu (three dots)
3. Select "Add to Home Screen" or "Install App"
4. The app will appear on your home screen

## 🗂️ Project Structure

```
terashortner/
├── public/
│   ├── logo.png          # App logo
│   └── manifest.json     # PWA manifest
├── src/
│   ├── components/       # Reusable components
│   │   ├── Navbar.tsx
│   │   ├── Footer.tsx
│   │   ├── DashboardSidebar.tsx
│   │   └── InstallPrompt.tsx
│   ├── pages/            # Page components
│   │   ├── Home.tsx
│   │   ├── Login.tsx
│   │   ├── Signup.tsx
│   │   ├── Dashboard.tsx
│   │   ├── Shorten.tsx
│   │   ├── Withdraw.tsx
│   │   ├── Telegram.tsx
│   │   ├── Support.tsx
│   │   └── Profile.tsx
│   ├── styles/           # CSS files
│   ├── utils/            # Utility functions
│   │   ├── firebase.ts
│   │   └── auth.ts
│   ├── config.ts         # Firebase config
│   ├── App.tsx           # Main app component
│   └── main.tsx          # Entry point
├── .env.example          # Environment variables template
├── vite.config.ts        # Vite + PWA configuration
└── package.json
```

## 🛣️ Available Routes

- `/` - Home page with URL shortener
- `/login` - User login
- `/signup` - User registration
- `/dashboard` - User dashboard (requires auth)
- `/shorten` - Shorten links page (requires auth)
- `/withdraw` - Withdrawal management (requires auth)
- `/telegram` - Telegram bot info (requires auth)
- `/support` - Support contact (requires auth)
- `/profile` - User profile settings (requires auth)

## 🔥 Firebase Setup

### Database Structure

```
users/
  {emailKey}/
    dashboard/
      totalLinks
      totalEarnings
      totalImpressions
      dailyStats/
        {date}/
          earnings
          impressions
    shortner/
      web/
        {fileId}/
          originalUrl
          shortUrl
          fileId
          createdAt
          views
    withdrawals/
      totalavailable
      totalWithdrawn
      history/
        {key}/
          method
          amount
          details
          status
          date
shortLinks/
  {fileId}/
    originalUrl
    shortUrl
    fileId
    createdAt
    dailyViews/
      {date}/
        views
```

## 🎨 Features in Detail

### URL Shortening
- Extract file ID from Terabox links
- Generate short URLs
- Track clicks and views
- Real-time statistics

### Earnings System
- Dynamic CPM rates (₹150-₹400 per 1000 impressions)
- Real-time earnings calculation
- 120 days of historical data
- 10-day earnings chart

### Withdrawal Options
- **UPI** - Instant transfer
- **Bank Transfer** - 1-3 business days
- **Crypto** - Blockchain transfer
- Minimum withdrawal: ₹10
- Optional WhatsApp notifications

### PWA Features
- Offline support
- Install to home screen
- Fast loading with caching
- Auto-updates
- Standalone app experience

## 🔒 Security

- Environment variables for sensitive data
- Firebase Authentication
- Secure database rules (configure in Firebase Console)
- HTTPS required for PWA

## 📝 License

Private/Proprietary

## 🤝 Contributing

This is a private project. For issues or questions, contact support.

## 📧 Support

- **Email**: support@shortearn.com
- **Telegram**: @Zek_indian

## 🚀 Deployment

### Vercel

1. Push code to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy

### Netlify

1. Push code to GitHub
2. Connect repository in Netlify
3. Add environment variables
4. Deploy

### Firebase Hosting

```bash
npm install -g firebase-tools
firebase login
firebase init hosting
npm run build
firebase deploy
```

## 📄 Environment Variables Template

See `.env.example` for the required environment variables.

---

**Made with ❤️ using React, Firebase, and Vite**
