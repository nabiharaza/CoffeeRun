import os
import psycopg2
from psycopg2 import extras
from psycopg2 import OperationalError, IntegrityError
from flask import current_app
import logging

# def create_connection():
#     """Create and return a PostgreSQL database connection"""
#     try:
#         logging.info("Creating database connection")
#         #Remote Connetion
#         # conn = psycopg2.connect(
#         #     host="ep-winter-salad-a4avgzam-pooler.us-east-1.aws.neon.tech",
#         #     user="neondb_owner",
#         #     password="npg_lwuQ9aCbVRg4",
#         #     database="coffee_tracker",
#         #     port=5432
#         # )
#
#         #Docker Connection
#         # conn = psycopg2.connect(
#         #     dbname=os.getenv("DB_NAME", ""),
#         #     user=os.getenv("DB_USER", ""),
#         #     password=os.getenv("DB_PASSWORD", ""),
#         #     host=os.getenv("DB_HOST", ""),
#         #     port=os.getenv("DB_PORT", "5432")
#         # )
#         # return conn
#
#     # Local Connection
#         conn = psycopg2.connect(
#             dbname="coffee_tracker",
#             user="nabiharaza",
#             password="",
#             host="127.0.0.1",
#             port="5432",
#         )
#         return conn
#     except OperationalError as e:
#         current_app.logger.error(f"Database connection error: {e}")
#         return None


def create_connection():
    """Create and return a PostgreSQL database connection and cursor"""
    try:
        logging.info("Creating database connection")
        conn = psycopg2.connect(
            dbname="coffee_tracker",
            user="nabiharaza",
            password="",
            host="127.0.0.1",
            port="5432",
        )

        # conn = psycopg2.connect(
        #     dbname=os.getenv("DB_NAME", ""),
        #     user=os.getenv("DB_USER", ""),
        #     password=os.getenv("DB_PASSWORD", ""),
        #     host=os.getenv("DB_HOST", ""),
        #     port=os.getenv("DB_PORT", "5432"))
        cursor = conn.cursor(cursor_factory=extras.DictCursor)  # Create cursor here
        return conn, cursor  # Return both
    except OperationalError as e:
        current_app.logger.error(f"Database connection error: {e}")
        return None, None  # Return None for both if fails

def close_connection(connection, cursor):
    """Close the connection and cursor."""
    if cursor:
        cursor.close()
    if connection:
        connection.close()
    logging.info("Connection closed!")
