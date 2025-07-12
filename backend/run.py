import uvicorn
import os
import subprocess
import sys
from app.database import init_db, engine
from sqlalchemy import text

def setup_database():
    print("Setting up database...")
    try:
        init_db()
        
        with engine.connect() as conn:
            result = conn.execute(text("SELECT COUNT(*) FROM users"))
            user_count = result.fetchone()[0]
            
            if user_count == 0:
                print("Seeding database with initial data...")
                with open("seed.sql", "r") as f:
                    sql_commands = f.read()
                
                for command in sql_commands.split(';'):
                    command = command.strip()
                    if command:
                        conn.execute(text(command))
                conn.commit()
                print("Database seeded successfully!")
            else:
                print("Database already contains data, skipping seed.")
                
    except Exception as e:
        print(f"Database setup error: {e}")
        sys.exit(1)

def main():
    print("Starting Skill Swap Backend...")
    
    setup_database()
    
    print("Starting FastAPI server...")
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )

if __name__ == "__main__":
    main()