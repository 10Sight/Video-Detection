# Automated Video Verification System (Demo)

A prototype MERN stack application demonstrating a government workflow for verifying viral videos against an official registry.

**Note:** This is a **DEMO** system using mock data. It does not perform actual AI deepfake detection.

## Prerequisites
- Node.js installed
- MongoDB installed and running (default: `mongodb://localhost:27017`)

## Installation & Setup

1.  **Clone/Open the repository**
2.  **Setup Backend**:
    ```bash
    cd backend
    npm install
    npm run dev
    ```
    *Server runs on http://localhost:5000*

3.  **Setup Frontend**:
    ```bash
    cd frontend
    npm install
    npm run dev
    ```
    *App runs on http://localhost:5173*

## Enhancements (v2)
- **Global Disclaimer**: Persistent banner clarifying the system's "Demo Only" nature.
- **Audit Logs**: Transparent, immutable record of all Upload and Verification actions (`/audit-logs`).
- **Verification Record Page**: Dedicated official record view with specific disclaimers.
- **Neutrality Measures**: Tooltips and clear wording to avoid judging content accuracy.

## Demo Workflow

### 1. Official Authority (Upload)
1.  Login as **Official Authority**.
2.  Upload a video file to register it.
3.  *Action is logged in the Audit Trail.*

### 2. PIB Fact Check (Verify)
1.  Login as **PIB Fact Check**.
2.  **Verify by ID**: Paste the Verification ID -> **Verified Official** (Green).
3.  **Verify by File**: Upload the same file -> **Verified Official** (Green).
4.  **Fake/Modified**: Upload a different file -> **No Official Record Found**.
    - *Note*: If filename contains "modified", it simulates a **Modified/Partial Clip** status.
5.  **View Record**: Click "View Verification Record" for official details.
6.  *All actions are logged.*

### 3. Public / Auditor
1.  Click **View Audit Log** in the header to see the read-only activity history.

## Tech Stack
- **Frontend**: React, Vite, Tailwind CSS
- **Backend**: Node.js, Express, MongoDB (Mongoose)

## Project Structure
- `backend/`: API server and Database models.
- `frontend/`: React UI application.
