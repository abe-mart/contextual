# Contextual

> An intelligent tool for identifying and analyzing ambiguous terms in academic texts using AI.

![Contextual Banner](https://img.shields.io/badge/React-18.3-blue) ![TypeScript](https://img.shields.io/badge/TypeScript-5.5-blue) ![Vite](https://img.shields.io/badge/Vite-5.4-purple) ![License](https://img.shields.io/badge/license-MIT-green)

## 📖 Overview

**Contextual** is a web application designed to help researchers, students, and academics identify potentially ambiguous terminology in their texts. It uses OpenAI's GPT-4 to analyze documents and highlight terms that may have multiple meanings across different academic disciplines.

### Key Features

- 🔍 **Automatic Term Detection** - AI-powered identification of ambiguous terminology
- 📄 **PDF Support** - Upload and analyze PDF documents with page-by-page selection
- 📝 **Text Input** - Paste text directly or upload .txt files
- 🎨 **Interactive Visualization** - Color-coded highlights based on confidence levels
- 💡 **Detailed Analysis** - View multiple possible meanings with field-specific definitions
- 📊 **Confidence Scoring** - Each term comes with a confidence rating (0-100%)
- 🔄 **Smart Chunking** - Handles long documents by breaking them into analyzable chunks
- 📱 **Responsive Design** - Works seamlessly on desktop and mobile devices

## 🚀 Getting Started

### Prerequisites

- **Node.js** (v18 or higher)
- **npm** or **yarn**
- **OpenAI API Key** ([Get one here](https://platform.openai.com/api-keys))

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/abe-mart/contextual.git
   cd contextual
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   
   Create a `.env` file in the root directory:
   ```bash
   cp .env.example .env
   ```
   
   Then edit `.env` and add your OpenAI API key:
   ```env
   VITE_OPENAI_API_KEY=your_actual_api_key_here
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```
   
   The application will be available at `http://localhost:5173`

### Building for Production

Build the application for production:
```bash
npm run build
```

Preview the production build:
```bash
npm run preview
```

## 📋 Usage

### Analyzing Text

1. **Upload or Paste Text**
   - Drag and drop a PDF or TXT file, or
   - Click "browse files" to select a file, or
   - Paste text directly into the text area

2. **For PDF Files**
   - Preview each page
   - Select the specific page you want to analyze
   - Click "Analyze This Page"

3. **View Results**
   - Ambiguous terms are highlighted in the text
   - Color coding indicates confidence levels:
     - 🟢 Green: High confidence (80%+)
     - 🟡 Yellow: Medium confidence (60-79%)
     - 🟠 Orange: Lower confidence (<60%)

4. **Explore Term Details**
   - Click any highlighted term to view:
     - Context where it appears
     - Likely intended meaning
     - Alternative meanings from other academic fields
     - Confidence score

### Understanding the Analysis

The tool analyzes your text in chunks and identifies terms that:
- Have multiple meanings across different academic disciplines
- Could potentially cause confusion or ambiguity
- Would benefit from clarification or precise definition

Each identified term includes:
- **Term**: The ambiguous word or phrase
- **Context**: A snippet showing where it appears in your text
- **Likely Meaning**: The AI's best guess at what you intended
- **Possible Meanings**: Alternative interpretations from other fields
- **Confidence Score**: How certain the AI is about its interpretation

## 🛠️ Technology Stack

- **Frontend**: React 18 + TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **AI**: OpenAI GPT-4
- **PDF Processing**: PDF.js
- **Icons**: Lucide React
- **Deployment**: PM2 (optional)

## 📁 Project Structure

```
contextual/
├── src/
│   ├── components/        # React components
│   │   ├── PDFPreview.tsx
│   │   ├── TermDetail.tsx
│   │   ├── TermsSummary.tsx
│   │   ├── TextInput.tsx
│   │   └── TextVisualization.tsx
│   ├── services/          # API services
│   │   └── openai.ts      # OpenAI integration
│   ├── types/             # TypeScript type definitions
│   │   └── index.ts
│   ├── utils/             # Utility functions
│   │   ├── pdfExtractor.ts
│   │   └── textSanitizer.ts
│   ├── App.tsx            # Main application component
│   └── main.tsx           # Application entry point
├── public/                # Static assets
├── ecosystem.config.cjs   # PM2 configuration
└── package.json
```

## 🔧 Configuration

### PM2 Deployment

The project includes a PM2 configuration file for production deployment:

```bash
# Build the application
npm run build

# Start with PM2
pm2 start ecosystem.config.cjs

# Save PM2 configuration
pm2 save

# View status
pm2 status contextual

# View logs
pm2 logs contextual
```

The app will run on **port 3007** by default (configurable in `vite.config.ts` and `ecosystem.config.cjs`).

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `VITE_OPENAI_API_KEY` | Your OpenAI API key | Yes |

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with [OpenAI GPT-4](https://openai.com/)
- PDF processing powered by [PDF.js](https://mozilla.github.io/pdf.js/)
- Icons from [Lucide](https://lucide.dev/)

## 📧 Contact

For questions or feedback, please open an issue on GitHub.

---

Made with ❤️ for the academic community