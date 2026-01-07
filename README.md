# ElephantNote - Video Feedback Tool

A collaborative video feedback tool built with React, TypeScript, and Firebase that allows teams to add timestamped comments and annotations to videos.

## Features

- 🎥 **Video Playback**: Support for various video formats and YouTube URLs
- 💬 **Real-time Comments**: Add timestamped comments synchronized with video playback
- 👥 **Collaboration**: Share projects with team members via unique links
- 🔐 **Authentication**: Email/password and anonymous authentication options
- 📱 **Responsive Design**: Modern, mobile-friendly interface
- ⚡ **Real-time Updates**: Live comment synchronization across all users
- 🎨 **Modern UI**: Built with Tailwind CSS and Lucide React icons

## Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS
- **Backend**: Firebase
  - **Authentication**: Firebase Auth
  - **Database**: Firestore
  - **Storage**: Firebase Storage
  - **Functions**: Firebase Cloud Functions
- **Video Player**: React Player
- **Icons**: Lucide React

## Prerequisites

- Node.js 18+ 
- npm or yarn
- Firebase account and project

## Setup Instructions

### 1. Clone the Repository

```bash
git clone <repository-url>
cd elephantnote
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Firebase Configuration

1. Create a new Firebase project at [Firebase Console](https://console.firebase.google.com/)
2. Enable the following services:
   - Authentication (Email/Password, Anonymous)
   - Firestore Database
   - Storage
   - Cloud Functions

3. Update `src/config/firebase.ts` with your Firebase configuration:

```typescript
const firebaseConfig = {
  apiKey: "your-api-key",
  authDomain: "your-project-id.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project-id.appspot.com",
  messagingSenderId: "your-messaging-sender-id",
  appId: "your-app-id"
};
```

### 4. Deploy Firebase Functions

```bash
cd functions
npm install
firebase deploy --only functions
```

### 5. Deploy Firestore Rules

```bash
firebase deploy --only firestore:rules
```

### 6. Deploy Storage Rules

```bash
firebase deploy --only storage
```

### 7. Start Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:3000`

## Project Structure

```
elephantnote/
├── src/
│   ├── components/
│   │   ├── auth/           # Authentication components
│   │   ├── common/          # Shared components
│   │   ├── dashboard/       # Dashboard components
│   │   └── project/         # Project view components
│   ├── contexts/            # React contexts
│   ├── services/            # Firebase service classes
│   ├── types/               # TypeScript type definitions
│   ├── config/              # Configuration files
│   ├── App.tsx              # Main application component
│   └── main.tsx             # Application entry point
├── functions/                # Firebase Cloud Functions
├── firestore.rules          # Firestore security rules
├── storage.rules            # Storage security rules
├── firebase.json            # Firebase configuration
└── package.json             # Dependencies and scripts
```

## Firebase Services Configuration

### Authentication
- Email/Password authentication
- Anonymous authentication for shared projects
- User profile management

### Firestore Database
- **Projects Collection**: Stores video project metadata
- **Comments Subcollection**: Stores timestamped comments for each project
- Real-time listeners for live updates

### Storage
- Video file storage with project-based organization
- Thumbnail storage for video previews
- Secure access control

### Cloud Functions
- `generateShareableLink`: Creates unique project sharing links
- `checkAccess`: Verifies user access to projects
- `updateCollaborators`: Manages project collaboration

## Usage

### Creating a Project
1. Sign in to your account
2. Click "New Project" on the dashboard
3. Enter project title and video URL
4. Click "Create Project"

### Adding Comments
1. Open a project
2. Play the video to the desired timestamp
3. Use the comment form to add feedback
4. Comments are automatically timestamped

### Sharing Projects
1. Open a project
2. Click the "Share" button on the project card
3. Copy the generated link
4. Send the link to team members

### Anonymous Access
- Users can access shared projects without creating accounts
- Anonymous users can add comments but cannot edit them later
- Each anonymous session gets a unique identifier

## Security Rules

### Firestore
- Users can only read/write projects they own or collaborate on
- Comments inherit project access permissions
- Anonymous users can read and write to shared projects

### Storage
- Video access is restricted to project participants
- Only project owners can upload/delete videos
- Public read access for shared project videos

## Development

### Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
npm run lint:fix     # Fix ESLint errors
```

### Environment Variables

Create a `.env.local` file for local development:

```env
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-domain
VITE_FIREBASE_PROJECT_ID=your-project-id
```

## Deployment

### Build and Deploy

```bash
# Build the application
npm run build

# Deploy to Firebase Hosting
firebase deploy --only hosting

# Deploy all services
firebase deploy
```

### Production Considerations

- Enable Firebase App Check for production
- Configure custom domains in Firebase Hosting
- Set up monitoring and analytics
- Implement error tracking (e.g., Sentry)

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support and questions:
- Create an issue in the repository
- Check the Firebase documentation
- Review the code comments and documentation

## Roadmap

- [ ] Video file upload functionality
- [ ] Advanced annotation tools (arrows, circles, text)
- [ ] Comment threading and replies
- [ ] Export comments and feedback
- [ ] Mobile app (React Native)
- [ ] Integration with video platforms (YouTube, Vimeo)
- [ ] Advanced collaboration features
- [ ] Analytics and reporting
