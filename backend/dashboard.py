from fastapi import APIRouter, HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel
from datetime import datetime
import mysql.connector
from mysql.connector import Error
import os
from typing import List, Optional
from dotenv import load_dotenv

load_dotenv()

router = APIRouter()
security = HTTPBearer()

# Database configuration
DB_CONFIG = {
    'host': os.getenv('DB_HOST', 'localhost'),
    'port': int(os.getenv('DB_PORT', 3306)),
    'user': os.getenv('DB_USER', 'root'),
    'password': os.getenv('DB_PASSWORD', ''),
    'database': os.getenv('DB_NAME', ''),
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

def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    import jwt as pyjwt
    SECRET_KEY = os.getenv('SECRET_KEY', '')
    ALGORITHM = "HS256"
    
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
    
    # Get user from database
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        cursor.execute("""
            SELECT id, email, name, created_at, is_active 
            FROM users 
            WHERE email = %s AND is_active = TRUE
        """, (email,))
        user = cursor.fetchone()
        cursor.close()
        conn.close()
        
        if user is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Could not validate credentials",
                headers={"WWW-Authenticate": "Bearer"},
            )
        return user
    except Error as e:
        print(f"Error getting user: {e}")
        raise HTTPException(
            status_code=500,
            detail="Failed to get user information"
        )

# Pydantic models
class ListingCreate(BaseModel):
    title: str
    description: str
    price: float
    category: str
    condition: str
    location: str
    images: Optional[List[str]] = []

class ListingUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    price: Optional[float] = None
    category: Optional[str] = None
    condition: Optional[str] = None
    location: Optional[str] = None
    images: Optional[List[str]] = None
    is_active: Optional[bool] = None

class MessageCreate(BaseModel):
    recipient_id: int
    subject: str
    content: str
    listing_id: Optional[int] = None

class OrderCreate(BaseModel):
    listing_id: int
    quantity: int = 1
    shipping_address: str
    payment_method: str

class ReviewCreate(BaseModel):
    listing_id: int
    rating: int
    comment: str

# Initialize database tables
def init_dashboard_tables():
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Listings table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS listings (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT NOT NULL,
                title VARCHAR(255) NOT NULL,
                description TEXT NOT NULL,
                price DECIMAL(10, 2) NOT NULL,
                category VARCHAR(100) NOT NULL,
                `condition` VARCHAR(50) NOT NULL,
                location VARCHAR(255) NOT NULL,
                images JSON,
                is_active BOOLEAN DEFAULT TRUE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
                INDEX idx_listings_user_id (user_id),
                INDEX idx_listings_category (category),
                INDEX idx_listings_price (price)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        ''')
        
        # Messages table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS messages (
                id INT AUTO_INCREMENT PRIMARY KEY,
                sender_id INT NOT NULL,
                recipient_id INT NOT NULL,
                subject VARCHAR(255) NOT NULL,
                content TEXT NOT NULL,
                listing_id INT NULL,
                is_read BOOLEAN DEFAULT FALSE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE,
                FOREIGN KEY (recipient_id) REFERENCES users(id) ON DELETE CASCADE,
                FOREIGN KEY (listing_id) REFERENCES listings(id) ON DELETE SET NULL,
                INDEX idx_messages_sender (sender_id),
                INDEX idx_messages_recipient (recipient_id),
                INDEX idx_messages_created_at (created_at)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        ''')
        
        # Orders table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS orders (
                id INT AUTO_INCREMENT PRIMARY KEY,
                buyer_id INT NOT NULL,
                seller_id INT NOT NULL,
                listing_id INT NOT NULL,
                quantity INT NOT NULL DEFAULT 1,
                total_price DECIMAL(10, 2) NOT NULL,
                shipping_address TEXT NOT NULL,
                payment_method VARCHAR(100) NOT NULL,
                `status` ENUM('pending', 'confirmed', 'shipped', 'delivered', 'cancelled') DEFAULT 'pending',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                FOREIGN KEY (buyer_id) REFERENCES users(id) ON DELETE CASCADE,
                FOREIGN KEY (seller_id) REFERENCES users(id) ON DELETE CASCADE,
                FOREIGN KEY (listing_id) REFERENCES listings(id) ON DELETE CASCADE,
                INDEX idx_orders_buyer (buyer_id),
                INDEX idx_orders_seller (seller_id),
                INDEX idx_orders_status (`status`)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        ''')
        
        # Reviews table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS reviews (
                id INT AUTO_INCREMENT PRIMARY KEY,
                reviewer_id INT NOT NULL,
                reviewee_id INT NOT NULL,
                listing_id INT NOT NULL,
                rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
                comment TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (reviewer_id) REFERENCES users(id) ON DELETE CASCADE,
                FOREIGN KEY (reviewee_id) REFERENCES users(id) ON DELETE CASCADE,
                FOREIGN KEY (listing_id) REFERENCES listings(id) ON DELETE CASCADE,
                UNIQUE KEY unique_review (reviewer_id, listing_id),
                INDEX idx_reviews_reviewee (reviewee_id),
                INDEX idx_reviews_listing (listing_id)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        ''')
        
        conn.commit()
        cursor.close()
        conn.close()
        print("Dashboard tables initialized successfully")
    except Error as e:
        print(f"Error initializing dashboard tables: {e}")
        raise

