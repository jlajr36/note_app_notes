import os
import sqlite3

def get_script_dir():
    return os.path.dirname(os.path.abspath(__file__))

def db_path_build():
    return os.path.join(get_script_dir(), db_name)

def execute_sql(db_path, sql, params=(), fetch=False):
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    cursor.execute(sql, params)
    result = None
    if fetch:
        result = cursor.fetchall()
    else:
        conn.commit()
    conn.close()
    return result

db_name = "notes.db"
db_path = db_path_build()

state = 3

# create db and table
if state == 1:
    sql = '''
    CREATE TABLE IF NOT EXISTS notes (
        id INTEGER PRIMARY KEY,
        title TEXT NOT NULL,
        content TEXT NOT NULL,
        color TEXT NOT NULL
    );
    '''
    execute_sql(db_path, sql)

# insert data
if state == 2:
    sql = '''
    INSERT INTO notes (id, title, content, color)
    VALUES (?, ?, ?, ?)
    '''
    note = (1, "Blank Note", "This is a note", "color-green")
    execute_sql(db_path, sql, params=note)

# list all notes
if state == 3:
    sql = 'SELECT * FROM notes'
    rows = execute_sql(db_path, sql, fetch=True)
    print("All Notes:")
    for row in rows:
        print(f"ID: {row[0]}, Title: {row[1]}, Content: {row[2]}, Color: {row[3]}")

# upate note
if state == 4:
    sql = '''
    UPDATE notes
    SET title = ?, content = ?, color = ?
    WHERE id = ?
    '''
    update_data = ("New cool tiltle", "New Content", "color-pink", 1)
    execute_sql(db_path, sql, params=update_data)

# delete note
if state == 5:
    sql = 'DELETE FROM notes WHERE id = ?'
    delete_key = (1,)
    execute_sql(db_path, sql, params=delete_key)
