# Heart Link Surat

A secure, premium Progressive Web Application (PWA) for one-to-one audio and video calling.

## 🎯 Project Overview

Heart Link Surat is a focused communication application built with modern web technologies. This Phase 01 implementation establishes the complete production foundation including authentication, profile management, and Firebase integration - ready for WebRTC audio/video calling implementation in future phases.

### Features Implemented in Phase 01

- ✅ Complete Firebase Authentication (Email/Password + Google Sign-In)
- ✅ Protected Routes with Profile Completion Guard
- ✅ User Profile Management with Image Upload
- ✅ Online Presence System (Firebase Realtime Database)
- ✅ Installable PWA with Offline Support
- ✅ Premium Dark Mode UI with Tailwind CSS
- ✅ Responsive Mobile-First Design
- ✅ Security Rules for Firestore, Storage, and Realtime DB
- ✅ Password Reset Functionality
- ✅ Form Validation & Error Handling
- ✅ Code Splitting & Lazy Loading
- ✅ Service Worker for PWA

## 🛠 Tech Stack

### Frontend
- **React 19** - UI library
- **Vite** - Build tool and dev server
- **JavaScript** - Programming language (no TypeScript)
- **Tailwind CSS** - Utility-first CSS framework
- **React Router DOM** - Client-side routing

### Backend
- **Firebase Authentication** - User auth
- **Cloud Firestore** - NoSQL database
- **Firebase Realtime Database** - Presence system
- **Firebase Storage** - File uploads
- **Firebase Hosting** - Deployment (compatible)

### PWA
- **Vite PWA Plugin** - Service worker & manifest generation
- **Workbox** - Runtime caching strategies

## 📋 Prerequisites

- Node.js 18+ and npm
- Firebase account
- Modern browser with WebRTC support (for future phases)

## 🔧 Firebase Setup Steps