# Initialize tables when module is imported
init_dashboard_tables()

# LISTINGS ENDPOINTS
@router.get("/api/listings", response_model=dict)
async def get_all_listings(category: str = None, search: str = None, limit: int = 50, offset: int = 0):
    """Get all active listings for the shop page"""
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        
        # Build query with filters
        query = """
            SELECT l.id, l.title, l.description, l.price, l.category, l.condition_type, 
                   l.location, l.images, l.status, l.views, l.created_at, l.updated_at,
                   u.name as seller_name, u.email as seller_email
            FROM listings l
            JOIN users u ON l.user_id = u.id
            WHERE l.status = 'active'
        """
        params = []
        
        if category and category != 'All':
            query += " AND l.category = %s"
            params.append(category)
        
        if search:
            query += " AND (l.title LIKE %s OR l.description LIKE %s OR l.location LIKE %s)"
            search_term = f"%{search}%"
            params.extend([search_term, search_term, search_term])
        
        query += " ORDER BY l.created_at DESC LIMIT %s OFFSET %s"
        params.extend([limit, offset])
        
        cursor.execute(query, params)
        listings = cursor.fetchall()
        
        # Parse images JSON for each listing
        for listing in listings:
            if listing['images']:
                try:
                    import json
                    listing['images'] = json.loads(listing['images'])
                except (json.JSONDecodeError, TypeError):
                    listing['images'] = []
            else:
                listing['images'] = []
        
        # Get total count for pagination
        count_query = """
            SELECT COUNT(*) as total
            FROM listings l
            WHERE l.status = 'active'
        """
        count_params = []
        
        if category and category != 'All':
            count_query += " AND l.category = %s"
            count_params.append(category)
        
        if search:
            count_query += " AND (l.title LIKE %s OR l.description LIKE %s OR l.location LIKE %s)"
            search_term = f"%{search}%"
            count_params.extend([search_term, search_term, search_term])
        
        cursor.execute(count_query, count_params)
        total_count = cursor.fetchone()['total']
        
        cursor.close()
        conn.close()
        
        return {
            "listings": listings,
            "total": total_count,
            "limit": limit,
            "offset": offset
        }
    except Error as e:
        print(f"Error getting all listings: {e}")
        raise HTTPException(status_code=500, detail="Failed to get listings")

@router.post("/api/listings", response_model=dict)
async def create_listing(listing: ListingCreate, current_user: dict = Depends(get_current_user)):
    """Create a new listing"""
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Convert images list to JSON string for storage
        images_json = None
        if listing.images and len(listing.images) > 0:
            import json
            images_json = json.dumps(listing.images)
        
        cursor.execute("""
            INSERT INTO listings (user_id, title, description, price, category, condition_type, location, images, seller_id)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
        """, (
            current_user['id'],
            listing.title,
            listing.description,
            listing.price,
            listing.category,
            listing.condition,
            listing.location,
            images_json,
            current_user['id']
        ))
        
        listing_id = cursor.lastrowid
        cursor.close()
        conn.close()
        
        return {"message": "Listing created successfully", "listing_id": listing_id}
    except Error as e:
        print(f"Error creating listing: {e}")
        raise HTTPException(status_code=500, detail="Failed to create listing")

