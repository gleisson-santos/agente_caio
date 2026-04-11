import os
import csv
import sqlite3

DIR = r"C:\Users\gdesi\Desktop\Agente_caio\Export_TI"
DB_PATH = os.path.join(DIR, "backup_supabase.db")
SQL_PATH = os.path.join(DIR, "backup_supabase.sql")

# Remove existing to recreate
if os.path.exists(DB_PATH):
    os.remove(DB_PATH)

conn = sqlite3.connect(DB_PATH)
cursor = conn.cursor()

csv_files = [f for f in os.listdir(DIR) if f.endswith('.csv')]

for file in csv_files:
    table_name = os.path.splitext(file)[0]
    file_path = os.path.join(DIR, file)
    
    with open(file_path, 'r', encoding='utf-8') as f:
        reader = csv.reader(f)
        try:
            headers = next(reader)
        except StopIteration:
            continue  # empty file
            
        if not headers:
            continue
            
        # Create columns (all TEXT for simplicity, as we lack the exact Supabase schema)
        # Replacing empty or invalid header names
        clean_headers = []
        for i, h in enumerate(headers):
            clean_h = "".join(c for c in h if c.isalnum() or c == '_')
            if not clean_h:
                clean_h = f"col_{i}"
            clean_headers.append(clean_h)
            
        cols_def = ", ".join([f'"{h}" TEXT' for h in clean_headers])
        create_stmt = f'CREATE TABLE IF NOT EXISTS "{table_name}" ({cols_def});'
        cursor.execute(create_stmt)
        
        # Insert data
        placeholders = ", ".join(["?"] * len(clean_headers))
        insert_stmt = f'INSERT INTO "{table_name}" VALUES ({placeholders});'
        
        for row in reader:
            # Pad with None if row is shorter than headers
            if len(row) < len(clean_headers):
                row.extend([None] * (len(clean_headers) - len(row)))
            # Truncate if row is longer
            elif len(row) > len(clean_headers):
                row = row[:len(clean_headers)]
            cursor.execute(insert_stmt, row)

conn.commit()

# Export to SQL text file
with open(SQL_PATH, 'w', encoding='utf-8') as f:
    for line in conn.iterdump():
        f.write('%s\n' % line)

conn.close()

print(f"Sucesso! Banco gerado em {DB_PATH}")
print(f"Arquivo SQL gerado em {SQL_PATH}")
