# Inside Live - Community Board Platform

A full-stack community board application built with React, Vite, Express, MongoDB, and Socket.IO. Features category-based boards, real-time notifications, OAuth authentication, and comprehensive social features.

## ✨ Features

### 🔐 Authentication & Security
- **User Registration**: Username (3-20 chars), email, and strong password validation
- **Login System**: Login with username or email (rate-limited: 5 attempts/minute)
- **OAuth Integration**: Google and GitHub authentication support
- **Remember Me**: Persistent login sessions
- **Account Recovery**: Find username by email, password reset via email verification
- **Account Management**: Update username, email, password; delete account with all posts/comments
- **Session Management**: 60-minute auto-logout with security features
- **Security Measures**: XSS prevention, password hashing (bcrypt), input validation, rate limiting

### 📝 Post Management
- **CRUD Operations**: Create, read, update, and delete posts
- **Category Boards**: Comics, Games, Movies, Books, Music, Sports
- **Advanced Search**: Search by title, title+content, comments, or author
- **Pagination**: Customizable items per page (10-50, default: 30)
- **Media Attachments**: Upload images/videos with automatic image resizing
- **Inline Images**: Insert images directly into post content
- **Reactions**: Like/unlike posts (duplicate prevention)
- **View Counter**: Automatic view count tracking
- **Bookmarks**: Save posts for later viewing

### 💬 Comment System
- **Nested Comments**: Comment on posts and reply to comments (2-level hierarchy)
- **Comment Search**: Find posts by comment content
- **Moderation**: Authors can delete their own comments
- **Real-time Updates**: Comments appear instantly via Socket.IO

### 👥 Social Features
- **Activity Tracking**: View your posts, commented posts, liked posts, and bookmarks
- **Favorite Boards**: Pin frequently used categories
- **Popular Posts**: Top 5 most-liked posts in sidebar
- **Messaging**: Direct messages between users
- **Real-time Notifications**: Get notified of new posts, comments, and messages
- **User Profiles**: View and edit profile information

### 🎨 Theming & UI
- **Dark/Light Mode**: Toggle between themes with CSS variables
- **Responsive Design**: Mobile-friendly interface
- **PWA Support**: Progressive Web App with offline capabilities
- **Modern UI**: Smooth animations and transitions

## 🏗️ Project Structure

```
Inside Live/
├── public/
│   ├── manifest.json          # PWA manifest
│   └── service-worker.js      # Service worker for offline support
├── src/
│   ├── components/            # React components
│   │   ├── Header.jsx         # Navigation header
│   │   ├── Sidebar.jsx        # Sidebar with popular posts
│   │   ├── CategoryNav.jsx    # Category navigation
│   │   ├── BoardHome.jsx      # Board listing page
│   │   ├── PostList.jsx       # Post list with pagination
│   │   ├── PostDetail.jsx     # Individual post view
│   │   ├── PostForm.jsx       # Create/edit post form
│   │   ├── Login.jsx          # Login page
│   │   ├── Register.jsx       # Registration page
│   │   ├── Profile.jsx        # User profile page
│   │   ├── MyActivity.jsx     # User activity dashboard
│   │   ├── FindAccount.jsx    # Account recovery
│   │   ├── MessageForm.jsx    # Direct messaging
│   │   └── NotificationToast.jsx # Toast notifications
│   ├── context/
│   │   ├── AuthContext.jsx    # Authentication state management
│   │   └── ThemeContext.jsx   # Theme state management
│   ├── services/
│   │   ├── api.js             # API service layer
│   │   └── socket.js          # Socket.IO client
│   ├── utils/
│   │   └── security.js        # Security utilities (XSS prevention)
│   ├── styles/
│   │   └── themes.css         # CSS variables for theming
│   ├── App.jsx                # Main application component
│   └── main.jsx               # Application entry point
└── server/                    # Backend server
    ├── server.js              # Express + Socket.IO server
    ├── models/
    │   ├── User.js            # User schema (MongoDB)
    │   └── Post.js            # Post schema (MongoDB)
    ├── routes/                # API routes
    │   ├── auth.js            # Authentication endpoints
    │   ├── posts.js           # Post CRUD endpoints
    │   ├── comments.js        # Comment endpoints
    │   ├── users.js           # User management endpoints
    │   ├── upload.js          # File upload endpoints
    │   └── email.js           # Email service endpoints
    ├── middleware/
    │   └── auth.js            # Authentication middleware
    ├── config/
    │   └── passport.js        # Passport OAuth configuration
    └── package.json
```

## 🛠️ Tech Stack

