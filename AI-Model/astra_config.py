import cassio
from config import ASTRA_DB_APPLICATION_TOKEN, ASTRA_DB_ID, ASTRA_DB_SECURE_BUNDLE_PATH, ASTRA_DB_KEYSPACE

# Initialize CassIO with Astra DB credentials
cassio.init(
    token=ASTRA_DB_APPLICATION_TOKEN,
    database_id=ASTRA_DB_ID,
    keyspace=ASTRA_DB_KEYSPACE,
    secure_connect_bundle=ASTRA_DB_SECURE_BUNDLE_PATH
)

USE_ASTRA_DB = True