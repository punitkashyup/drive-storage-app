# Drive Storage App

A modern, mobile-friendly web application that integrates with Google Drive for file storage and management. Features strong authentication and complete CRUD operations.

## Features

- 🔐 **Strong Authentication** - Google OAuth 2.0 integration
- 📁 **Google Drive Integration** - Full CRUD operations on files
- 📱 **Mobile-First Design** - Responsive and PWA-enabled
- 🎯 **Modern UI** - Built with Next.js 14, Tailwind CSS, and shadcn/ui
- ⚡ **Fast Performance** - Server-side rendering and optimized loading
- 🔒 **Secure** - Protected routes and token management

## Tech Stack

- **Frontend**: Next.js 14, React, TypeScript
- **Styling**: Tailwind CSS, shadcn/ui components
- **Authentication**: NextAuth.js with Google OAuth
- **Backend**: Next.js API routes
- **Storage**: Google Drive API v3
- **PWA**: Custom manifest and mobile optimization

## Setup Instructions

### 1. Google Cloud Console Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable the Google Drive API
4. Create OAuth 2.0 credentials:
   - Application type: Web application
   - Authorized redirect URIs: `http://localhost:3000/api/auth/callback/google`
5. Copy Client ID and Client Secret

### 2. Environment Variables

1. Copy `.env.local.example` to `.env.local`
2. Fill in your Google OAuth credentials:

```bash
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-here

GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Optional: Specific folder ID for file storage
GOOGLE_DRIVE_FOLDER_ID=your-drive-folder-id
```

### 3. Installation

```bash
# Install dependencies
npm install

# Run development server
npm run dev
```

### 4. Usage

1. Open [http://localhost:3000](http://localhost:3000)
2. Sign in with your Google account
3. Upload, manage, and organize your files
4. Access the app on mobile for app-like experience

## Project Structure

```
src/
├── app/
│   ├── api/
│   │   ├── auth/          # NextAuth.js API routes
│   │   └── files/         # File management API routes
│   ├── dashboard/         # Main dashboard page
│   ├── login/             # Authentication page
│   └── providers/         # Session provider
├── components/
│   ├── ui/                # shadcn/ui components
│   ├── FileUpload.tsx     # Drag & drop upload
│   └── FileList.tsx       # File grid/list view
├── lib/
│   ├── auth.ts            # NextAuth configuration
│   ├── google-drive.ts    # Google Drive API service
│   └── utils.ts           # Utility functions
└── types/
    └── next-auth.d.ts     # NextAuth type extensions
```

## Features Overview

### Authentication
- Google OAuth 2.0 with NextAuth.js
- Secure session management
- Protected routes with middleware
- Automatic token refresh

### File Operations
- **Upload**: Drag & drop file upload with progress
- **Read**: Browse files with search and filtering
- **Update**: Rename files with inline editing
- **Delete**: Remove files with confirmation

### Mobile Experience
- Progressive Web App (PWA) capabilities
- Mobile-responsive design
- Touch-friendly interface
- Bottom navigation for mobile
- "Add to Home Screen" support

### UI/UX
- Modern, clean interface
- Grid and list view modes
- Real-time file operations
- Loading states and error handling
- File type icons and previews

## Deployment

### Vercel (Recommended)

1. Connect your GitHub repository
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push

### Other Platforms

The app can be deployed on any platform that supports Next.js:
- Netlify
- AWS Amplify
- Railway
- Heroku
