# Notta.in - Fast & Secure Note Sharing Platform

A modern, feature-rich note sharing platform built with Next.js, TypeScript, and MongoDB. Designed for students and professionals who need a fast, secure, and collaborative environment for creating and sharing code snippets and text files.

## ✨ Features

### 🔐 User Authentication
- Secure user registration and login system
- JWT-based authentication with HTTP-only cookies
- Password hashing with bcrypt
- Session management and auto-logout on inactivity

### 📁 File & Folder Management
- Create, edit, delete files and folders
- Support for nested folder structures (up to 2 levels deep)
- Real-time file editing with Monaco Editor
- Syntax highlighting for 20+ programming languages
- Auto-save functionality

### 🎨 Rich Text Editor
- Monaco Editor with full VS Code features
- Multiple language support (JavaScript, TypeScript, Python, etc.)
- Dark/Light theme toggle
- Auto-completion and IntelliSense
- Code folding and minimap

### 🚀 File Sharing
- Generate secure share links for files
- Public and private sharing options
- Copy share links to clipboard
- Beautiful read-only viewer for shared files

### 💾 Version Control
- Automatic version history (last 5 versions)
- Restore previous versions of files
- Track changes and modifications

### 🔒 Security Features
- Input sanitization and validation
- Rate limiting on authentication
- Secure file handling (prevent path traversal)
- Content Security Policy headers
- Safe file type restrictions

### 📱 Modern UI/UX
- Responsive design (mobile-friendly)
- Clean, modern interface with Tailwind CSS
- Dark/Light mode support
- Toast notifications for user feedback
- Intuitive file explorer with breadcrumbs

### ☁️ Cloud Storage
- MongoDB-based file storage
- Efficient file organization
- Search functionality by filename and content
- File size tracking and display

## 🛠️ Technology Stack

### Frontend
- **Next.js 14** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first CSS framework
- **React Hook Form** - Form handling and validation
- **Zod** - Schema validation
- **Lucide React** - Beautiful icons
- **next-themes** - Theme management

### Backend
- **Next.js API Routes** - Server-side API
- **MongoDB** - Database with Mongoose ODM
- **JWT** - Authentication tokens
- **bcryptjs** - Password hashing

### Editor
- **Monaco Editor** - VS Code editor in the browser
- **React Monaco Editor** - React wrapper

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ or Bun
- MongoDB (local or cloud instance)

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd notta-in
```

2. **Install dependencies**
```bash
bun install
# or
npm install
```

3. **Set up environment variables**
Copy `.env.example` to `.env.local` and update the values:
```bash
cp .env.example .env.local
```

Edit `.env.local`:
```env
MONGODB_URI=mongodb://localhost:27017/notta-in
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-nextauth-secret-key
NODE_ENV=development
```

4. **Start MongoDB**
Make sure MongoDB is running on your system.

5. **Run the development server**
```bash
bun dev
# or
npm run dev
```

6. **Open your browser**
Navigate to [http://localhost:3000](http://localhost:3000)

## 📝 Usage

### Creating an Account
1. Click "Sign up" on the login page
2. Fill in your details (name, email, password)
3. Accept the terms and conditions
4. Start creating and sharing files!

### File Management
- **Create File**: Click "New File" in the sidebar
- **Create Folder**: Click "New Folder" in the sidebar
- **Edit File**: Click on any file to open it in the editor
- **Delete**: Use the trash icon next to files/folders
- **Navigate**: Use breadcrumbs or click on folders

### Sharing Files
1. Open a file in the editor
2. Click the "Share" button in the toolbar
3. Share link is automatically copied to clipboard
4. Anyone with the link can view the file

### Profile Management
- Access profile settings from the sidebar
- Update personal information
- Change password
- Delete account (with data cleanup)

## 🔧 API Routes

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `GET /api/auth/me` - Get current user
- `POST /api/auth/logout` - User logout

### File Management
- `GET /api/files` - List files in directory
- `POST /api/files` - Create new file/folder
- `GET /api/files/[id]` - Get file content
- `PUT /api/files/[id]` - Update file content
- `DELETE /api/files/[id]` - Delete file/folder
- `POST /api/files/[id]/share` - Generate share link

### User Management
- `PUT /api/user/profile` - Update user profile
- `PUT /api/user/password` - Change password
- `DELETE /api/user/delete` - Delete account

## 🔒 Security Considerations

- All passwords are hashed using bcrypt
- JWT tokens are stored in HTTP-only cookies
- Input validation using Zod schemas
- File path sanitization to prevent traversal attacks
- Rate limiting on authentication endpoints
- Content Security Policy headers
- Secure file type restrictions

## 📁 Project Structure

```
src/
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   ├── auth/              # Authentication pages
│   ├── dashboard/         # Main application
│   ├── profile/           # User profile
│   ├── share/             # File sharing
│   └── terms/             # Terms page
├── components/            # React components
│   ├── providers/         # Context providers
│   ├── ui/                # UI components
│   └── editor/            # Editor components
├── lib/                   # Utility functions
└── models/                # Database models
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Monaco Editor team for the amazing code editor
- Next.js team for the excellent framework
- MongoDB team for the reliable database
- Tailwind CSS for the utility-first approach
- All contributors and users of this platform

## 📞 Support

If you have any questions or need help, please:
1. Check the documentation
2. Search existing issues
3. Create a new issue if needed

---

Built with ❤️ by the Notta.in team
