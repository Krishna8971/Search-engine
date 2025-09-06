#!/usr/bin/env python3
"""
Test cart functionality with authentication
"""

import requests
import json

BASE_URL = "http://localhost:8000"

def register_and_login():
    """Register a test user and login to get token"""
    print("Registering test user...")
    
    # Register user
    register_data = {
        "name": "Test User",
        "email": "test@example.com",
        "password": "testpassword123"
    }
    
    try:
        response = requests.post(f"{BASE_URL}/api/register", json=register_data)
        print(f"Registration: {response.status_code}")
        if response.status_code == 200:
            print("User registered successfully")
        elif response.status_code == 400:
            print("User already exists, continuing...")
    except Exception as e:
        print(f"Registration error: {e}")
    
    # Login
    login_data = {
        "email": "test@example.com",
        "password": "testpassword123"
    }
    
    try:
        response = requests.post(f"{BASE_URL}/api/login", json=login_data)
        if response.status_code == 200:
            data = response.json()
            token = data.get('access_token')
            print(f"Login successful, token: {token[:20]}...")
            return token
        else:
            print(f"Login failed: {response.status_code} - {response.text}")
            return None
    except Exception as e:
        print(f"Login error: {e}")
        return None

def test_cart_with_auth(token):
    """Test cart endpoints with authentication"""
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }
    
    print("\nTesting cart endpoints with authentication...")
    
    # Test get cart (should be empty initially)
    try:
        response = requests.get(f"{BASE_URL}/api/cart", headers=headers)
        print(f"GET /api/cart: {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            print(f"Cart items: {len(data.get('cart_items', []))}")
            print(f"Cart summary: {data.get('summary', {})}")
    except Exception as e:
        print(f"GET /api/cart error: {e}")
    
    # Test cart count
    try:
        response = requests.get(f"{BASE_URL}/api/cart/count", headers=headers)
        print(f"GET /api/cart/count: {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            print(f"Cart count: {data}")
    except Exception as e:
        print(f"GET /api/cart/count error: {e}")
    
    # Test add to cart (this will fail if no listings exist)
    try:
        response = requests.post(f"{BASE_URL}/api/cart/add", 
                               json={"listing_id": 1, "quantity": 1},
                               headers=headers)
        print(f"POST /api/cart/add: {response.status_code}")
        if response.status_code != 200:
            print(f"Add to cart error: {response.text}")
    except Exception as e:
        print(f"POST /api/cart/add error: {e}")

def test_listings():
    """Test if listings exist"""
    print("\nTesting listings...")
    try:
        response = requests.get(f"{BASE_URL}/api/listings")
        print(f"GET /api/listings: {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            listings = data.get('listings', [])
            print(f"Found {len(listings)} listings")
            if listings:
                print(f"First listing ID: {listings[0].get('id')}")
        else:
            print(f"Listings error: {response.text}")
    except Exception as e:
        print(f"Listings error: {e}")

if __name__ == "__main__":
    print("Cart Functionality Test with Authentication")
    print("=" * 50)
    
    # Test if server is running
    try:
        response = requests.get(f"{BASE_URL}/")
        print(f"Server status: {response.status_code}")
    except Exception as e:
        print(f"Server not running: {e}")
        exit(1)
    
    # Test listings first
    test_listings()
    
    # Get auth token
    token = register_and_login()
    if token:
        test_cart_with_auth(token)
    else:
        print("Failed to get authentication token")
