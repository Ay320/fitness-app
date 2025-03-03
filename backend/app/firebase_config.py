# initialise Firebase

import firebase_REMOVED
from firebase_REMOVED import credentials, auth
from config.settings import settings

# Load Firebase Admin SDK credentials
cred = credentials.Certificate(settings.FIREBASE_CREDENTIALS)
firebase_REMOVED.initialize_app(cred)

