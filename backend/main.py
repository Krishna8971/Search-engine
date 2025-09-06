from fastapi import FastAPI, HTTPException, Depends, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel, EmailStr
import bcrypt
import jwt as pyjwt
from datetime import datetime, timedelta
import mysql.connector
from mysql.connector import Error
import os
from typing import Optional
from dotenv import load_dotenv

load_dotenv()

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

SECRET_KEY = os.getenv('SECRET_KEY',)
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

security = HTTPBearer()

DB_CONFIG = {
    'host': os.getenv('DB_HOST', 'localhost'),
    'port': int(os.getenv('DB_PORT', 3306)),
    'user': os.getenv('DB_USER', 'root'),
    'password': os.getenv('DB_PASSWORD', ''),
    'database': os.getenv('DB_NAME',),
    'charset': 'utf8mb4',
    'autocommit': True
}

def get_db_connection():
    
    try:
        connection = mysql.connector.connect(**DB_CONFIG)
        return connection
    except Error as e:
        print(f"Error connecting to MySQL: {e}")
        raise HTTPException(
            status_code=500,
            detail="Database connection failed"
        )

def init_db():
    
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
       
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS users (
                id INT AUTO_INCREMENT PRIMARY KEY,
                email VARCHAR(255) UNIQUE NOT NULL,
                password_hash TEXT NOT NULL,
                name VARCHAR(255) NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                is_active BOOLEAN DEFAULT TRUE,
                INDEX idx_users_email (email)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        ''')
        
        conn.commit()
        cursor.close()
        conn.close()
        print("Database tables initialized successfully")
    except Error as e:
        print(f"Error initializing database: {e}")
        raise


init_db()


class UserCreate(BaseModel):
    name: str
    email: EmailStr
    password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str

class User(BaseModel):
    id: int
    name: str
    email: str
    created_at: str
    is_active: bool


def hash_password(password: str) -> str:
    
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(password.encode('utf-8'), salt)
    return hashed.decode('utf-8')

def verify_password(password: str, hashed_password: str) -> bool:
    
    return bcrypt.checkpw(password.encode('utf-8'), hashed_password.encode('utf-8'))

def get_user_by_email(email: str):
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        cursor.execute("""
            SELECT id, email, password_hash, name, created_at, is_active 
            FROM users 
            WHERE email = %s AND is_active = TRUE
        """, (email,))
        user = cursor.fetchone()
        cursor.close()
        conn.close()
        
        
        if user and user.get('created_at'):
            user['created_at'] = str(user['created_at'])
            
        return user
    except Error as e:
        print(f"Error getting user by email: {e}")
        return None

def get_all_users():
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        cursor.execute("""
            SELECT id, email, name, created_at, is_active 
            FROM users 
            WHERE is_active = TRUE
            ORDER BY created_at DESC
        """)
        users = cursor.fetchall()
        cursor.close()
        conn.close()
        
        
        for user in users:
            if user.get('created_at'):
                user['created_at'] = str(user['created_at'])
        
        return users
    except Error as e:
        print(f"Error getting all users: {e}")
        return []

def get_user_count():
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT COUNT(*) FROM users WHERE is_active = TRUE")
        count = cursor.fetchone()[0]
        cursor.close()
        conn.close()
        return count
    except Error as e:
        print(f"Error getting user count: {e}")
        return 0

def create_user(user_data: UserCreate):
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        hashed_password = hash_password(user_data.password)
        cursor.execute(
            "INSERT INTO users (name, email, password_hash) VALUES (%s, %s, %s)",
            (user_data.name, user_data.email, hashed_password)
        )
        user_id = cursor.lastrowid
        
       
        cursor.execute(
            "SELECT id, name, email, created_at, is_active FROM users WHERE id = %s",
            (user_id,)
        )
        user = cursor.fetchone()
        cursor.close()
        conn.close()
        
        return {
            "id": user[0], 
            "name": user[1], 
            "email": user[2],
            "created_at": str(user[3]),
            "is_active": user[4]
        }
    except mysql.connector.IntegrityError:
        if conn:
            cursor.close()
            conn.close()
        raise HTTPException(
            status_code=400,
            detail="Email already registered"
        )
    except Error as e:
        if conn:
            cursor.close()
            conn.close()
        print(f"Error creating user: {e}")
        raise HTTPException(
            status_code=500,
            detail="Failed to create user"
        )

def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    
    token = credentials.credentials
    try:
        payload = pyjwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Could not validate credentials",
                headers={"WWW-Authenticate": "Bearer"},
            )
    except pyjwt.PyJWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    user = get_user_by_email(email)
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return user


@app.post("/api/register", response_model=dict)
async def register(user_data: UserCreate):
    """Register a new user"""
    user = create_user(user_data)
    return {"message": "User created successfully", "user": user}

@app.post("/api/login", response_model=Token)
async def login(user_credentials: UserLogin):
    """Authenticate user and return access token"""
    user = get_user_by_email(user_credentials.email)
    if not user or not verify_password(user_credentials.password, user["password_hash"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Create JWT token directly
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode = {"sub": user["email"], "exp": expire}
    access_token = pyjwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    
    return {"access_token": access_token, "token_type": "bearer"}

@app.get("/api/profile", response_model=User)
async def get_profile(current_user: dict = Depends(get_current_user)):
    
    return {
        "id": current_user["id"],
        "name": current_user["name"],
        "email": current_user["email"],
        "created_at": str(current_user["created_at"]) if current_user.get("created_at") else "",
        "is_active": current_user["is_active"]
    }

@app.get("/api/users/count")
async def get_users_count():
    
    count = get_user_count()
    return {"total_users": count}

@app.get("/api/users")
async def get_users(current_user: dict = Depends(get_current_user)):
    
    users = get_all_users()
    return {"users": users}

@app.get("/")
async def root():
    
    return {"message": "SecondMarket API - Your trusted second-hand marketplace"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