### Frontend
- **React 18.2**: Modern UI library with hooks
- **Vite 5.0**: Fast build tool and dev server
- **Context API**: Global state management
- **Socket.IO Client**: Real-time communication
- **CSS3**: Modern styling (Flexbox, Grid, Custom Properties, Animations)
- **PWA**: Service Worker, Web App Manifest

### Backend
- **Node.js & Express**: RESTful API server
- **MongoDB & Mongoose**: NoSQL database with ODM
- **Socket.IO**: Real-time bidirectional communication
- **Passport.js**: OAuth authentication (Google, GitHub)
- **bcryptjs**: Password hashing
- **JWT**: JSON Web Tokens for session management
- **Multer**: File upload handling
- **Cloudinary**: Cloud-based image storage
- **Nodemailer**: Email service for password reset
- **Helmet**: Security headers
- **Express Rate Limit**: API rate limiting

## 🚀 Getting Started

### Prerequisites
- Node.js 16+ and npm
- MongoDB instance (local or cloud)
- Cloudinary account (for image uploads)
- Google OAuth credentials (optional)
- GitHub OAuth credentials (optional)

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd SNS2
```

2. **Install frontend dependencies**
```bash
npm install
```

3. **Install backend dependencies**
```bash
cd server
npm install
```

4. **Configure environment variables**

Create `server/.env` file:
```env
# Database
MONGODB_URI=mongodb://localhost:27017/community-board

# Server
PORT=5000
NODE_ENV=development

# Session
SESSION_SECRET=your-secret-key-here

# JWT
JWT_SECRET=your-jwt-secret-here

# Cloudinary
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# OAuth (Optional)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret

# Email (Optional)
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password

# URLs
CLIENT_URL=http://localhost:5173
SERVER_URL=http://localhost:5000
```

5. **Start development servers**

Option A - Run both servers simultaneously:
```bash
npm run dev:all
```

Option B - Run servers in separate terminals:
```bash
# Terminal 1 - Backend
cd server
npm run dev

