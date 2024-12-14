import sqlite3
import sys

class DatabaseHelper:
    def __init__(self, db_name, table_name):
        """
        Initialize the database connection and table name.
        """
        self.db_name = db_name
        self.table_name = table_name
        self.conn = sqlite3.connect(self.db_name)
        self.cursor = self.conn.cursor()

    def fetch_all_rows(self):
        """
        Fetch all rows from the specified table.
        """
        self.cursor.execute(f"SELECT * FROM {self.table_name}")
        return self.cursor.fetchall()

    def fetch_row_by_id(self, row_id):
        """
        Fetch a specific row by ID from the specified table.
        """
        self.cursor.execute(f"SELECT * FROM {self.table_name} WHERE id = ?", (row_id,))
        return self.cursor.fetchone()
    
    def add_create_token_by_mail(self, email, new_value):
        """
        Update a specific column in a row identified by email.
        """
        # first fetch the current value
        self.cursor.execute(f"SELECT remaining_create_tokens FROM {self.table_name} WHERE email = ?", (email,))
        current_value = self.cursor.fetchone()[0]
        new_value = int(current_value) + int(new_value)
        self.cursor.execute(
            f"UPDATE {self.table_name} SET remaining_create_tokens = ? WHERE email = ?", (new_value, email)
        )
        self.conn.commit()

    def fetch_row_by_email(self, email):
        """
        Fetch a specific row by email from the specified table.
        """
        self.cursor.execute(f"SELECT * FROM {self.table_name} WHERE email = ?", (email,))
        return self.cursor.fetchone()
    
    def get_user_id_by_email(self, email):
        """
        Fetch user ID by email and return just the ID number.
        Returns None if user not found.
        """
        self.cursor.execute(f"SELECT id FROM {self.table_name} WHERE email = ?", (email,))
        result = self.cursor.fetchone()
        return result[0] if result else None

    def update_column_by_id(self, column_name, new_value, row_id):
        """
        Update a specific column in a row identified by ID.
        """
        self.cursor.execute(
            f"UPDATE {self.table_name} SET {column_name} = ? WHERE id = ?", (new_value, row_id)
        )
        self.conn.commit()

    def delete_row_by_id(self, row_id):
        """
        Delete a specific row by ID from the specified table.
        """
        self.cursor.execute(f"DELETE FROM {self.table_name} WHERE id = ?", (row_id,))
        self.conn.commit()

    def add_column(self, column_name, column_type="TEXT"):
        """
        Add a new column to the specified table.
        """
        self.cursor.execute(f"ALTER TABLE {self.table_name} ADD COLUMN {column_name} {column_type}")
        self.conn.commit()

    def close_db(self):
        """
        Close the database connection.
        """
        self.conn.close()

helper = DatabaseHelper("users.db", "user")
if len(sys.argv) == 1:
    user_list = helper.fetch_all_rows()
    for user in user_list:
        print(user, end="\n\n")

    helper.close_db()
    sys.exit()


mail = sys.argv[1]
token = sys.argv[2]

helper.add_create_token_by_mail(mail, token)

print(helper.fetch_row_by_email(mail))

helper.close_db()