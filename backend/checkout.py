from fastapi import APIRouter, HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel, EmailStr
from typing import List, Optional
from datetime import datetime
import mysql.connector
from mysql.connector import Error
import os
import jwt as pyjwt
from dotenv import load_dotenv

load_dotenv()

router = APIRouter()


DB_CONFIG = {
    'host': os.getenv('DB_HOST', 'localhost'),
    'port': int(os.getenv('DB_PORT', 3306)),
    'user': os.getenv('DB_USER', 'root'),
    'password': os.getenv('DB_PASSWORD', ''),
    'database': os.getenv('DB_NAME', 'ecofinds_db'),
    'charset': 'utf8mb4',
    'autocommit': True
}

SECRET_KEY = os.getenv('SECRET_KEY', 'your-secret-key')
ALGORITHM = "HS256"
security = HTTPBearer()

def get_db_connection():
    """Get database connection"""
    try:
        connection = mysql.connector.connect(**DB_CONFIG)
        return connection
    except Error as e:
        print(f"Error connecting to MySQL: {e}")
        raise HTTPException(
            status_code=500,
            detail="Database connection failed"
        )

def get_user_by_email(email: str):
    """Get user by email"""
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

def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """Get current user from JWT token"""
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

def init_checkout_tables():
    """Initialize checkout-related database tables"""
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS orders (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT NOT NULL,
                order_number VARCHAR(50) UNIQUE NOT NULL,
                status ENUM('pending', 'processing', 'shipped', 'delivered', 'cancelled') DEFAULT 'pending',
                total_amount DECIMAL(10, 2) NOT NULL,
                shipping_address JSON NOT NULL,
                payment_info JSON NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
                INDEX idx_orders_user (user_id),
                INDEX idx_orders_number (order_number),
                INDEX idx_orders_status (status)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        ''')
        
        
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS order_items (
                id INT AUTO_INCREMENT PRIMARY KEY,
                order_id INT NOT NULL,
                listing_id INT NOT NULL,
                quantity INT NOT NULL,
                unit_price DECIMAL(10, 2) NOT NULL,
                total_price DECIMAL(10, 2) NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
                FOREIGN KEY (listing_id) REFERENCES listings(id) ON DELETE CASCADE,
                INDEX idx_order_items_order (order_id),
                INDEX idx_order_items_listing (listing_id)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        ''')
        
        conn.commit()
        cursor.close()
        conn.close()
        print("Checkout tables initialized successfully")
    except Error as e:
        print(f"Error initializing checkout tables: {e}")
        raise


init_checkout_tables()


class OrderItem(BaseModel):
    product_id: int
    quantity: int
    price: float

class ShippingAddress(BaseModel):
    firstName: str
    lastName: str
    email: EmailStr
    phone: str
    address: str
    city: str
    state: str
    zipCode: str
    country: str

class PaymentInfo(BaseModel):
    method: str
    cardNumber: Optional[str] = None
    expiryDate: Optional[str] = None
    cvv: Optional[str] = None
    nameOnCard: Optional[str] = None

class CheckoutRequest(BaseModel):
    order_items: List[OrderItem]
    shipping_address: ShippingAddress
    payment_info: PaymentInfo

class OrderResponse(BaseModel):
    order_id: int
    order_number: str
    status: str
    total_amount: float
    message: str

def generate_order_number():
    """Generate a unique order number"""
    import uuid
    return f"ORD-{datetime.now().strftime('%Y%m%d')}-{str(uuid.uuid4())[:8].upper()}"


@router.post("/api/checkout", response_model=OrderResponse)
async def process_checkout(
    checkout_data: CheckoutRequest,
    current_user: dict = Depends(get_current_user)
):
    """Process checkout and create order"""
    
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        
        total_amount = sum(item.price * item.quantity for item in checkout_data.order_items)
        
        
        order_number = generate_order_number()
        
        
        cursor.execute("""
            INSERT INTO orders (user_id, order_number, total_amount, shipping_address, payment_info)
            VALUES (%s, %s, %s, %s, %s)
        """, (
            current_user["id"],
            order_number,
            total_amount,
            checkout_data.shipping_address.json(),
            checkout_data.payment_info.json()
        ))
        
        order_id = cursor.lastrowid
        
        
        for item in checkout_data.order_items:
            total_price = item.price * item.quantity
            cursor.execute("""
                INSERT INTO order_items (order_id, listing_id, quantity, unit_price, total_price)
                VALUES (%s, %s, %s, %s, %s)
            """, (
                order_id,
                item.product_id,
                item.quantity,
                item.price,
                total_price
            ))
        
        
        cursor.execute("DELETE FROM cart_items WHERE user_id = %s", (current_user["id"],))
        
        conn.commit()
        cursor.close()
        conn.close()
        
        return OrderResponse(
            order_id=order_id,
            order_number=order_number,
            status="pending",
            total_amount=total_amount,
            message="Order placed successfully!"
        )
        
    except Error as e:
        print(f"Error processing checkout: {e}")
        raise HTTPException(
            status_code=500,
            detail="Failed to process checkout"
        )

