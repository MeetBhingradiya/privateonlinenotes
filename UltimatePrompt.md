# Notta.in - Ultimate Prompt
+ Ultimate Motive is to Provide Fast, Secure, Markdown & UI Rich Note Sharing Platform for Students and Professionals.

# Current State
+ Remove Unnecessary code and files.
+ Nothing we need from current state of application if u build from scratch.

# Must Include
+ Fast & Secure URL Sharing Experience.
+ Users System
    + Users can create an account by entering 
        + Fname & Lname
        + Username (Must be unique)
        + Email (Must be unique)
        + Password (Hashed and stored securely)
        + Profile picture (optional)
        + Terms and Conditions checkbox
    + After successful registration, user will be redirected to Dashboard.

+ User Profile
    + User can view and edit their profile information.
    + User can change their password.
    + User can upload a profile picture.
    + User can delete their account with all associated data

+ Cloud Storage
    + User can upload files to their cloud storage.
    + User can organize files into folders.
    + User can share files with other users or make them public or unlisted.
    + User can delete files from their cloud storage.
    + User can view file details such as size, type, and upload date.
    + User can search for files by name or type or content.
    + User can Edit files in their cloud storage using a rich text editor (like Monaco Editor).
    + Files/Folders has Specific Permissions (Read, Write, Delete, Rename, Re Share).
    + All the Files has Version System Keep the last 5 versions of each file & option to restore previous versions.


+ Technology Stack
    + Frontend: Next.js, React, Tailwind CSS, TypeScript
    + Backend: Next.js API Routes(if needed), Nextjs SSR (Must be Used where needed), MongoDB for File Storage & Records (Mongoose)   
    + Authentication: JWT using Jose (JSON Web Tokens)
    + File Storage: MongoDB Collections (Files & Files Content are Separate Collections, Safe file handling to prevent path traversal, Max 2 depth of folders & more configurable)
    + Rich Text Editor: Monaco Editor or similar

+ 🎨 UI/UX:

    Clean modern layout:

        Sidebar: folder/file tree with breadcrumbs

        Main pane: code editor or file preview

        Toolbar with actions: Save, Rename, Delete, New File/Folder

    Light/Dark mode toggle

    Responsive design (works on mobile)

    Download single file or whole folder as .zip

    Notifications for success/errors

    Auto logout on inactivity

+ ⚠️ Security Notes:

    Never store passwords or access level in frontend JS or localStorage

    Use backend authentication only

    Use session or JWT tokens (with expiration)

    Sanitize file names to prevent path traversal

    Rate-limit login attempts

    Only allow safe file types (e.g., .txt, .md, .py, .c, .lua)

+🔐 Access Control:

    Editor role (full access to files)

    View-only role (can view files and folder structure but cannot modify)

    Access level enforced on backend (API Routes or SSR Based) (never in frontend)

    Each API must validate user session and permissions

+📁 File & Folder System:

    Users can:

        Create, rename, delete, copy, and move text/code files

        Create, rename, delete, copy, and move folders

        Support for nested folders

    Syntax-highlighting editor (CodeMirror or Monaco)

        Allow user to choose language (e.g., text, Python, Lua, C)

    Preview file with line numbers (read-only mode)

    Search feature:

        By file/folder name

        Inside file content