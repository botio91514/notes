# 📝 Power Notes - AI-Powered Notes Application

A modern, feature-rich notes application built with React, TypeScript, and AI integration. Create, edit, and manage your notes with powerful AI features, encryption, and a beautiful responsive interface.

## ✨ Features

### 🎯 Core Functionality
- **Rich Text Editor** - Custom-built editor with formatting tools (bold, italic, underline, alignment, lists, font size, colors)
- **Note Management** - Create, edit, delete, and organize notes
- **Pinning System** - Pin important notes to the top
- **Search & Filter** - Search notes by title, content, or AI summary
- **Tag System** - Organize notes with custom tags
- **Responsive Design** - Works perfectly on desktop, tablet, and mobile

### 🤖 AI-Powered Features
- **AI Summarization** - Generate concise summaries of your notes
- **Smart Tag Suggestions** - AI suggests relevant tags based on content
- **Grammar Check** - Identify and highlight grammatical errors
- **Glossary Generation** - Auto-highlight key terms with definitions
- **AI Insights** - Get intelligent recommendations and key points
- **Multi-language Translation** - Translate notes to different languages

### 🔐 Security & Privacy
- **Note Encryption** - Password-protect sensitive notes
- **Local Storage** - All data stays on your device
- **Secure Encryption** - Military-grade encryption for your content

### 📱 Advanced Features
- **Version History** - Track changes and restore previous versions
- **Export/Import** - Export notes as .txt files, import from JSON
- **Share Functionality** - Share notes via in-app links
- **Auto-save** - Automatic saving with status indicators
- **Keyboard Shortcuts** - Quick access to common actions

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- Modern web browser

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/botio91514/notes.git
   cd notes
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up AI API keys**
   Create a `.env.local` file in the root directory:
   ```env
   VITE_GEMINI_API_KEY=your_gemini_api_key_here
   ```

4. **Get Gemini API Key**
   - Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
   - Create a new API key
   - Copy the key to your `.env.local` file

5. **Run the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to `http://localhost:5173`

## 🛠️ Tech Stack

### Frontend
- **React 18** - Modern React with hooks
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first CSS framework
- **Framer Motion** - Smooth animations and transitions
- **Lucide React** - Beautiful, consistent icons

### Backend & Storage
- **Dexie.js** - IndexedDB wrapper for local storage
- **Google Gemini API** - AI-powered features
- **Web Crypto API** - Client-side encryption

### Development Tools
- **Vite** - Fast build tool and dev server
- **ESLint** - Code quality and consistency
- **PostCSS** - CSS processing
- **Tailwind CSS** - Utility-first CSS framework

## 📱 Mobile Responsiveness

The application is fully responsive and optimized for mobile devices:
- **Touch-friendly** - Optimized tap targets and gestures
- **Mobile-first design** - Responsive layout that adapts to screen size
- **Smooth scrolling** - Native mobile scrolling experience
- **Adaptive UI** - Buttons and controls resize for mobile

## 🔧 Available Scripts

```bash
# Development
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
npm run lint:fix     # Fix ESLint issues
```

## 🎨 UI Components

### Sidebar
- **Notes List** - View all notes with search and filtering
- **Pinned Notes** - Important notes at the top
- **Tag Filters** - Filter notes by tags
- **Theme Toggle** - Switch between light and dark modes
- **Collapsible** - Expand/collapse sidebar

### Editor
- **Rich Text Toolbar** - Formatting options
- **Content Area** - Large, distraction-free writing space
- **Auto-save** - Real-time saving with status indicators
- **AI Tools** - Access to all AI features

### AI Tools Modal
- **Summarize & Tags** - Generate summaries and suggest tags
- **Translate** - Multi-language translation
- **Grammar Check** - Identify and fix grammatical errors
- **Glossary** - Auto-highlight key terms
- **AI Insights** - Get intelligent recommendations

## 🔐 Security Features

