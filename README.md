# 🚀 Multi-Agent Startup Intelligence Platform (`Novaventure AI`)

LIVE DEMO: https://multi-agent-startup-intelligent-sys.vercel.app

An end-to-end **AI-Powered Multi-Agent Startup Intelligence & Validation System** built with **CrewAI**, **FastAPI**, **MongoDB Atlas**, and **React (Vite + Tailwind CSS)**.

This platform orchestrates a sequential pipeline of **four specialized AI agents** powered by **Llama 3.3 70B (via Groq)** and **real-time Google Search (via SerperDev)** to research market trends, discover viable startup opportunities based on domain and budget, project financial metrics, and validate overall business viability—streaming live execution logs via WebSockets to an interactive analytics dashboard.

---

## 📂 Organized Project Architecture

```text
Multiagent_startup_intelligent/
│
├── backend/                        # ⚙️ FastAPI Backend, Database & Parsing Engine
│   ├── api.py                      # Main FastAPI server, CrewAI endpoints & WebSocket log broadcaster
│   ├── db.py                       # Async MongoDB Atlas connection (Motor) & collection accessors
│   ├── report_routes.py            # Report CRUD, ownership checks & aggregated dashboard statistics
│   └── chart_parser.py             # Hybrid JSON/Regex parser extracting structured chart metrics
│
├── security/                       # 🔐 Authentication, Authorization & Security Layer
│   ├── auth_routes.py              # JWT creation/validation, bcrypt hashing, Google OAuth2 & RBAC
│   └── .env.example                # Security & environment variables template
│
├── src/startup_advisor/            # 🤖 CrewAI Multi-Agent Core Engine
│   ├── __init__.py
│   ├── crew.py                     # Agent, Task & Crew definitions (Groq Llama-3.3-70B + SerperDevTool)
│   ├── main.py                     # CLI runner, training, replay & trigger entry points
│   ├── config/
│   │   ├── agents.yaml             # Role, Goal & Backstory definitions for all 4 AI Agents
│   │   └── tasks.yaml              # Task prompts & strict JSON + Markdown output schemas
│   └── tools/
│       └── custom_tool.py          # Custom CrewAI tool templates
│
├── frontend/                       # 💻 Primary Full-Stack React 19 Dashboard (Tailwind v4 + Recharts)
│   ├── src/
│   │   ├── components/             # Interactive charts (ReportCharts.jsx) & Dashboard/Protected layouts
│   │   ├── contexts/               # AuthContext (JWT/Google OAuth) & ThemeContext (Dark/Light mode)
│   │   ├── pages/                  # Dashboard, NewAnalysis, AgentWorkflow, LiveConsole, Report, RunHistory, ProfileSettings, Login, Signup
│   │   └── services/api.js         # Axios client with JWT interceptors
│   ├── package.json
│   └── vite.config.js
│
├── multiagent/                     # 🖥️ Secondary / Modular React UI Workspace
│   ├── src/                        # Domain-specific views (trend, business, financial, validation, profile)
│   └── package.json
│
├── outputs/                        # 📄 Generated AI Agent Markdown Reports
│   ├── report.md                   # Output of Agent 1: Market Trend Analysis Report
│   ├── business_report.md          # Output of Agent 2: Business Discovery & SWOT Report
│   ├── financial_report.md         # Output of Agent 3: Financial & ROI Projections Report
│   └── validation_report.md        # Output of Agent 4: Final Startup Viability & Validation Report
│
├── tests/                          # 🧪 Pipeline & Integration Tests
│   ├── test_agent.py               # End-to-end sequential 4-agent pipeline test script
│   └── test_serper.py              # SerperDev Google Search API connectivity test
│
├── knowledge/                      # 🧠 CrewAI Knowledge Base
│   └── user_preference.txt         # Domain & user context preferences
│
├── uploads/                        # 🖼️ Static User Uploads (Profile pictures served at /api/uploads)
├── .env                            # Local environment secrets (Git-ignored)
├── pyproject.toml                  # Python project metadata & CrewAI scripts configuration
└── README.md                       # Complete project documentation
```

---

## 🤖 The 4-Agent Sequential Intelligence Pipeline

