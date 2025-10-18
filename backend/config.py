import os
BASE_DIR = os.path.abspath(os.path.dirname(__file__))

class Config:
    SECRET_KEY = os.environ.get("SECRET_KEY", "replace_this_with_a_real_secret")
    SQLALCHEMY_DATABASE_URI = os.environ.get("DATABASE_URL", "sqlite:///" + os.path.join(BASE_DIR, "data.db"))
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    JWT_ALGORITHM = "HS256"
    TOKEN_EXPIRE_SECONDS = 60*60*24  # 1 day
