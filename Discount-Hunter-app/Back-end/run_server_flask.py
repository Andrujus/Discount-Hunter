"""Flask-based authentication server as alternative to FastAPI."""

from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import sys

# Add app directory to path
sys.path.insert(0, os.path.dirname(__file__))

# Import auth service from existing code
from app.services.auth import register_user, login_user, get_user_by_token

app = Flask(__name__)
CORS(app, resources={
    r"/api/*": {
        "origins": ["http://localhost:8081", "http://localhost:19006", "http://127.0.0.1:8081", "http://127.0.0.1:19006"],
        "allow_headers": ["Content-Type"],
        "methods": ["GET", "POST", "OPTIONS"]
    }
})

@app.route('/healthz', methods=['GET'])
def health_check():
    """Health check endpoint."""
    from datetime import datetime
    return jsonify({
        'status': 'ok',
        'timestamp': datetime.utcnow().isoformat()
    })

@app.route('/api/auth/register', methods=['POST'])
def register():
    """Register a new user."""
    try:
        data = request.get_json()
        user_data = register_user(
            email=data['email'],
            first_name=data['first_name'],
            last_name=data['last_name'],
            password=data['password']
        )
        return jsonify(user_data), 200
    except ValueError as e:
        return jsonify({'detail': str(e)}), 400
    except Exception as e:
        return jsonify({'detail': 'Registration failed'}), 500

@app.route('/api/auth/login', methods=['POST'])
def login():
    """Login a user."""
    try:
        data = request.get_json()
        user_data = login_user(
            email=data['email'],
            password=data['password']
        )
        return jsonify(user_data), 200
    except ValueError as e:
        return jsonify({'detail': str(e)}), 401
    except Exception as e:
        return jsonify({'detail': 'Login failed'}), 500

@app.route('/api/auth/me', methods=['GET'])
def get_current_user():
    """Get current user from token."""
    try:
        token = request.args.get('token')
        user = get_user_by_token(token)
        if not user:
            return jsonify({'detail': 'Invalid token'}), 401
        return jsonify(user), 200
    except Exception as e:
        return jsonify({'detail': 'Auth check failed'}), 500

if __name__ == '__main__':
    app.run(host='127.0.0.1', port=3000, debug=False)
