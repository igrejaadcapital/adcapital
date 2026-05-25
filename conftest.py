"""pytest — garante SQLite nos testes mesmo com DATABASE_URL no ambiente local."""
import os

os.environ.pop('DATABASE_URL', None)
