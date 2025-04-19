# Welcome to Cloud Functions for Firebase for Python!
# To get started, simply uncomment the below code or create your own.
# Deploy with `firebase deploy`

from firebase_functions import https_fn
from firebase_admin import initialize_app

initialize_app()

# from youtube_mp3 import youtube_to_mp3
# from stripe_hooks import stripe_webhook
from mp3_midi import mp3_to_midi
# from register_project import register_project
# from demucs_stem_splitting import demucs_stem_splitting