### Encryption
- **AES-256** encryption for sensitive notes
- **Client-side only** - No data sent to servers
- **Password protection** - Individual note passwords
- **Secure storage** - Encrypted data in IndexedDB

### Privacy
- **Local storage** - All data stays on your device
- **No tracking** - No analytics or user tracking
- **Open source** - Transparent codebase

## 🌐 AI Integration

### Google Gemini API
- **Model**: `gemini-1.5-flash`
- **Features**: Summarization, tagging, translation, grammar check, insights
- **Rate Limiting**: Built-in throttling and cooldowns
- **Error Handling**: Graceful fallbacks and user feedback

### AI Features
1. **Smart Summarization** - Generate 1-2 line summaries
2. **Intelligent Tagging** - Suggest 3-5 relevant tags
3. **Grammar Analysis** - Identify and highlight errors
4. **Glossary Generation** - Auto-highlight key terms
5. **Content Insights** - AI-driven recommendations
6. **Multi-language Support** - Translate to various languages

## 📊 Data Structure

### Note Object
```typescript
interface Note {
  id: string;
  title: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
  isPinned: boolean;
  isEncrypted: boolean;
  encryptedData?: string;
  tags: string[];
  version: number;
  versions: NoteVersion[];
  aiSummary?: string;
}
```

### Version History
```typescript
interface NoteVersion {
  id: string;
  content: string;
  createdAt: Date;
  version: number;
}
```

## 🎯 Keyboard Shortcuts

- **Cmd/Ctrl + N** - Create new note
- **Cmd/Ctrl + K** - Open command palette
- **Cmd/Ctrl + S** - Save note
- **Escape** - Close modals and menus

## 🔄 State Management

The application uses React hooks for state management:
- **useNotes** - Note CRUD operations and AI features
- **useSettings** - User preferences and theme
- **Local State** - Component-specific state management

## 📁 Project Structure

```
src/
├── components/          # React components
│   ├── CommandPalette/ # Command interface
│   ├── Editor/         # Rich text editor
│   ├── Notes/          # Note display components
│   ├── Sidebar/        # Navigation sidebar
│   └── WelcomeScreen/  # Landing page
├── hooks/              # Custom React hooks
├── types/              # TypeScript type definitions
├── utils/              # Utility functions
│   ├── ai.ts          # AI service integration
│   ├── database.ts    # IndexedDB setup
│   └── encryption.ts  # Encryption utilities
├── App.tsx            # Main application component
└── main.tsx           # Application entry point
```

## 🚀 Deployment

### Netlify (Recommended)
1. Connect your GitHub repository
2. Set build command: `npm run build`
3. Set publish directory: `dist`
4. Deploy!

### Vercel
1. Import your GitHub repository
2. Vercel will auto-detect Vite
3. Deploy with one click

### GitHub Pages
1. Run `npm run build`
2. Push `dist` folder to `gh-pages` branch
3. Enable GitHub Pages in repository settings

## 🐛 Troubleshooting

### Common Issues

**AI Features Not Working**
- Check your Gemini API key in `.env.local`
- Ensure you have sufficient API quota
- Check browser console for error messages

**Notes Not Saving**
- Check browser storage permissions
- Ensure IndexedDB is enabled
- Clear browser cache and try again

**Mobile Issues**
- Ensure viewport meta tag is present
- Check for CSS conflicts
- Test on different mobile devices

### Debug Mode
Enable debug logging by setting in browser console:
```javascript
localStorage.setItem('debug', 'true')
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🙏 Acknowledgments

- **Google Gemini** - AI capabilities
- **React Team** - Amazing framework
- **Tailwind CSS** - Beautiful styling
- **Framer Motion** - Smooth animations
- **Lucide** - Beautiful icons

## 📞 Support

If you encounter any issues or have questions:
1. Check the troubleshooting section
2. Search existing issues
3. Create a new issue with detailed information
4. Include browser console errors and steps to reproduce

---

**Made with ❤️ and ☕ by the Power Notes Team**

*Transform your note-taking experience with AI-powered insights and beautiful design.*
