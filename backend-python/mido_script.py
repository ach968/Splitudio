import mido


def test_mido():
    mid = mido.MidiFile("output/output.mid")

    ticks_per_beat = mid.ticks_per_beat
    
    print(ticks_per_beat)
    pass


if __name__ == "__main__":
    test_mido()
