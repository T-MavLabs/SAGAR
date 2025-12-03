# SAGAR - Marine Scientific Analysis Dashboard

**SAGAR** (Scientific Analysis for Global Aquatic Research) is a comprehensive, interactive web application for marine biodiversity and oceanographic data analysis. Built with React, Three.js, and integrated with **SagarManthan-RAG** for AI-powered intelligent querying.

## Overview

SAGAR provides scientists with:
- **Interactive 3D Globe Visualization**: Explore marine data points on an interactive globe
- **AI-Powered Analysis**: Ask natural language questions and get intelligent answers using RAG (Retrieval-Augmented Generation)
- **Dynamic Analysis Dashboard**: Comprehensive charts and visualizations based on query results
- **Multi-Data Type Support**: Analyze Occurrence, CTD, AWS, and ADCP data
- **Study Modules**: Taxonomy, Otolith Morphology, and eDNA analysis tools

## Features

### Project Dashboard View
- **Modern UI**: Dark, futuristic design with smooth animations
- **Project Management**: Grid of project cards with progress tracking
- **Supabase Integration**: Projects stored in Supabase database
- **Navigation**: Clean header with logo and navigation links
- **User Interface**: Welcome message and logout functionality

### Interactive Globe View
- **3D Globe**: Interactive 3D globe using React Three Fiber
- **Data Visualization**: Real-time data points plotted on the globe
- **Color Coding**: Different colors for different water bodies
- **Interactive Features**: Hover tooltips and click modals
- **Data Panels**: Left panel for filters, right panel for AI-powered analysis
- **AI-Powered Analysis**: Natural language query interface integrated with SagarManthan-RAG
- **Data Type Selection**: Filter by OCCURRENCE, CTD, AWS, ADCP or auto-detect
- **Search Bar**: Bottom-centered search bar with data type selector
- **Query History**: Access all previous RAG queries with one-click result restoration

### AI-Powered Analysis (SagarManthan-RAG Integration)

The Globe View includes an integrated AI analysis system powered by **SagarManthan-RAG**:

#### Features:
- **Natural Language Queries**: Ask questions in plain English
  - "What unique species are found in the Indian Ocean between 350-600 meters?"
  - "Show me CTD temperature profiles from the Arabian Sea"
  - "What are the current speeds in the Bay of Bengal?"
- **Automatic Parameter Extraction**: 
  - Extracts depth ranges from queries (e.g., "350-600 meters")
  - Extracts water bodies (e.g., "Indian Ocean", "Arabian Sea")
  - Auto-detects data types from query keywords
- **Multi-Data Type Queries**: Query across Occurrence, CTD, AWS, and ADCP data
- **Data Type Selector**: Explicitly select data types or let the system auto-detect
- **Real-time Processing**: Shows analysis steps and progress
- **Automatic Query Saving**: All queries are automatically saved to history for future reference

### Query History

SAGAR automatically saves all RAG queries and their results, allowing scientists to easily access and restore previous analyses.

#### Features:
- **Automatic Saving**: Every RAG query is automatically saved with:
  - Original query text
  - Applied filters (water body, species, depth range, data types)
  - Full response data (answer, occurrences, dashboard summary)
  - Timestamp and metadata
- **Easy Access**: 
  - Click the "Query History" button in the Globe View header (left of "Data PlayGround")
  - Slides in a right-side panel with all historical queries
- **Query Information**:
  - Query text and applied filters
  - Answer preview (first 150 characters)
  - Source count and dashboard summary indicator
  - Date and time of query
- **Quick Actions**:
  - **View Results**: One-click restoration of query results to the Analysis Dashboard
  - **Delete**: Remove queries from history
- **Persistent Storage**: All queries stored in Supabase `query_history` table
- **Smart Restoration**: Restores complete query results including charts, visualizations, and dashboard summaries

#### Usage:
1. Make a query using the AI-Powered Analysis interface
2. After the query completes, it's automatically saved
3. Click "Query History" in the header to view all saved queries
4. Click "View" on any query to restore and view its results
5. Use the delete button to remove queries from history