@router.get("/api/listings/my", response_model=dict)
async def get_my_listings(current_user: dict = Depends(get_current_user)):
    """Get current user's listings"""
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        
        cursor.execute("""
            SELECT id, title, description, price, category, condition_type, location, 
                   images, status, created_at, updated_at
            FROM listings 
            WHERE user_id = %s
            ORDER BY created_at DESC
        """, (current_user['id'],))
        
        listings = cursor.fetchall()
        
        # Parse images JSON for each listing
        for listing in listings:
            if listing['images']:
                try:
                    import json
                    listing['images'] = json.loads(listing['images'])
                except (json.JSONDecodeError, TypeError):
                    listing['images'] = []
            else:
                listing['images'] = []
        
        cursor.close()
        conn.close()
        
        return {"listings": listings}
    except Error as e:
        print(f"Error getting listings: {e}")
        raise HTTPException(status_code=500, detail="Failed to get listings")

@router.put("/api/listings/{listing_id}", response_model=dict)
async def update_listing(listing_id: int, listing: ListingUpdate, current_user: dict = Depends(get_current_user)):
    """Update a listing"""
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Check if listing belongs to user
        cursor.execute("SELECT user_id FROM listings WHERE id = %s", (listing_id,))
        result = cursor.fetchone()
        
        if not result or result[0] != current_user['id']:
            raise HTTPException(status_code=403, detail="Not authorized to update this listing")
        
        # Build update query dynamically
        update_fields = []
        values = []
        
        for field, value in listing.dict(exclude_unset=True).items():
            if value is not None:
                if field == 'images':
                    update_fields.append(f"{field} = %s")
                    # Convert images list to JSON string for storage
                    import json
                    images_json = json.dumps(value) if value else None
                    values.append(images_json)
                elif field == 'condition':
                    # Map condition to condition_type in database
                    update_fields.append(f"condition_type = %s")
                    values.append(value)
                else:
                    update_fields.append(f"{field} = %s")
                    values.append(value)
        
        if not update_fields:
            raise HTTPException(status_code=400, detail="No fields to update")
        
        values.append(listing_id)
        query = f"UPDATE listings SET {', '.join(update_fields)} WHERE id = %s"
        
        cursor.execute(query, values)
        cursor.close()
        conn.close()
        
        return {"message": "Listing updated successfully"}
    except Error as e:
        print(f"Error updating listing: {e}")
        raise HTTPException(status_code=500, detail="Failed to update listing")

@router.delete("/api/listings/{listing_id}", response_model=dict)
async def delete_listing(listing_id: int, current_user: dict = Depends(get_current_user)):
    """Delete a listing"""
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Check if listing belongs to user
        cursor.execute("SELECT user_id FROM listings WHERE id = %s", (listing_id,))
        result = cursor.fetchone()
        
        if not result or result[0] != current_user['id']:
            raise HTTPException(status_code=403, detail="Not authorized to delete this listing")
        
        cursor.execute("DELETE FROM listings WHERE id = %s", (listing_id,))
        cursor.close()
        conn.close()
        
        return {"message": "Listing deleted successfully"}
    except Error as e:
        print(f"Error deleting listing: {e}")
        raise HTTPException(status_code=500, detail="Failed to delete listing")

# MESSAGES ENDPOINTS
@router.post("/api/messages", response_model=dict)
async def send_message(message: MessageCreate, current_user: dict = Depends(get_current_user)):
    """Send a message"""
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        cursor.execute("""
            INSERT INTO messages (sender_id, recipient_id, subject, content, listing_id)
            VALUES (%s, %s, %s, %s, %s)
        """, (
            current_user['id'],
            message.recipient_id,
            message.subject,
            message.content,
            message.listing_id
        ))
        
        message_id = cursor.lastrowid
        cursor.close()
        conn.close()
        
        return {"message": "Message sent successfully", "message_id": message_id}
    except Error as e:
        print(f"Error sending message: {e}")
        raise HTTPException(status_code=500, detail="Failed to send message")

