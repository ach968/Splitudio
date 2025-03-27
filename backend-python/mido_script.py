from mido import MidiFile, MidiTrack
from mido.midifiles.midifiles import *

def test_mido():
    mid = MidiFile("output/output.mid")

    ticks_per_beat = mid.ticks_per_beat # assumes BPM=120
    track = mid.tracks[0]
    print(track)
    print(ticks_per_beat)
    pass


if __name__ == "__main__":
    test_mido()