### Analysis Dashboard (Search Results View)

When you submit a query, you're redirected to a comprehensive analysis dashboard showing:

#### Key Findings Section
- **Species Found**: Count of unique species
- **Water Bodies**: List of water bodies in results
- **Depth Range**: Query-specific depth range (with query filter indicator)

#### Statistics Cards
- **Total Occurrences**: Total records before deduplication
- **Unique Species**: Deduplicated species count
- **Depth Range**: Query filter depth or actual range
- **Water Bodies**: Summary of water bodies
- **Sampling Methods**: Methods used in data collection
- **Query Time**: Processing time in milliseconds

#### Dynamic Charts (Query-Specific)
All charts are dynamically generated from RAG query results:
- **Occurrences by Year**: Temporal distribution of records
- **Depth Distribution**: Depth profile with dynamic x-axis (adjusts to query depth range)
- **Water Body Distribution**: Geographic distribution pie chart
- **Sampling Methods**: Methods used for data collection
- **Seasonal Distribution**: Temporal patterns by season
- **Research Institutions**: Institutions contributing to the data
- **Occurrence Trends**: Conservation/trend analysis over time

#### Type-Specific Charts
- **CTD Charts**: Temperature, Salinity, and Oxygen profiles (when CTD data is queried)
- **AWS Charts**: Time series of Sea Surface Temperature, Wind Speed, Air Temperature
- **ADCP Charts**: Current speed profiles with depth bins

#### Detailed Analysis Summary
AI-generated comprehensive summary including:
- **Executive Summary**: 2-3 sentence overview
- **Key Findings**: Bullet-point list of important discoveries
- **Species Analysis**: Detailed species diversity and distribution
- **Geographic Distribution**: Spatial patterns and locations
- **Depth Analysis**: Depth-related insights
- **Temporal Patterns**: Time-based observations
- **Research Insights**: Research methods and contributions

#### Query-Specific Records
- **Grouped by Data Type**: Occurrence, CTD, AWS, ADCP records shown separately
- **Detailed Information**: Each record shows all relevant fields
- **Relevance Scores**: Similarity scores for each result
- **Complete Dataset**: ALL matching records (not limited) for research

### Study Modules

Three scientist-oriented modules with consistent grey glass UI:

#### 1) Taxonomy 🐠
- Browse marine hierarchy and search via GBIF suggest (≥3 chars)
- Species information: Scientific name, authorship, lineage
- Common names (vernaculars)
- Occurrence distribution by country (bar chart)
- Image thumbnails from GBIF (Wikipedia fallback)
- Clickable lineage segments for navigation
- Per-session Favorites

**Data Sources:**
- GBIF Species/Occurrence API: `https://api.gbif.org/v1`
- Wikipedia REST (thumbnail fallback)

#### 2) Otolith Morphology 🔬
- Upload multiple images; select thumbnails to open viewer
- Viewer modes: Normal / Edge view (contrast + desaturate)
- Annotate mode: Click two points to add length measurements
- Calibration support (px/mm)
- Measurements table with CSV export
- Global filtering
- **AI-Powered Species Classification**: Integrated with Otolith Classifier API
  - Upload otolith images and get species predictions
  - Displays scientific name, confidence score, and filename
  - Formatted, user-friendly prediction results

#### 3) eDNA Data 🧬
- Paste FASTA or upload `.fa/.fasta/.txt` files
- **Real API Integration**: Connected to eDNA Sequence Matcher API
- Supports multiple sequences in FASTA format or raw sequence input
- Real-time species identification and matching
- Results table showing:
  - Identifier, Header, Species Name
  - Confidence Score and Raw Score
  - Sequence length
- CSV export functionality
- Species distribution pie chart from API results

## Technology Stack

### Frontend
- **React 18** with TypeScript
- **Tailwind CSS** with custom marine theme
- **3D Graphics**: React Three Fiber + Three.js
- **Animations**: Framer Motion
- **Icons**: React Icons
- **Routing**: React Router

