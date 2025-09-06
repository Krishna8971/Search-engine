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
from dashboard import router as dashboard_router
from checkout import router as checkout_router

load_dotenv()

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


app.include_router(dashboard_router)
app.include_router(checkout_router)

SECRET_KEY = os.getenv('SECRET_KEY',)
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

security = HTTPBearer()

DB_CONFIG = {
    'host': os.getenv('DB_HOST', 'localhost'),
    'port': int(os.getenv('DB_PORT', 3306)),
    'user': os.getenv('DB_USER', 'root'),
    'password': os.getenv('DB_PASSWORD', ''),
    'database': os.getenv('DB_NAME', 'ecofinds_db'),
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
        
        
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS cart_items (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT NOT NULL,
                listing_id INT NOT NULL,
                quantity INT NOT NULL DEFAULT 1,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
                FOREIGN KEY (listing_id) REFERENCES listings(id) ON DELETE CASCADE,
                UNIQUE KEY unique_user_listing (user_id, listing_id),
                INDEX idx_cart_user (user_id),
                INDEX idx_cart_listing (listing_id)
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

class CartItemAdd(BaseModel):
    product_id: int
    quantity: int = 1

class CartItemUpdate(BaseModel):
    product_id: int
    quantity: int

class CartItemRemove(BaseModel):
    product_id: int

class CartItem(BaseModel):
    id: int
    product_id: int
    quantity: int
    title: str
    price: float
    image: Optional[str] = None
    seller_name: str
    created_at: str

class CartResponse(BaseModel):
    items: list[CartItem]
    total: float
    items_count: int


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


def get_cart_items(user_id: int):
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        cursor.execute("""
            SELECT ci.id, ci.listing_id as product_id, ci.quantity, ci.created_at,
                   l.title, l.price, l.images, u.name as seller_name
            FROM cart_items ci
            LEFT JOIN listings l ON ci.listing_id = l.id
            LEFT JOIN users u ON l.user_id = u.id
            WHERE ci.user_id = %s
            ORDER BY ci.created_at DESC
        """, (user_id,))
        items = cursor.fetchall()
        cursor.close()
        conn.close()
        
        
        cart_items = []
        for item in items:
            
            image = None
            if item.get('images'):
                try:
                    images = item['images'] if isinstance(item['images'], list) else eval(item['images'])
                    if images and len(images) > 0:
                        image = images[0]
                except:
                    pass
            
            cart_items.append({
                "id": item['id'],
                "product_id": item['product_id'],
                "quantity": item['quantity'],
                "title": item['title'] or "Unknown Product",
                "price": float(item['price']) if item['price'] else 0.0,
                "image": image,
                "seller_name": item['seller_name'] or "Unknown Seller",
                "created_at": str(item['created_at'])
            })
        
        return cart_items
    except Error as e:
        print(f"Error getting cart items: {e}")
        return []

def add_to_cart(user_id: int, product_id: int, quantity: int = 1):
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        
        cursor.execute("""
            SELECT id, quantity FROM cart_items 
            WHERE user_id = %s AND listing_id = %s
        """, (user_id, product_id))
        existing_item = cursor.fetchone()
        
        if existing_item:
            
            new_quantity = existing_item[1] + quantity
            cursor.execute("""
                UPDATE cart_items SET quantity = %s, updated_at = CURRENT_TIMESTAMP
                WHERE id = %s
            """, (new_quantity, existing_item[0]))
        else:
            
            cursor.execute("""
                INSERT INTO cart_items (user_id, listing_id, quantity)
                VALUES (%s, %s, %s)
            """, (user_id, product_id, quantity))
        
        conn.commit()
        cursor.close()
        conn.close()
        return True
    except Error as e:
        print(f"Error adding to cart: {e}")
        return False

def update_cart_item(user_id: int, product_id: int, quantity: int):
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        if quantity <= 0:
            
            cursor.execute("""
                DELETE FROM cart_items 
                WHERE user_id = %s AND listing_id = %s
            """, (user_id, product_id))
        else:
            
            cursor.execute("""
                UPDATE cart_items 
                SET quantity = %s, updated_at = CURRENT_TIMESTAMP
                WHERE user_id = %s AND listing_id = %s
            """, (quantity, user_id, product_id))
        
        conn.commit()
        cursor.close()
        conn.close()
        return True
    except Error as e:
        print(f"Error updating cart item: {e}")
        return False

def remove_from_cart(user_id: int, product_id: int):
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        cursor.execute("""
            DELETE FROM cart_items 
            WHERE user_id = %s AND listing_id = %s
        """, (user_id, product_id))
        
        conn.commit()
        cursor.close()
        conn.close()
        return True
    except Error as e:
        print(f"Error removing from cart: {e}")
        return False

def clear_cart(user_id: int):
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        cursor.execute("""
            DELETE FROM cart_items WHERE user_id = %s
        """, (user_id,))
        
        conn.commit()
        cursor.close()
        conn.close()
        return True
    except Error as e:
        print(f"Error clearing cart: {e}")
        return False


@app.get("/api/cart", response_model=CartResponse)
async def get_cart(current_user: dict = Depends(get_current_user)):
    """Get user's cart items"""
    items = get_cart_items(current_user["id"])
    total = sum(item["price"] * item["quantity"] for item in items)
    items_count = sum(item["quantity"] for item in items)
    
    return {
        "items": items,
        "total": total,
        "items_count": items_count
    }

@app.post("/api/cart/add")
async def add_cart_item(item: CartItemAdd, current_user: dict = Depends(get_current_user)):
    """Add item to cart"""
    success = add_to_cart(current_user["id"], item.product_id, item.quantity)
    if not success:
        raise HTTPException(status_code=500, detail="Failed to add item to cart")
    
   
    items = get_cart_items(current_user["id"])
    total = sum(item["price"] * item["quantity"] for item in items)
    items_count = sum(item["quantity"] for item in items)
    
    return {
        "message": "Item added to cart successfully",
        "items": items,
        "total": total,
        "items_count": items_count
    }

@app.put("/api/cart/update")
async def update_cart_item_endpoint(item: CartItemUpdate, current_user: dict = Depends(get_current_user)):
    """Update cart item quantity"""
    success = update_cart_item(current_user["id"], item.product_id, item.quantity)
    if not success:
        raise HTTPException(status_code=500, detail="Failed to update cart item")
    
  
    items = get_cart_items(current_user["id"])
    total = sum(item["price"] * item["quantity"] for item in items)
    items_count = sum(item["quantity"] for item in items)
    
    return {
        "message": "Cart updated successfully",
        "items": items,
        "total": total,
        "items_count": items_count
    }

@app.delete("/api/cart/remove")
async def remove_cart_item(item: CartItemRemove, current_user: dict = Depends(get_current_user)):
    """Remove item from cart"""
    success = remove_from_cart(current_user["id"], item.product_id)
    if not success:
        raise HTTPException(status_code=500, detail="Failed to remove item from cart")
    
    
    items = get_cart_items(current_user["id"])
    total = sum(item["price"] * item["quantity"] for item in items)
    items_count = sum(item["quantity"] for item in items)
    
    return {
        "message": "Item removed from cart successfully",
        "items": items,
        "total": total,
        "items_count": items_count
    }

@app.delete("/api/cart/clear")
async def clear_user_cart(current_user: dict = Depends(get_current_user)):
    """Clear user's cart"""
    success = clear_cart(current_user["id"])
    if not success:
        raise HTTPException(status_code=500, detail="Failed to clear cart")
    
    return {
        "message": "Cart cleared successfully",
        "items": [],
        "total": 0.0,
        "items_count": 0
    }

@app.get("/")
async def root():
    
    return {"message": "SecondMarket API - Your trusted second-hand marketplace"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
