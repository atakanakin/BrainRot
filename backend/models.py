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
    remaining_create_tokens = db.Column(db.Integer, default=20, nullable=False)

    def __repr__(self):
        return f'<User {self.email}>'

    def update_last_login(self):
        """Update last login time"""
        self.last_login = datetime.datetime.now(utc_plus_3)
        db.session.commit()

    @property
    def is_premium(self):
        """Check if user has active premium subscription"""
        if not self.premium:
            return False
        return self.premium_due_date > datetime.datetime.now(utc_plus_3) if self.premium_due_date else False

    def update_premium_status(self, duration_days):
        """Update premium status and duration"""
        self.premium = True
        current_date = datetime.datetime.now(utc_plus_3)
        if self.premium_due_date and self.premium_due_date > current_date:
            self.premium_due_date += datetime.timedelta(days=duration_days)
        else:
            self.premium_due_date = current_date + datetime.timedelta(days=duration_days)
        db.session.commit()

    def update_token(self, new_token):
        """Update OAuth token"""
        self.token = new_token
        self.update_last_login()
        db.session.commit()

    def use_create_token(self):
        """Use one create token if available"""
        if self.remaining_create_tokens <= 0 and not self.is_premium:
            return False
        if not self.is_premium:
            self.remaining_create_tokens -= 1
            db.session.commit()
        return True

    def add_create_tokens(self, amount):
        """Add create tokens to user"""
        self.remaining_create_tokens += amount
        db.session.commit()
        return self.remaining_create_tokens

    @property
    def can_create(self):
        """Check if user can create new items"""
        return self.remaining_create_tokens > 0