### Backend Integration
- **SagarManthan-RAG**: AI-powered query system
  - FastAPI backend
  - ChromaDB for vector search
  - Google Gemini for embeddings and LLM
  - Supabase Storage for data files
- **Supabase**: 
  - Database for projects
  - Storage for marine data files (Parquet format)
  - Authentication (if configured)
- **Study Module APIs**:
  - **Otolith Classifier API**: `https://chinmay0805-37-otolith-classifier.hf.space`
    - HuggingFace Space for otolith image classification
    - Endpoint: `/predict`
  - **eDNA Sequence Matcher API**: `https://sagar-e-dna.vercel.app`
    - Vercel-hosted API for eDNA sequence matching
    - Endpoint: `/api/v1/edna/match`

### Data Sources
- **Supabase Storage**: Parquet files containing Occurrence, CTD, AWS, ADCP data
- **GBIF API**: Species and occurrence data for Taxonomy module
- **Wikipedia API**: Image thumbnails fallback
- **Otolith Classifier API**: Species identification from otolith images
- **eDNA Sequence Matcher API**: Species identification from DNA sequences

## Installation

### Prerequisites
- Node.js 16+ and npm
- Python 3.8+ (for SagarManthan-RAG backend)
- Supabase account (for data storage)
- Google Gemini API key (for AI features)

### Frontend Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd SAGAR
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables** (if needed)
   Create a `.env` file:
   ```env
   REACT_APP_RAG_API_URL=http://localhost:8000
   REACT_APP_SUPABASE_URL=your-supabase-url
   REACT_APP_SUPABASE_ANON_KEY=your-supabase-anon-key
   REACT_APP_OTOLITH_API_URL=https://chinmay0805-37-otolith-classifier.hf.space
   REACT_APP_EDNA_API_URL=https://sagar-e-dna.vercel.app
   ```
   
   **Note**: The Otolith and eDNA API URLs have defaults and don't need to be configured unless using custom endpoints.

4. **Start the development server**
   ```bash
   npm start
   ```

5. **Open your browser**
   Navigate to `http://localhost:3000`

### Database Setup (Supabase)

1. **Create the projects table** (if not already created):
   ```sql
   -- Run sql_runs.sql in Supabase SQL Editor
   ```

2. **Create the query_history table**:
   ```sql
   -- Run sql_runs_query_history.sql in Supabase SQL Editor
   ```
   
   This creates a table to store all RAG queries with:
   - Query text and options
   - Full response data (JSONB)
   - Timestamps and metadata

### Backend Setup (SagarManthan-RAG)

See `../SagarManthan-RAG/readme.md` for complete setup instructions.

**Quick Start:**
```bash
cd ../SagarManthan-RAG
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# Create .env file with Supabase and Gemini API credentials
# Import data and generate embeddings
python import_occurrences_supabase.py
python marine_embeddings_supabase.py

# Start RAG API server
python marine_rag_supabase_main.py
```

## Project Structure

```
SAGAR/
├── src/
│   ├── components/
│   │   ├── Dashboard.tsx              # Main dashboard view
│   │   ├── ProjectCard.tsx            # Individual project cards
│   │   ├── GlobeView.tsx              # 3D globe interface with AI analysis
│   │   ├── Globe.tsx                  # 3D globe component
│   │   ├── SearchResultsView.tsx      # Analysis dashboard (query results)
│   │   ├── DataModal.tsx              # Data point detail modal
│   │   ├── LandingPage.tsx            # Landing page
│   │   ├── APIDocumentation.tsx       # API documentation view
│   │   └── DataSourcePage.tsx         # Data sources page
│   ├── services/
│   │   ├── dataService.ts             # Data loading and management
│   │   ├── ragService.ts              # SagarManthan-RAG API client
│   │   ├── supabaseClient.ts          # Supabase client
│   │   ├── queryHistoryService.ts     # Query history management
│   │   ├── otolithService.ts          # Otolith Classifier API client
│   │   └── ednaService.ts             # eDNA Sequence Matcher API client
│   ├── App.tsx                        # Main application component
│   └── index.css                      # Global styles with Tailwind
├── public/
│   └── data/
│       └── occurrence.txt             # Sample marine biodiversity dataset
└── package.json
```