@router.get("/api/messages/inbox", response_model=dict)
async def get_inbox(current_user: dict = Depends(get_current_user)):
    """Get received messages"""
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        
        cursor.execute("""
            SELECT m.id, m.subject, m.content, m.is_read, m.created_at,
                   u.name as sender_name, u.email as sender_email,
                   l.title as listing_title
            FROM messages m
            JOIN users u ON m.sender_id = u.id
            LEFT JOIN listings l ON m.listing_id = l.id
            WHERE m.recipient_id = %s
            ORDER BY m.created_at DESC
        """, (current_user['id'],))
        
        messages = cursor.fetchall()
        cursor.close()
        conn.close()
        
        return {"messages": messages}
    except Error as e:
        print(f"Error getting inbox: {e}")
        raise HTTPException(status_code=500, detail="Failed to get messages")

@router.get("/api/messages/sent", response_model=dict)
async def get_sent_messages(current_user: dict = Depends(get_current_user)):
    """Get sent messages"""
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        
        cursor.execute("""
            SELECT m.id, m.subject, m.content, m.created_at,
                   u.name as recipient_name, u.email as recipient_email,
                   l.title as listing_title
            FROM messages m
            JOIN users u ON m.recipient_id = u.id
            LEFT JOIN listings l ON m.listing_id = l.id
            WHERE m.sender_id = %s
            ORDER BY m.created_at DESC
        """, (current_user['id'],))
        
        messages = cursor.fetchall()
        cursor.close()
        conn.close()
        
        return {"messages": messages}
    except Error as e:
        print(f"Error getting sent messages: {e}")
        raise HTTPException(status_code=500, detail="Failed to get sent messages")

@router.put("/api/messages/{message_id}/read", response_model=dict)
async def mark_message_read(message_id: int, current_user: dict = Depends(get_current_user)):
    """Mark a message as read"""
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        cursor.execute("""
            UPDATE messages 
            SET is_read = TRUE 
            WHERE id = %s AND recipient_id = %s
        """, (message_id, current_user['id']))
        
        cursor.close()
        conn.close()
        
        return {"message": "Message marked as read"}
    except Error as e:
        print(f"Error marking message as read: {e}")
        raise HTTPException(status_code=500, detail="Failed to mark message as read")

# ORDERS ENDPOINTS
@router.post("/api/orders", response_model=dict)
async def create_order(order: OrderCreate, current_user: dict = Depends(get_current_user)):
    """Create a new order"""
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Get listing details
        cursor.execute("""
            SELECT user_id, price FROM listings 
            WHERE id = %s AND is_active = TRUE
        """, (order.listing_id,))
        
        listing = cursor.fetchone()
        if not listing:
            raise HTTPException(status_code=404, detail="Listing not found")
        
        seller_id, price = listing
        total_price = price * order.quantity
        
        cursor.execute("""
            INSERT INTO orders (buyer_id, seller_id, listing_id, quantity, total_price, 
                              shipping_address, payment_method)
            VALUES (%s, %s, %s, %s, %s, %s, %s)
        """, (
            current_user['id'],
            seller_id,
            order.listing_id,
            order.quantity,
            total_price,
            order.shipping_address,
            order.payment_method
        ))
        
        order_id = cursor.lastrowid
        cursor.close()
        conn.close()
        
        return {"message": "Order created successfully", "order_id": order_id}
    except Error as e:
        print(f"Error creating order: {e}")
        raise HTTPException(status_code=500, detail="Failed to create order")

@router.get("/api/orders/my", response_model=dict)
async def get_my_orders(current_user: dict = Depends(get_current_user)):
    """Get current user's orders"""
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        
        cursor.execute("""
            SELECT o.id, o.quantity, o.total_price, o.shipping_address, 
                   o.payment_method, o.`status`, o.created_at, o.updated_at,
                   l.title as listing_title, l.description as listing_description,
                   u.name as seller_name
            FROM orders o
            JOIN listings l ON o.listing_id = l.id
            JOIN users u ON o.seller_id = u.id
            WHERE o.buyer_id = %s
            ORDER BY o.created_at DESC
        """, (current_user['id'],))
        
        orders = cursor.fetchall()
        cursor.close()
        conn.close()
        
        return {"orders": orders}
    except Error as e:
        print(f"Error getting orders: {e}")
        raise HTTPException(status_code=500, detail="Failed to get orders")

