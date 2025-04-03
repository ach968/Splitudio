from firebase_functions import https_fn
from utils.midi_extraction import mp3_midi_save

@https_fn.on_request(memory=512)
def mp3_to_midi(req: https_fn.Request) -> https_fn.Response:
    pass

mp3_midi_save("file1.mp3")    
    