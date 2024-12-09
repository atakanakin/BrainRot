from flask_sqlalchemy import SQLAlchemy
import datetime

# init
db = SQLAlchemy()

# timezone
utc_plus_3 = datetime.timezone(datetime.timedelta(hours=3))


# user
class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    google_id = db.Column(db.String(100), unique=True, nullable=False)
    email = db.Column(db.String(100), unique=True, nullable=False)
    name = db.Column(db.String(100), nullable=False)
    token = db.Column(db.Text, nullable=False)
    last_login = db.Column(db.DateTime, default=datetime.datetime.now(utc_plus_3))
    premium = db.Column(db.Boolean, default=False)
    premium_due_date = db.Column(db.DateTime, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.datetime.now(utc_plus_3))
