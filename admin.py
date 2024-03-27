from flask import Flask, request, jsonify
from flask_mysqldb import MySQL
from flask_cors import CORS
from datetime import datetime

app = Flask(__name__)
CORS(app, supports_credentials=True)

app.config['MYSQL_HOST'] = 'localhost'
app.config['MYSQL_USER'] = 'c'
app.config['MYSQL_PASSWORD'] = 'connie123'
app.config['MYSQL_DB'] = 'facia'

mysql = MySQL(app)

@app.route('/')
def home():
    return "Welcome to the Admin Panel!"

@app.route('/admin')
def admin():
    try:
        cur = mysql.connection.cursor()

        cur.execute("SELECT * FROM access_logs")
        access_logs = cur.fetchall()

        cur.close()

        return jsonify(access_logs)

    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/log_access', methods=['POST'])
def log_access():
    try:
        data = request.get_json()
        user_id = data['user_id']
        status = data['status']

        cur = mysql.connection.cursor()
        cur.execute("INSERT INTO access_logs (user_id, time_accessed, status) VALUES (%s, %s, %s)",
                    (user_id, datetime.now(), status))
        mysql.connection.commit()
        cur.close()

        return jsonify({'message': 'Access logged successfully'}), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(port=5004, debug=True)