The core intelligence engine ([src/startup_advisor/crew.py](file:///c:/Users/anush/multiagent/Multiagent_startup_intelligent/src/startup_advisor/crew.py)) runs four specialized agents sequentially, passing context from one stage to the next and appending structured JSON blocks for visual rendering:

| Stage | Agent Name | Role & Responsibility | Tools Used | Output File | Key Extracted Metrics |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **1** | **`trend_analyst`** | **Market Trend Analyst**: Scans global market trends, emerging technologies, high-demand jobs, and growth sectors. | `SerperDevTool` (Live Web Search) | [outputs/report.md](file:///c:/Users/anush/multiagent/Multiagent_startup_intelligent/outputs/report.md) | `cagr`, `top_region`, `market_size`, `keywords`, `historical_growth` (5-yr) |
| **2** | **`business_discovery_agent`** | **Business Discovery Specialist**: Evaluates the user's target `field` (industry) and `budget` to recommend tailored startup models, competitors, and SWOT analysis. | LLM Reasoning (`llama-3.3-70b-versatile`) | [outputs/business_report.md](file:///c:/Users/anush/multiagent/Multiagent_startup_intelligent/outputs/business_report.md) | `opportunity_score`, `competition_level`, `strengths`, `weaknesses`, `opportunities`, `threats` |
| **3** | **`financial_agent`** | **Financial & Growth Advisor**: Consumes the Business Discovery report to estimate startup costs, burn rate, first-year revenue, ROI %, and break-even timeline. | `SerperDevTool` (Live Web Search) | [outputs/financial_report.md](file:///c:/Users/anush/multiagent/Multiagent_startup_intelligent/outputs/financial_report.md) | `initial_investment`, `projected_roi`, `break_even_month`, `first_year_revenue`, `burn_rate` |
| **4** | **`business_validation_agent`** | **Business Validation Specialist**: Audits the Financial Report to compute final success probability, risk score, category scores, and a `GO / HOLD / NO GO` verdict. | `SerperDevTool` (Live Web Search) | [outputs/validation_report.md](file:///c:/Users/anush/multiagent/Multiagent_startup_intelligent/outputs/validation_report.md) | `market_demand`, `success_probability`, `risk_percentage`, `growth_potential`, `final_recommendation`, `demand_score`, `growth_score`, `investment_score`, `risk_score` |

---

## 🔐 Security & Authentication Architecture ([security/](file:///c:/Users/anush/multiagent/Multiagent_startup_intelligent/security))

Managed in [security/auth_routes.py](file:///c:/Users/anush/multiagent/Multiagent_startup_intelligent/security/auth_routes.py):
- **Password Hashing**: Uses `passlib` with `bcrypt` (`CryptContext`) so plain-text passwords are never stored.
- **JWT Session Tokens**: Signed with `HS256` (`JWT_SECRET`) with a 7-day expiration (`JWT_EXPIRY_DAYS = 7`).
- **Server-Side Google OAuth 2.0**: Validates frontend Google access tokens directly against `https://www.googleapis.com/oauth2/v3/userinfo` using `aiohttp` and upserts the user profile in MongoDB.
- **Role-Based Admin Access Control (`is_admin_check`)**: Restricts sensitive features—such as the real-time WebSocket Live Agent Console (`/api/ws/logs`)—exclusively to the configured `ADMIN_EMAIL`.
- **Resource Ownership Enforcement**: Every report retrieval (`GET /api/reports/{id}`) and deletion (`DELETE /api/reports/{id}`) verifies `doc["user_id"] == current_user["_id"]` before returning data.

---

## ⚙️ Backend API & Database Architecture ([backend/](file:///c:/Users/anush/multiagent/Multiagent_startup_intelligent/backend))

### MongoDB Atlas Collections ([backend/db.py](file:///c:/Users/anush/multiagent/Multiagent_startup_intelligent/backend/db.py))
Connected asynchronously via `motor.motor_asyncio.AsyncIOMotorClient` using `certifi` TLS certificates to the `startup_intelligence` database:
1. **`users`**: Stores email/Google accounts, hashed passwords, profile metadata (`mobile`, `company`, `designation`, `country`, `timezone`), and avatar URLs.
2. **`reports`**: Stores full multi-agent analyses, raw markdown outputs, parsed JSON chart metrics (`parsed`), viability scores, and project metadata (`PRJ-XXXXXX`).
3. **`agent_outputs`**: Logs individual agent executions (`trend`, `discovery`, `financial`, `validation`) per user.
4. **`activities`**: Tracks user audit events (e.g., `"Analysis completed: FinTech"`) for the dashboard activity feed.

### REST & WebSocket API Endpoints
| Method | Endpoint | Auth | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/signup` | Public | Register a new user with email & password |
| `POST` | `/api/auth/login` | Public | Authenticate user and return signed JWT |
| `POST` | `/api/auth/google` | Public | Verify Google OAuth access token & return JWT |
| `GET` | `/api/auth/me` | Bearer JWT | Fetch current user profile & admin status |
| `PUT` | `/api/auth/profile` | Bearer JWT | Update user profile details & upload avatar image |
| `POST` | `/api/trend` | Bearer JWT | Trigger Agent 1 (`trend_crew`) & save output |
| `POST` | `/api/discovery` | Bearer JWT | Trigger Agent 2 (`business_crew`) with `field` & `budget` |
| `POST` | `/api/financial` | Bearer JWT | Trigger Agent 3 (`financial_crew`) with `business_report` |
| `POST` | `/api/validation` | Bearer JWT | Trigger Agent 4 (`validation_crew`) with `financial_report` |
| `POST` | `/api/reports` | Bearer JWT | Parse all 4 agent outputs via `chart_parser.py` & save report |
| `GET` | `/api/reports` | Bearer JWT | List all saved reports for the authenticated user |
| `GET` | `/api/reports/{id}` | Bearer JWT | Retrieve full report (raw markdown + parsed chart metrics) |
| `DELETE`| `/api/reports/{id}` | Bearer JWT | Delete a specific report owned by the user |
| `GET` | `/api/stats` | Bearer JWT | Aggregated KPIs (total analyses, average score, high-risk count, recent activity) |
| `WS` | `/api/ws/logs?token=`| Admin JWT | Real-time stdout/stderr stream from CrewAI execution (`WSStreamLogger`) |
| `GET` | `/api/models` | Public | Query local LM Studio `/v1/models` endpoint (if active) |
| `GET` | `/api/health` | Public | Service health check |

---

## 💻 Frontend Features ([frontend/](file:///c:/Users/anush/multiagent/Multiagent_startup_intelligent/frontend))

Built with **React 19**, **Vite 8**, **Tailwind CSS v4**, **Recharts**, **Framer Motion**, and **Lucide Icons**:
- **Executive Dashboard (`Dashboard.jsx`)**: Displays aggregated metrics (Total Analyses, Average Viability Score, High-Risk Ideas Flagged) and recent activity logs.
- **New Analysis & Agent Workflow (`NewAnalysis.jsx`, `AgentWorkflow.jsx`)**: Step-by-step interactive pipeline triggering Trend -> Discovery -> Financial -> Validation agents with progress tracking.
- **Interactive Report Visualizations (`Report.jsx`, `ReportCharts.jsx`)**: Renders parsed JSON metrics into interactive charts alongside formatted Markdown reports.
- **Real-Time Admin Console (`LiveConsole.jsx`)**: Streams live CrewAI agent thought processes over WebSockets (`/api/ws/logs`).
- **Run History (`RunHistory.jsx`)**: Search, view, and manage past startup validation reports.
- **Profile & Theme Management (`ProfileSettings.jsx`, `ThemeContext.jsx`)**: Avatar upload, company/timezone settings, and dark/light theme switching.

---

## 🛠️ Setup, Installation & Running Locally

### 1. Environment Variables
Create a `.env` file in the root directory (use [security/.env.example](file:///c:/Users/anush/multiagent/Multiagent_startup_intelligent/security/.env.example) as a reference):
```env
GROQ_API_KEY=your_groq_api_key
SERPER_API_KEY=your_serper_api_key
MONGODB_URL=mongodb+srv://<user>:<password>@<cluster>.mongodb.net/?retryWrites=true&w=majority
JWT_SECRET=your_super_secret_jwt_key
ADMIN_EMAIL=your_admin_email@gmail.com
```

### 2. Install Backend Dependencies
Ensure Python **>=3.10, <3.14** is installed:
```powershell
pip install uv
crewai install
pip install fastapi uvicorn motor pymongo[srv] certifi python-dotenv passlib[bcrypt] python-jose[cryptography] python-multipart aiohttp requests
```

### 3. Run the FastAPI Backend Server
From the project root:
```powershell
python backend/api.py
```
*The API will start at `http://localhost:8000` (Swagger docs at `http://localhost:8000/docs`).*

### 4. Run the React Frontend
Open a second terminal and run:
```powershell
cd frontend
npm install
npm run dev
```
*The web application will be available at `http://localhost:5173`.*

### 5. Run the CrewAI Pipeline via CLI (Optional)
To run the 4-agent pipeline directly in the terminal and generate reports in [outputs/](file:///c:/Users/anush/multiagent/Multiagent_startup_intelligent/outputs):
```powershell
python tests/test_agent.py
# or
crewai run
```