@router.get("/api/orders/sales", response_model=dict)
async def get_sales_orders(current_user: dict = Depends(get_current_user)):
    """Get orders for user's listings (sales)"""
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        
        cursor.execute("""
            SELECT o.id, o.quantity, o.total_price, o.shipping_address, 
                   o.payment_method, o.`status`, o.created_at, o.updated_at,
                   l.title as listing_title, l.description as listing_description,
                   u.name as buyer_name
            FROM orders o
            JOIN listings l ON o.listing_id = l.id
            JOIN users u ON o.buyer_id = u.id
            WHERE o.seller_id = %s
            ORDER BY o.created_at DESC
        """, (current_user['id'],))
        
        orders = cursor.fetchall()
        cursor.close()
        conn.close()
        
        return {"orders": orders}
    except Error as e:
        print(f"Error getting sales orders: {e}")
        raise HTTPException(status_code=500, detail="Failed to get sales orders")

@router.put("/api/orders/{order_id}/status", response_model=dict)
async def update_order_status(order_id: int, status: str, current_user: dict = Depends(get_current_user)):
    """Update order status"""
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Check if user is the seller
        cursor.execute("""
            SELECT seller_id FROM orders WHERE id = %s
        """, (order_id,))
        
        result = cursor.fetchone()
        if not result or result[0] != current_user['id']:
            raise HTTPException(status_code=403, detail="Not authorized to update this order")
        
        cursor.execute("""
            UPDATE orders SET `status` = %s WHERE id = %s
        """, (status, order_id))
        
        cursor.close()
        conn.close()
        
        return {"message": "Order status updated successfully"}
    except Error as e:
        print(f"Error updating order status: {e}")
        raise HTTPException(status_code=500, detail="Failed to update order status")

# REVIEWS ENDPOINTS
@router.post("/api/reviews", response_model=dict)
async def create_review(review: ReviewCreate, current_user: dict = Depends(get_current_user)):
    """Create a review"""
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Get listing and seller info
        cursor.execute("""
            SELECT l.user_id, l.title FROM listings l WHERE l.id = %s
        """, (review.listing_id,))
        
        listing = cursor.fetchone()
        if not listing:
            raise HTTPException(status_code=404, detail="Listing not found")
        
        seller_id, listing_title = listing
        
        # Get order_id for this listing (assuming there's an order)
        cursor.execute("""
            SELECT id FROM orders 
            WHERE listing_id = %s AND buyer_id = %s
            ORDER BY created_at DESC LIMIT 1
        """, (review.listing_id, current_user['id']))
        
        order_result = cursor.fetchone()
        if not order_result:
            raise HTTPException(status_code=400, detail="No order found for this listing")
        
        order_id = order_result[0]
        
        cursor.execute("""
            INSERT INTO reviews (reviewer_id, reviewee_id, reviewed_user_id, order_id, rating, comment)
            VALUES (%s, %s, %s, %s, %s, %s)
        """, (
            current_user['id'],
            seller_id,
            seller_id,  # reviewed_user_id is the same as reviewee_id
            order_id,
            review.rating,
            review.comment
        ))
        
        review_id = cursor.lastrowid
        cursor.close()
        conn.close()
        
        return {"message": "Review created successfully", "review_id": review_id}
    except Error as e:
        print(f"Error creating review: {e}")
        raise HTTPException(status_code=500, detail="Failed to create review")

@router.get("/api/reviews/received", response_model=dict)
async def get_received_reviews(current_user: dict = Depends(get_current_user)):
    """Get reviews received by current user"""
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        
        cursor.execute("""
            SELECT r.id, r.rating, r.comment, r.created_at,
                   u.name as reviewer_name,
                   o.listing_id,
                   l.title as listing_title
            FROM reviews r
            JOIN users u ON r.reviewer_id = u.id
            JOIN orders o ON r.order_id = o.id
            JOIN listings l ON o.listing_id = l.id
            WHERE r.reviewee_id = %s OR r.reviewed_user_id = %s
            ORDER BY r.created_at DESC
        """, (current_user['id'], current_user['id']))
        
        reviews = cursor.fetchall()
        cursor.close()
        conn.close()
        
        return {"reviews": reviews}
    except Error as e:
        print(f"Error getting received reviews: {e}")
        raise HTTPException(status_code=500, detail="Failed to get reviews")

