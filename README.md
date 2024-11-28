## Run

### Frontend
```shell
cd frontend
npm install
npm start
```
### Backend
```shell
sudo systemctl start redis
cd backend
celery -A app.celery worker --loglevel=info
python app.py
```

> Note: celery and python app.py should be run in different terminals since they are both blocking processes.
