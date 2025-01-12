Please visit https://thebrainrot.fun

This project is maintained only by me. If you're enjoying it and would like to support my work, please consider [supporting me here](https://buymeacoffee.com/atakanakin). Your contributions are greatly appreciated! 🙏

## Setup Guide

### Prerequisites

Ensure the following are installed:

1. **Python 3.8 or higher**
   - macOS: `brew install python3`
   - Fedora: `sudo dnf install python3 python3-pip`
   - Ubuntu: `sudo apt install python3 python3-pip`

2. **Node.js and npm**
   - macOS: `brew install node`
   - Fedora: `sudo dnf install nodejs npm`
   - Ubuntu: `sudo apt install nodejs npm`

3. **Redis**
   - macOS: `brew install redis`
   - Fedora: `sudo dnf install redis`
   - Ubuntu: `sudo apt install redis`

   Start Redis:
   - macOS: `brew services start redis`
   - Fedora: `sudo systemctl start redis`
   - Ubuntu: `sudo systemctl start redis`

---

### Backend Setup

1. Clone the repository:
    ```bash
    git clone https://github.com/atakanakin/BrainRot.git
    cd BrainRot
    ```

2. Setup the backend environment:
    ```bash
    cd backend
    python3 -m venv venv
    source venv/bin/activate
    pip install -r requirements.txt
    ```

---

### Frontend Setup

1. Navigate to the `frontend` folder:
    ```bash
    cd frontend
    ```

2. Setup the frontend environment:
    ```bash
    npm install
    ```

---

## Run

### Start Redis
Ensure Redis is installed and running:
   - macOS: `brew services start redis`
   - Fedora: `sudo systemctl start redis`
   - Ubuntu: `sudo systemctl start redis`

### Frontend
Run the React frontend:
```bash
cd frontend
npm start
```
The frontend will be available at `http://localhost:3000`.

### Backend
Run the Celery worker and Flask backend in separate terminals:

#### Terminal 1: Start the Celery worker
```bash
cd backend
source venv/bin/activate
celery -A app.celery worker --loglevel=info
```

#### Terminal 2: Start the Flask app
```bash
cd backend
source venv/bin/activate
python3 app.py
```
The backend will be available at `http://localhost:5000`.

---

### Notes

1. **Separate Processes**:
   - The `celery` worker and `python app.py` need to be run in **different terminals** because both are blocking processes.
   
2. **Ensure Redis is Running**:
   - If Redis is not running, tasks queued by Celery will not be processed.

3. **Default Ports**:
   - Frontend: `http://localhost:3000`
   - Backend: `http://localhost:5000`

4. **If You Face Node.js Issues**:
   - Use the following command before running `npm start`:
     ```bash
     export NODE_OPTIONS=--openssl-legacy-provider
     ```