@router.get("/api/orders")
async def get_user_orders(current_user: dict = Depends(get_current_user)):
    """Get user's order history"""
    
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        
        cursor.execute("""
            SELECT o.id, o.order_number, o.status, o.total_amount, o.created_at,
                   o.shipping_address, o.payment_info
            FROM orders o
            WHERE o.user_id = %s
            ORDER BY o.created_at DESC
        """, (current_user["id"],))
        
        orders = cursor.fetchall()
        
        
        for order in orders:
            if order.get('created_at'):
                order['created_at'] = str(order['created_at'])
            if order.get('shipping_address'):
                import json
                order['shipping_address'] = json.loads(order['shipping_address'])
            if order.get('payment_info'):
                import json
                order['payment_info'] = json.loads(order['payment_info'])
        
        cursor.close()
        conn.close()
        
        return {"orders": orders}
        
    except Error as e:
        print(f"Error fetching orders: {e}")
        raise HTTPException(
            status_code=500,
            detail="Failed to fetch orders"
        )

@router.get("/api/orders/{order_id}")
async def get_order_details(
    order_id: int,
    current_user: dict = Depends(get_current_user)
):
    """Get detailed information about a specific order"""
    
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        
        
        cursor.execute("""
            SELECT o.id, o.order_number, o.status, o.total_amount, o.created_at,
                   o.shipping_address, o.payment_info
            FROM orders o
            WHERE o.id = %s AND o.user_id = %s
        """, (order_id, current_user["id"]))
        
        order = cursor.fetchone()
        
        if not order:
            raise HTTPException(
                status_code=404,
                detail="Order not found"
            )
        
        
        cursor.execute("""
            SELECT oi.id, oi.listing_id, oi.quantity, oi.unit_price, oi.total_price,
                   l.title, l.images, u.name as seller_name
            FROM order_items oi
            LEFT JOIN listings l ON oi.listing_id = l.id
            LEFT JOIN users u ON l.user_id = u.id
            WHERE oi.order_id = %s
        """, (order_id,))
        
        items = cursor.fetchall()
        
        
        order_items = []
        for item in items:
            
            image = None
            if item.get('images'):
                try:
                    images = item['images'] if isinstance(item['images'], list) else eval(item['images'])
                    if images and len(images) > 0:
                        image = images[0]
                except:
                    pass
            
            order_items.append({
                "id": item['id'],
                "listing_id": item['listing_id'],
                "quantity": item['quantity'],
                "unit_price": float(item['unit_price']),
                "total_price": float(item['total_price']),
                "title": item['title'] or "Unknown Product",
                "image": image,
                "seller_name": item['seller_name'] or "Unknown Seller"
            })
        
        
        if order.get('created_at'):
            order['created_at'] = str(order['created_at'])
        if order.get('shipping_address'):
            import json
            order['shipping_address'] = json.loads(order['shipping_address'])
        if order.get('payment_info'):
            import json
            order['payment_info'] = json.loads(order['payment_info'])
        
        order['items'] = order_items
        
        cursor.close()
        conn.close()
        
        return order
        
    except Error as e:
        print(f"Error fetching order details: {e}")
        raise HTTPException(
            status_code=500,
            detail="Failed to fetch order details"
        )

@router.put("/api/orders/{order_id}/status")
async def update_order_status(
    order_id: int,
    status: str,
    current_user: dict = Depends(get_current_user)
):
    """Update order status (admin only in real implementation)"""
    
    valid_statuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled']
    if status not in valid_statuses:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid status. Must be one of: {', '.join(valid_statuses)}"
        )
    
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        
        cursor.execute("""
            SELECT id FROM orders 
            WHERE id = %s AND user_id = %s
        """, (order_id, current_user["id"]))
        
        if not cursor.fetchone():
            raise HTTPException(
                status_code=404,
                detail="Order not found"
            )
        
        
        cursor.execute("""
            UPDATE orders 
            SET status = %s, updated_at = CURRENT_TIMESTAMP
            WHERE id = %s
        """, (status, order_id))
        
        conn.commit()
        cursor.close()
        conn.close()
        
        return {"message": f"Order status updated to {status}"}
        
    except Error as e:
        print(f"Error updating order status: {e}")
        raise HTTPException(
            status_code=500,
            detail="Failed to update order status"
        )