## Usage

### Basic Workflow

1. **Start the RAG API** (if using AI features):
   ```bash
   cd ../SagarManthan-RAG
   python marine_rag_supabase_main.py
   ```

2. **Start the SAGAR frontend**:
   ```bash
   npm start
   ```

3. **Navigate to Globe View**: Click on a project or navigate to `/globe`

4. **Ask a Question**: 
   - Use the "AI-Powered Analysis" textarea in the sidebar, or
   - Use the bottom-centered search bar
   - Select data types (optional) or leave empty for auto-detection
   - Submit your query

5. **View Results**: 
   - Automatically redirected to `/search` (Analysis Dashboard)
   - View dynamic charts, statistics, and detailed summaries
   - Explore query-specific records grouped by data type
   - Query is automatically saved to history

6. **Access Query History**:
   - Click "Query History" button in Globe View header
   - Browse all previous queries
   - Click "View" to restore any query's results

### Example Queries

**Occurrence Queries:**
- "What unique species are found in the Indian Ocean between 350-600 meters?"
- "Which species live at depths between 300 and 500 meters in the Arabian Sea?"
- "Show me occurrences of deep sea species in the Bay of Bengal"

**CTD Queries:**
- "What are the temperature profiles in the Indian Ocean?"
- "Show me salinity data from the Arabian Sea"

**AWS Queries:**
- "What are the sea surface temperatures in the Indian Ocean?"
- "Show me wind speed data from recent measurements"

**ADCP Queries:**
- "What are the current speeds in the Indian Ocean?"
- "Show me ocean current velocity profiles"

**Multi-Data Type:**
- "Show me all marine data from the Indian Ocean"
- "What environmental conditions and species are found in the Arabian Sea?"

## Features in Detail

### Dashboard
- Responsive grid layout for project cards
- Smooth hover animations and transitions
- Progress tracking with animated progress bars
- Tag-based project categorization
- Supabase integration for project persistence

### 3D Globe
- High-fidelity 3D globe with realistic lighting
- Interactive data points with color coding:
  - **Green**: Arabian Sea
  - **Yellow**: Bay of Bengal  
  - **Cyan**: Andaman Sea
  - **Orange**: Other water bodies
- Mouse controls for rotation, zoom, and pan
- Pulsating data points for visual appeal
- Stars background for aesthetic appeal

### AI-Powered Analysis
- **Natural Language Processing**: Understands complex queries
- **Automatic Filtering**: Extracts parameters from queries
- **Multi-Data Type Support**: Queries across all marine data types
- **Real-time Processing**: Shows analysis steps
- **Error Handling**: Graceful fallbacks for rate limits

### Analysis Dashboard
- **Dynamic Charts**: All charts generated from query results
- **Query-Specific Data**: Only shows data matching the query
- **Type-Specific Visualizations**: Different charts for CTD, AWS, ADCP
- **Comprehensive Summaries**: AI-generated insights
- **Complete Dataset**: All matching records for research

### Data Interaction
- Hover tooltips showing species and location
- Click modals with detailed sampling information
- Real-time data loading and visualization
- Filtering and analysis capabilities
- Interactive globe with clickable data points

### UI/UX
- Dark, marine-themed color scheme
- Smooth animations using Framer Motion
- Responsive design for all screen sizes
- Loading states and error handling
- Modern glassmorphism effects
- Seamless navigation between views

## Customization

### Colors
The application uses a custom marine color palette defined in `tailwind.config.js`:
- `marine-blue`: Primary background
- `marine-cyan`: Accent color
- `marine-green`: Success/positive actions
- `marine-yellow`: Warning/attention
- `marine-orange`: Additional accent

### Data
- **Primary Source**: Supabase Storage bucket `processed-data` (Parquet files)
- **RAG Integration**: Data processed by SagarManthan-RAG system
- **Local Data**: `public/data/occurrence.txt` for initial testing

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

**Note**: WebGL support required for 3D globe visualization.

## Troubleshooting

### WebGL Context Lost Error

