import MidiPlayer from 'midi-player-js';

let Player = new MidiPlayer.Player(function(event){
    console.log(event);
});

Player.loadFile('./output/test.mid');
Player.play();
