import os
import psycopg2
from psycopg2 import OperationalError, IntegrityError
from flask import current_app

def get_db_connection():
    """Create and return a PostgreSQL database connection"""
    try:
        conn = psycopg2.connect(
            host=os.getenv('DB_HOST'),
            database=os.getenv('DB_NAME'),
            user=os.getenv('DB_USER'),
            password=os.getenv('DB_PASSWORD')
        )
        return conn
    except OperationalError as e:
        current_app.logger.error(f"Database connection error: {e}")
        return None