@router.get("/api/reviews/given", response_model=dict)
async def get_given_reviews(current_user: dict = Depends(get_current_user)):
    """Get reviews given by current user"""
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        
        cursor.execute("""
            SELECT r.id, r.rating, r.comment, r.created_at,
                   u.name as reviewee_name,
                   o.listing_id,
                   l.title as listing_title
            FROM reviews r
            JOIN users u ON r.reviewee_id = u.id
            JOIN orders o ON r.order_id = o.id
            JOIN listings l ON o.listing_id = l.id
            WHERE r.reviewer_id = %s
            ORDER BY r.created_at DESC
        """, (current_user['id'],))
        
        reviews = cursor.fetchall()
        cursor.close()
        conn.close()
        
        return {"reviews": reviews}
    except Error as e:
        print(f"Error getting given reviews: {e}")
        raise HTTPException(status_code=500, detail="Failed to get reviews")

# DASHBOARD STATS
@router.get("/api/dashboard/stats", response_model=dict)
async def get_dashboard_stats(current_user: dict = Depends(get_current_user)):
    """Get dashboard statistics"""
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Get counts
        cursor.execute("SELECT COUNT(*) FROM listings WHERE user_id = %s", (current_user['id'],))
        listings_count = cursor.fetchone()[0]
        
        cursor.execute("SELECT COUNT(*) FROM messages WHERE recipient_id = %s AND is_read = FALSE", (current_user['id'],))
        unread_messages = cursor.fetchone()[0]
        
        cursor.execute("SELECT COUNT(*) FROM orders WHERE buyer_id = %s", (current_user['id'],))
        orders_count = cursor.fetchone()[0]
        
        cursor.execute("SELECT COUNT(*) FROM orders WHERE seller_id = %s", (current_user['id'],))
        sales_count = cursor.fetchone()[0]
        
        cursor.execute("SELECT AVG(rating) FROM reviews WHERE reviewee_id = %s", (current_user['id'],))
        avg_rating = cursor.fetchone()[0] or 0
        
        cursor.close()
        conn.close()
        
        return {
            "listings_count": listings_count,
            "unread_messages": unread_messages,
            "orders_count": orders_count,
            "sales_count": sales_count,
            "average_rating": round(avg_rating, 2)
        }
    except Error as e:
        print(f"Error getting dashboard stats: {e}")
        raise HTTPException(status_code=500, detail="Failed to get dashboard statistics")

# PROFILE ENDPOINTS
class ProfileUpdate(BaseModel):
    name: str
    email: str

@router.put("/api/profile", response_model=dict)
async def update_profile(profile_data: ProfileUpdate, current_user: dict = Depends(get_current_user)):
    """Update user profile"""
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Check if email is already taken by another user
        cursor.execute("SELECT id FROM users WHERE email = %s AND id != %s", (profile_data.email, current_user['id']))
        existing_user = cursor.fetchone()
        
        if existing_user:
            raise HTTPException(status_code=400, detail="Email already taken by another user")
        
        # Update user profile
        cursor.execute("""
            UPDATE users 
            SET name = %s, email = %s, updated_at = CURRENT_TIMESTAMP
            WHERE id = %s
        """, (profile_data.name, profile_data.email, current_user['id']))
        
        # Get updated user data
        cursor.execute("""
            SELECT id, email, name, created_at, is_active 
            FROM users 
            WHERE id = %s
        """, (current_user['id'],))
        
        updated_user = cursor.fetchone()
        cursor.close()
        conn.close()
        
        if not updated_user:
            raise HTTPException(status_code=404, detail="User not found")
        
        return {
            "id": updated_user[0],
            "email": updated_user[1],
            "name": updated_user[2],
            "created_at": updated_user[3],
            "is_active": updated_user[4]
        }
    except Error as e:
        print(f"Error updating profile: {e}")
        raise HTTPException(status_code=500, detail="Failed to update profile")

@router.delete("/api/profile", response_model=dict)
async def delete_profile(current_user: dict = Depends(get_current_user)):
    """Delete user profile and all associated data"""
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Delete user and all associated data (CASCADE will handle related records)
        cursor.execute("DELETE FROM users WHERE id = %s", (current_user['id'],))
        
        cursor.close()
        conn.close()
        
        return {"message": "Profile deleted successfully"}
    except Error as e:
        print(f"Error deleting profile: {e}")
        raise HTTPException(status_code=500, detail="Failed to delete profile")