If you encounter "THREE.WebGLRenderer: Context Lost" errors:

1. **Refresh the page** - This usually resolves temporary context loss
2. **Check WebGL support** - Visit [webglreport.com](https://webglreport.com) to verify your browser supports WebGL
3. **Update graphics drivers** - Ensure your graphics drivers are up to date
4. **Enable hardware acceleration** - Check browser settings for hardware acceleration
5. **Close other WebGL applications** - Multiple WebGL contexts can cause conflicts

### RAG API Connection Issues

- **"Failed to fetch" or connection errors**:
  - Ensure SagarManthan-RAG API is running on `http://localhost:8000`
  - Check `REACT_APP_RAG_API_URL` in `.env` file
  - Verify CORS is enabled in the RAG API (should be enabled by default)

- **"No results found"**:
  - Check that data has been imported and embeddings generated
  - Verify ChromaDB has documents (check RAG API startup logs)
  - Try a more general query

- **Rate limit errors**:
  - Free tier Gemini API: 10 requests/minute
  - Wait 30-60 seconds between queries
  - Data is still returned even if LLM generation fails

### Performance Issues

- **Reduce data points** - Large datasets may impact performance
- **Close other tabs** - Free up GPU memory
- **Use Chrome/Firefox** - Better WebGL performance than Safari
- **Check GPU memory** - Ensure sufficient graphics memory
- **Optimize queries** - Use filters to reduce result set size

### Common Solutions

- **Clear browser cache** - Resolves many rendering issues
- **Disable browser extensions** - Some extensions interfere with WebGL
- **Try incognito mode** - Isolates the application from extensions
- **Check browser console** - Look for specific error messages
- **Restart RAG API** - If queries are not working

## Performance

- Optimized 3D rendering with React Three Fiber
- Efficient data loading and caching
- Smooth 60fps animations
- Responsive design for mobile and desktop
- Lazy loading for large datasets
- Efficient chart rendering with Chart.js

## Integration with SagarManthan-RAG

SAGAR is fully integrated with **SagarManthan-RAG** for AI-powered analysis:

### How It Works

1. **User submits query** in Globe View (sidebar or bottom search bar)
2. **Frontend sends query** to SagarManthan-RAG API via `ragService.ts`
3. **RAG API processes query**:
   - Extracts parameters (depth, water body, data types)
   - Searches ChromaDB for similar records
   - Applies filters
   - Generates answer using Gemini LLM
   - Creates dashboard summary
4. **Frontend receives results** and displays in Analysis Dashboard
5. **Charts are generated** dynamically from query results
6. **User explores** complete dataset with visualizations

### Configuration

The RAG API URL is configured in `src/services/ragService.ts`:
```typescript
const API_URL = process.env.REACT_APP_RAG_API_URL || 'http://localhost:8000';
```

Set `REACT_APP_RAG_API_URL` in `.env` file if the API is hosted elsewhere.

## Integration with Study Module APIs

SAGAR integrates with specialized APIs for the Study modules:

### Otolith Classifier API

The Otolith module uses a HuggingFace Space API for species classification:

**Configuration:**
- Default URL: `https://chinmay0805-37-otolith-classifier.hf.space`
- Endpoint: `/predict`
- Configurable via: `REACT_APP_OTOLITH_API_URL` environment variable

**Features:**
- Upload otolith images (JPG, PNG, etc.)
- Automatic base64 encoding for API submission
- Returns structured predictions with:
  - Scientific name
  - Confidence score
  - Filename reference

**Service:** `src/services/otolithService.ts`

### eDNA Sequence Matcher API

The eDNA module uses a Vercel-hosted API for DNA sequence matching:

**Configuration:**
- Default URL: `https://sagar-e-dna.vercel.app`
- Endpoint: `/api/v1/edna/match`
- Configurable via: `REACT_APP_EDNA_API_URL` environment variable

**Features:**
- Accepts FASTA format or raw DNA sequences
- Multi-sequence batch processing
- Returns species identification with:
  - Identifier
  - Species name
  - Confidence score
  - Raw score

**Service:** `src/services/ednaService.ts`

**Usage Example:**
```typescript
// Otolith API
import otolithService from '../services/otolithService';
const result = await otolithService.predict(imageFile, { useFileUpload: true });

// eDNA API
import ednaService from '../services/ednaService';
const result = await ednaService.matchSequence('AGCTAGCTAGCT...');
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly (frontend and RAG integration)
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Acknowledgments

- **CMLRE** (Centre for Marine Living Resources and Ecology)
- **SagarManthan-RAG** - AI-powered query system
- React Three Fiber community
- Framer Motion for smooth animations
- Tailwind CSS for utility-first styling
- Chart.js for data visualization

---

## Study Modules (Taxonomy, Otolith, eDNA)

The Study section provides three scientist-oriented modules with a consistent grey glass UI over the stars background. They run fully client-side with mock-safe defaults and optional live data where noted.

### 1) Taxonomy 🐠

- Browse a marine hierarchy and search live via GBIF suggest (≥3 chars)
- When a species is selected, the app loads:
  - Scientific name and authorship
  - Real rank and lineage (kingdom → species)
  - Common names (vernaculars)
  - Occurrence distribution by country (bar chart)
  - Image thumbnails from GBIF (falls back to Wikipedia thumbnail if none)
- Clickable lineage segments for quick navigation; per-session Favorites

**Data sources:**
- GBIF Species/Occurrence API: `https://api.gbif.org/v1` (match, species, vernacularNames, facets, images)
- Wikipedia REST (thumbnail fallback)

**Future integration:**
- WoRMS (AphiaID, marine status) and FishBase traits via a server proxy
- Caching and DB-backed favorites

### 2) Otolith Morphology 🔬

- Upload multiple images; select thumbnails to open a viewer
- Viewer modes: Normal / Edge view (contrast + desaturate)
- Annotate mode: click two points to add a length; calibration (px/mm) supported
- Measurements table with CSV export and global filtering
- **AI-Powered Species Classification**: Real API integration
  - Connected to Otolith Classifier API (HuggingFace Space)
  - Upload otolith images and get instant species predictions
  - Displays formatted results: scientific name, confidence score, filename
  - Handles image uploads and base64 encoding automatically

**API Integration:**
- **Endpoint**: `https://chinmay0805-37-otolith-classifier.hf.space/predict`
- **Input**: Otolith image (file upload or base64)
- **Output**: Species identification with confidence scores

**Future enhancements:**
- Image storage (Supabase/Cloudinary)
- Batch processing for multiple images
- Auto edge tracing, ellipse fit, age estimation

### 3) eDNA Data 🧬

- Paste FASTA format sequences or upload `.fa/.fasta/.txt` files
- **Real API Integration**: Connected to eDNA Sequence Matcher API
- Supports multiple sequences in FASTA format or raw sequence input
- Automatic sequence validation and cleaning
- Real-time species identification from DNA sequences

**Results Display:**
- Identifier, Header/Read name
- Species Name (scientifically validated)
- Confidence Score (percentage)
- Raw Score (numeric value)
- Sequence Length

**API Integration:**
- **Endpoint**: `https://sagar-e-dna.vercel.app/api/v1/edna/match`
- **Input**: DNA sequence string (ACGT format)
- **Output**: Species match with confidence metrics
- CSV export with all API response fields
- Species distribution visualization from real API results

**Features:**
- Multi-sequence batch processing
- Error handling for invalid sequences
- Formatted, user-friendly results display
- Automatic FASTA parsing

**API Integration Status:**
- **Taxonomy**: Uses GBIF and Wikipedia APIs (live)
- **Otolith**: Integrated with Otolith Classifier API (HuggingFace Space)
- **eDNA**: Integrated with eDNA Sequence Matcher API (Vercel)

**Notes:**
- Modules handle empty states and graceful fallbacks so the UI always renders
- Live API calls are made directly from the browser
- Error handling implemented for API failures
- For production, consider moving to a backend proxy for rate limits, CORS, and API key management

---

**SAGAR** - Empowering marine research with intelligent data analysis and visualization.
