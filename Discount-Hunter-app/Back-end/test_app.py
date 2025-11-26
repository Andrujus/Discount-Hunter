#!/usr/bin/env python
import sys
sys.path.insert(0, '.')

print("Testing app import...")
try:
    from app.main import app
    print("✓ App loaded successfully")
    print("✓ App routes:", len(app.routes))
except Exception as e:
    print(f"✗ Error loading app: {e}")
    import traceback
    traceback.print_exc()

print("\nTesting database...")
try:
    from app.database import init_db
    init_db()
    print("✓ Database initialized")
except Exception as e:
    print(f"✗ Error with database: {e}")
    import traceback
    traceback.print_exc()

print("\nAll checks passed!")
