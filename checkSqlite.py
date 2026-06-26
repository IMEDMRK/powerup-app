import sqlite3
try:
    conn = sqlite3.connect('prisma/dev.db')
    cursor = conn.cursor()
    cursor.execute('SELECT COUNT(*) FROM User')
    users = cursor.fetchone()[0]
    cursor.execute('SELECT COUNT(*) FROM "Order"')
    orders = cursor.fetchone()[0]
    print(f"SQLite Users: {users}")
    print(f"SQLite Orders: {orders}")
except Exception as e:
    print("Error:", e)