# Terminal 2 - Frontend
npm run dev
```

6. **Access the application**
- Frontend: http://localhost:5173
- Backend API: http://localhost:5000

## 📖 Usage Guide

### Registration & Login
1. **Register**: Click "Register" → Enter username (3-20 chars), email, and strong password
2. **Login**: Enter username/email and password → Check "Remember Me" for persistent session
3. **OAuth**: Click Google/GitHub button for quick authentication

### Creating Posts
1. Select a category (Comics, Games, Movies, Books, Music, Sports)
2. Click "Create Post" button
3. Enter title and content
4. Optionally attach images/videos or insert inline images
5. Click "Submit"

### Searching & Filtering
- **Search Types**: Title, Title+Content, Comments, Author
- **Related Posts**: Find other posts in the same category
- **Pagination**: Display 10-50 posts per page

### Activity Dashboard
1. Click "My Activity" in header
2. View your posts, commented posts, liked posts, and bookmarks

### Messaging
1. Click on a username to view profile
2. Send direct messages to other users
3. Receive real-time message notifications

## 🎯 Key Features Highlight

### Advanced Search System
- 4 search types (Title / Title+Content / Comments / Author)
- Search across entire board (not just displayed items)
- Dynamic placeholders and empty result messages
- Real-time search with instant results

### Sophisticated Comment System
- Two-level nested comments (comments + replies)
- Comment-based post search
- Author-only deletion rights
- Real-time comment updates via Socket.IO

### Robust Authentication
- Username or email login
- Strong password validation (8+ chars, uppercase, lowercase, number, special char)
- Rate limiting (5 attempts/minute)
- OAuth integration with Google and GitHub
- Email-based account recovery
- Automatic session timeout after 60 minutes

### File Upload Management
- Image auto-resizing for optimal performance
- Video upload support
- Inline image insertion in post content
- Cloudinary integration for scalable storage
- File type and size validation

### Real-time Features
- Live notifications for new posts and comments
- Instant messaging between users
- Real-time like/bookmark updates
- Socket.IO powered event system

### Security Implementation
- XSS prevention with HTML sanitization
- bcrypt password hashing
- JWT-based authentication
- Helmet.js security headers
- Rate limiting on sensitive endpoints
- Input validation and sanitization
- Secure session management

## 🏛️ Architecture

### Frontend Architecture
- **Component-based**: Modular React components
- **Context API**: Centralized state management (Auth, Theme)
- **Service Layer**: Abstracted API calls in `services/api.js`
- **Utility Functions**: Reusable helpers in `utils/`
- **CSS Variables**: Theme switching with CSS custom properties

### Backend Architecture
- **RESTful API**: Standard HTTP methods for CRUD operations
- **MVC Pattern**: Models, Routes, Middleware separation
- **Mongoose ODM**: MongoDB object modeling
- **Middleware Stack**: Authentication, validation, error handling
- **Socket.IO**: WebSocket server for real-time features

### Data Models

**User Model**:
- Username, email, password (hashed)
- Profile information
- Created posts, comments, likes, bookmarks
- OAuth provider data
- Session management

**Post Model**:
- Title, content, category
- Author reference
- Media attachments (images, videos)
- Comments (embedded or referenced)
- Likes, views, bookmarks counts
- Timestamps

## 📡 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user
- `GET /api/auth/me` - Get current user
- `GET /api/auth/google` - Google OAuth
- `GET /api/auth/github` - GitHub OAuth

### Posts
- `GET /api/posts` - Get all posts (with pagination, search)
- `GET /api/posts/:id` - Get single post
- `POST /api/posts` - Create new post
- `PUT /api/posts/:id` - Update post
- `DELETE /api/posts/:id` - Delete post
- `POST /api/posts/:id/like` - Like/unlike post
- `POST /api/posts/:id/bookmark` - Bookmark/unbookmark post

### Comments
- `GET /api/posts/:postId/comments` - Get post comments
- `POST /api/posts/:postId/comments` - Add comment
- `DELETE /api/comments/:id` - Delete comment

### Users
- `GET /api/users/:id` - Get user profile
- `PUT /api/users/:id` - Update user profile
- `DELETE /api/users/:id` - Delete user account
- `GET /api/users/:id/posts` - Get user's posts
- `GET /api/users/:id/activity` - Get user's activity

### Upload
- `POST /api/upload/image` - Upload image
- `POST /api/upload/video` - Upload video

### Email
- `POST /api/email/find-username` - Find username by email
- `POST /api/email/reset-password` - Request password reset
- `POST /api/email/verify-reset` - Verify reset token

## 🔧 Development

### Available Scripts

**Frontend:**
- `npm run dev` - Start Vite dev server (port 5173)
- `npm run build` - Build for production
- `npm run preview` - Preview production build

**Backend:**
- `npm run dev` - Start backend with nodemon (port 5000)
- `npm start` - Start backend in production mode

**Combined:**
- `npm run dev:all` - Start both frontend and backend concurrently

### Code Structure Best Practices
- **Components**: One component per file, named exports
- **Hooks**: Extract complex logic into custom hooks
- **API Calls**: Centralized in `services/api.js`
- **Security**: Always sanitize user input, validate on both client and server
- **Error Handling**: Try-catch blocks with user-friendly error messages

### Environment Configuration
All sensitive configuration should be in `.env` file (not committed to git):
- Database credentials
- API keys (Cloudinary, OAuth)
- Session secrets
- Email credentials

## 🐛 Troubleshooting

### Common Issues

**MongoDB Connection Error:**
- Ensure MongoDB is running locally or check cloud database credentials
- Verify `MONGODB_URI` in `.env`

**OAuth Not Working:**
- Check OAuth credentials in Google/GitHub developer console
- Verify redirect URLs match `CLIENT_URL` and `SERVER_URL`
- Ensure callback URLs are properly configured

**Image Upload Failing:**
- Verify Cloudinary credentials
- Check file size limits (default: 5MB for images, 50MB for videos)
- Ensure file type is allowed (JPEG, PNG, GIF, MP4, WebM)

**Session/Authentication Issues:**
- Clear browser cookies and localStorage
- Check `SESSION_SECRET` and `JWT_SECRET` are set
- Verify CORS settings allow credentials

## 🚀 Deployment

### Frontend Deployment (Vercel/Netlify)
1. Build the project: `npm run build`
2. Deploy the `dist` folder
3. Set environment variables for API URL

### Backend Deployment (Heroku/Railway/DigitalOcean)
1. Set all environment variables
2. Ensure MongoDB connection string is for production database
3. Set `NODE_ENV=production`
4. Configure allowed origins for CORS

### Environment Variables for Production
```env
NODE_ENV=production
MONGODB_URI=<production-mongodb-uri>
CLIENT_URL=<production-frontend-url>
SERVER_URL=<production-backend-url>
```

## 📝 License

This project is licensed under the MIT License.

## 👨‍💻 Author

Created as a portfolio project demonstrating full-stack development skills with modern web technologies.

## 🙏 Acknowledgments

- React team for the amazing library
- MongoDB for the flexible database
- Socket.IO for real-time capabilities
- Cloudinary for media management
- All open-source contributors

---

**Note**: This is a portfolio project for demonstration purposes. For production use, ensure proper security audits, performance optimization, and comprehensive testing.