1. **Create a Firebase Project**
   - Go to [Firebase Console](https://console.firebase.google.com)
   - Click "Add project"
   - Name it "Heart Link Surat"
   - Enable Google Analytics (optional)

2. **Enable Authentication**
   - Navigate to Authentication > Sign-in method
   - Enable "Email/Password"
   - Enable "Google"

3. **Create Firestore Database**
   - Navigate to Firestore Database
   - Click "Create database"
   - Start in test mode (we'll deploy security rules later)

4. **Enable Realtime Database**
   - Navigate to Realtime Database
   - Click "Create database"
   - Start in test mode

5. **Enable Storage**
   - Navigate to Storage
   - Click "Get started"
   - Start in test mode

6. **Get Firebase Config**
   - Go to Project Settings (gear icon)
   - Scroll down to "Your apps"
   - Click "Web" icon (</>) to add a web app
   - Copy the Firebase configuration object

## 🔐 Environment Variable Setup

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Fill in your Firebase configuration values in `.env`:
   ```
   VITE_FIREBASE_API_KEY=your_api_key_here
   VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   VITE_FIREBASE_APP_ID=your_app_id
   VITE_FIREBASE_DATABASE_URL=https://your_project.firebaseio.com
   ```

## 📦 Installation Commands

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## 🚀 Development Commands

```bash
# Run development server (default: http://localhost:5173)
npm run dev

# Build for production
npm run build

# Lint code
npm run lint
```

## 🏗 Build Commands

```bash
# Production build
npm run build

# The build output will be in the "dist" directory
# You can deploy this to any static hosting service
```

## 🌐 Deployment Notes

### Firebase Hosting
```bash
# Install Firebase CLI
npm install -g firebase-tools

# Login to Firebase
firebase login

# Initialize Firebase in your project
firebase init hosting

# Deploy
firebase deploy
```

### Netlify
- Connect your GitHub repository
- Build command: `npm run build`
- Publish directory: `dist`
- The `netlify.toml` file is already configured

### Vercel
- Import your GitHub repository
- Framework preset: Vite
- Build command: `npm run build`
- Output directory: `dist`

## 📱 PWA Installation

The app is installable on:
- ✅ Android Chrome
- ✅ Desktop Chrome/Edge
- ✅ Safari (iOS 16.4+)

To install:
1. Open the app in a supported browser
2. Look for the "Install" prompt or use browser menu
3. Follow the installation flow

## 🔒 Security Rules Deployment

After setting up Firebase, deploy the security rules:

```bash
# Install Firebase CLI if not already installed
npm install -g firebase-tools

# Login
firebase login

# Initialize Firebase (if not done already)
firebase init firestore storage database

# Deploy rules
firebase deploy --only firestore:rules,storage,realtime
```

## 🐛 Troubleshooting

### Firebase Connection Issues
- Verify `.env` file has correct Firebase configuration
- Check that Firebase Authentication is enabled
- Ensure authorized domains include your deployment URL

### PWA Not Installing
- Verify HTTPS is enabled (required for PWA)
- Check that `manifest.webmanifest` is accessible
- Ensure service worker is registered

### Build Errors
- Delete `node_modules` and `package-lock.json`, then run `npm install`
- Check that all environment variables are set
- Ensure you're using Node.js 18+

### Image Upload Issues
- Verify Firebase Storage rules are deployed
- Check that the file is less than 5MB
- Ensure file type is JPG, PNG, or WEBP

## 🤖 Android Microphone/Camera HTTPS Note

For WebRTC audio/video calling (Phase 02), note that:
- **Android Chrome requires HTTPS** to access camera and microphone
- Local development (`localhost`) works without HTTPS
- Production deployment MUST use HTTPS
- PWA installed via HTTPS is considered secure

## 📁 Project Structure

```
heartlink-surat/
├── public/
│   ├── icons/              # PWA icons
│   ├── manifest.webmanifest
│   └── favicon.svg
├── src/
│   ├── components/
│   │   ├── ui/            # Reusable UI components
│   │   ├── layout/        # Layout components
│   │   ├── auth/          # Auth-related components
│   │   └── profile/       # Profile components
│   ├── pages/             # Page components
│   ├── contexts/          # React contexts
│   ├── hooks/             # Custom hooks
│   ├── firebase/          # Firebase configuration
│   ├── services/          # API services
│   ├── utils/             # Utility functions
│   ├── styles/            # Global styles
│   ├── App.jsx            # Main App component
│   └── main.jsx           # Entry point
├── firestore.rules        # Firestore security rules
├── storage.rules          # Storage security rules
├── database.rules.json    # Realtime DB rules
├── netlify.toml           # Netlify configuration
└── README.md
```

## 🎨 Design System

The app uses a premium dark mode design system:
- **Colors**: Dark theme with primary blue gradients
- **Typography**: Inter font family
- **Components**: Rounded 2xl/3xl cards, soft shadows
- **Animations**: Smooth transitions and micro-interactions
- **Mobile-First**: Touch-friendly 44px minimum targets

## 🔐 Authentication Flow

1. User opens app → Splash Screen (2.5s)
2. Check auth state:
   - Not authenticated → Welcome Page
   - Authenticated, profile incomplete → Profile Setup
   - Authenticated, profile complete → Home Dashboard
3. Protected routes redirect to appropriate pages

## 🚦 Routing Architecture

- `/` - Splash Screen (auto-redirect)
- `/welcome` - Welcome/Login choice
- `/login` - Email/Password login
- `/register` - Account registration
- `/forgot-password` - Password reset
- `/profile-setup` - First-time profile completion
- `/home` - Main dashboard (protected)
- `/settings` - User settings (protected)
- `*` - 404 Not Found

## 📊 Performance Optimizations

- Route-based code splitting (lazy loading)
- Image compression before upload
- Efficient re-render prevention
- Service worker caching
- Optimized Firebase queries

## ♿ Accessibility

- Semantic HTML elements
- ARIA labels on interactive elements
- Keyboard navigation support
- Focus management
- Screen reader compatible
- Sufficient color contrast

## 🔜 Next Steps (Phase 02)

Phase 02 will implement:
- WebRTC audio calling
- WebRTC video calling
- Call signaling with Firebase
- In-call UI and controls
- Call history

## 📄 License

MIT License - Free to use for learning and development.

## 👥 Contributing

This is a learning project. Feel free to fork and experiment!

---

**Note**: This is Phase 01 of the Heart Link Surat application. The foundation is complete and ready for WebRTC implementation in subsequent phases.
