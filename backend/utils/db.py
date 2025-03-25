import os
import psycopg2
from psycopg2 import OperationalError, IntegrityError
from flask import current_app

def get_db_connection():
    """Create and return a PostgreSQL database connection"""
    try:
        conn = psycopg2.connect(
            host="ep-winter-salad-a4avgzam-pooler.us-east-1.aws.neon.tech",
            user="neondb_owner",
            password="npg_lwuQ9aCbVRg4",
            database="coffee_tracker",
            port=5432
        )
        return conn
    except OperationalError as e:
        current_app.logger.error(f"Database connection error: {e}")
        return None