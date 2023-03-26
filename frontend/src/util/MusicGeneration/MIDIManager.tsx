import { MusicSettings } from "../Interfaces";
// import { getNoteData } from './Playback'
import {getMillisecondsFromBPM, findNumSamples} from './MusicHelperFunctions';
import * as Enums from '../Enums';
import * as Constants from '../Constants';
import { instrumentList } from "./InstOvertoneDefinitions";
import * as Tone from 'tone'


import MidiWriter from 'midi-writer-js';
import { time } from "console";

export class MIDIManager {
    // Settings
    private synthArr:Array<Tone.PolySynth<Tone.Synth<Tone.SynthOptions>>> = [];
    public MIDIChannels:MidiWriter.Track[] = [];
    private timeForEachNoteArray:Array<number>;
    public settings:MusicSettings
    private debugOutput:boolean;
    public MIDIURI:string;
    private stopFlag;
    
    constructor(settings:MusicSettings, timeForEachNoteArray:Array<number>) {
        this.MIDIURI = "";
        var channel0 = new MidiWriter.Track();
        var channel1 = new MidiWriter.Track();
        var channel2 = new MidiWriter.Track();
        var channel3 = new MidiWriter.Track();
        this.MIDIChannels.push(channel0, channel1, channel2, channel3)

        /*  This block initializes 4 more channels to write MIDI to in the case that
            we are using the cyton board, it does this by looking at the number of channels
            in the instrument setting since it is specific to the device. */
        // console.log(Object.keys(settings.deviceSettings.instruments))
        if((Object.keys(settings.deviceSettings.instruments).length) === 8) {
            var channel4 = new MidiWriter.Track();
            var channel5 = new MidiWriter.Track();
            var channel6 = new MidiWriter.Track();
            var channel7 = new MidiWriter.Track();
            this.MIDIChannels.push(channel4, channel5, channel6, channel7)
        }

        this.settings = settings;
        this.stopFlag = false;
        this.debugOutput = false;
        this.initializeSettings(settings);
        this.timeForEachNoteArray = timeForEachNoteArray;
        this.initializeSynth();
    }
    
    private initializeSynth() {
        Tone.getTransport().bpm.value = this.settings.bpm;

        for (var i = 0; i < 8; i++) {
            var res:Tone.PolySynth<Tone.Synth<Tone.SynthOptions>> = new Tone.PolySynth(Tone.Synth).toDestination();            
            this.synthArr.push(res);
        }
    }
    
    public initializeSettings(settings:MusicSettings) {
        
        /* This is just a start, we're going to work on a condition here
           where the number of tempos get set by the type of settings */
        for(var i = 0; i < this.MIDIChannels.length; i++) {
            this.MIDIChannels[i].setTempo(settings.bpm, 0);
            this.MIDIChannels[i].setTimeSignature(4, 4);
        } 
    }

    public returnMIDI() {
        var write = new MidiWriter.Writer(this.MIDIChannels);
        var base64String;

        try {
            base64String = write.base64();
        }
        catch(err) {
            base64String = "";
            console.error("Base64 conversion of MIDI FAILED!", err);
        }

        var prefix = "data:audio/midi;base64,"
        prefix = prefix.concat(base64String);
        return prefix;
    }

    /* This function is a helper in order to return the proper type to assign to the
       pitch in the MidiWriter. There may be a better solution to this in the future
       but for now it's practical to use this implementation */
    private definePitch(note:string, octave:number) {
        var pitch:MidiWriter.Pitch;
        switch(note) {
            case 'A':
                pitch = `A${octave}`;
                break;
            case 'A#':
                pitch = `A#${octave}`;
                break;
            case 'B':
                pitch = `B${octave}`;
                break;
            case 'C':
                pitch = `C${octave}`
                break;
            case 'C#':
                pitch = `C#${octave}`
                break;
            case 'D':
                pitch = `D${octave}`
                break;
            case 'D#':
                pitch = `D#${octave}`
                break;
            case 'E':
                pitch = `E${octave}`
                break;
            case 'F':
                pitch = `F${octave}`
                break;
            case 'F#':
                pitch = `F#${octave}`
                break;
            case 'G':
                pitch = `G${octave}`
                break;
            case 'G#':
                pitch = `G#${octave}`
                break;
            default:
                pitch = `A${octave}`
                break;
        }
        return pitch;
    }

    public convertInput(noteData:any[]) {
        for(var i = 0; i < noteData.length; i++) {
            var noteDuration:MidiWriter.Duration = '1';

            /* This code block sets the data from the note manager into usable data for
               the midi-writer-js API. */
            if (noteData[i].writer.noteLength === "sixteenth") noteDuration = '16';
            else if (noteData[i].writer.noteLength === "eigth") noteDuration = '8';
            else if (noteData[i].writer.noteLength === "quarter") noteDuration ='4';
            else if (noteData[i].writer.noteLength === "half") noteDuration = '2';
            else if (noteData[i].writer.noteLength === "whole") noteDuration = '1';
            var generatedNote;
            var pitch:MidiWriter.Pitch = this.definePitch(noteData[i].writer.note, noteData[i].writer.octave);

            if (noteData[i].writer.note === -1)  continue;// Rest
                // generatedNote = new MidiWriter.NoteEvent({wait: noteDuration, duration: noteDuration, pitch: pitch});
                // generatedNote = new MidiWriter.NoteEvent({pitch: pitch, duration: noteDuration});

            else {
                generatedNote = new MidiWriter.NoteEvent({pitch: pitch, duration: noteDuration});
                this.MIDIChannels[i].addEvent(generatedNote);
            }
        }
    }

    
    public async realtimeGenerate(noteData:any[]) {
       var instruments = this.settings.deviceSettings.instruments;
       var instrumentsArr = [];

       var durations = this.settings.deviceSettings.durations;
       var durationsArr:Array<number> = [];

       // Convert instruments to array
       let inst: keyof typeof instruments;
       for (inst in instruments) {
         instrumentsArr.push(instruments[inst]);
       }

       let dur: keyof typeof durations;
       for (dur in durations) {
         durationsArr.push(durations[dur]);
       }
        
        /*  This for loop is where feedback is actually sent to the speakers of the computer, we're using Tone.js to send
            a synth as output. The way this is done is through an array of tones for each channel, this is so that we can make
            sure no channel is going to be overlapped by a new input. This essentially works by checking to see if the channel is
            playing a sound through the activeVoices value, if it's equal to 1 then it's playing a sound so we only fire the call
            when it's 0. The triggerAttackRelease function takes in the values of notes, duration, and time. Hence the switch case
            the frequency we provide it is the note value. */
            
        for(let i = 0; i < noteData.length; i++) {
            var playerInfo = noteData[i].player;

            // Setup for their vars
            var soundType = instrumentsArr[i];
            var duration = durationsArr[i];
            var amplitude = playerInfo.amplitude;
            var frequency = playerInfo.noteFrequency;

            if(frequency === undefined) continue;

            /*
                * The duration lengths are defined in https://github.com/Tonejs/Tone.js/blob/641ada9/Tone/core/type/Units.ts#L53.
                * To add more values in the future just reference the above link and add to the enums in '../Enums.tsx'.
                * If you want to add frequencies, you can define them either in basic terms like 'B3' or use a numeric value,
                * because we want a more specific sound we are using numerics.
                * We also attempt to offset the following note by the ms equivalient of the current note len.
            */

            switch(duration) {
                case Enums.NoteDurations.WHOLE:

                    if (this.synthArr[i].activeVoices < 1) this.synthArr[i].triggerAttackRelease(frequency, "1n", this.synthArr[i].now())        
                    break;
                case Enums.NoteDurations.HALF:

                    if (this.synthArr[i].activeVoices < 1) this.synthArr[i].triggerAttackRelease(frequency, "2n", this.synthArr[i].now())        
                    break;
                case Enums.NoteDurations.QUARTER:

                    if (this.synthArr[i].activeVoices < 1) this.synthArr[i].triggerAttackRelease(frequency, "4n", this.synthArr[i].now())        
                    break;
                case Enums.NoteDurations.EIGHTH:

                    if (this.synthArr[i].activeVoices < 1) this.synthArr[i].triggerAttackRelease(frequency, "8n", this.synthArr[i].now())        
                    break;
                case Enums.NoteDurations.SIXTEENTH:

                    if (this.synthArr[i].activeVoices < 1) this.synthArr[i].triggerAttackRelease(frequency, "16n", this.synthArr[i].now())        
                    break;
                default:
                    break;
                }
                console.log("num Voices for ", i, ": ", this.synthArr[i].activeVoices);
            
       }
       

    }

    private getNoteData(soundType:number, freq:number, amplitude:number, ctx:any, noteLength:number) {
        var buffer; // Local buffer variable.

        // For each supported sound type we call the correct function.
        if (soundType === Enums.InstrumentTypes.SINEWAVE) {
            buffer = this.generateSineWave(findNumSamples(this.timeForEachNoteArray[noteLength]), freq, amplitude, ctx);
        }
        else if (soundType === Enums.InstrumentTypes.TRIANGLEWAVE) {
            buffer = this.generateTriangleWave(findNumSamples(this.timeForEachNoteArray[noteLength]), freq, amplitude, ctx);
        }
        else if (soundType === Enums.InstrumentTypes.SQUAREWAVE) {
            buffer = this.generateSquareWave(findNumSamples(this.timeForEachNoteArray[noteLength]), freq, amplitude, ctx);
        }
        else {
            buffer = this.generateInstrumentWave(findNumSamples(this.timeForEachNoteArray[noteLength]), freq, ctx, soundType);
        }

        return buffer;
    }

    private generateSineWave(numSamples:number, frequency:number, amplitude:number, ctx:any) {
        let PI_2 = Math.PI * 2;

        // Create the buffer for the node.
        let buffer = ctx.createBuffer(1, numSamples, Constants.sampleRate);
    
        // Create the buffer into which the audio data will be placed.
        let buf = buffer.getChannelData(0);
    
        // Loop numSamples times -- that's how many samples we will calculate and store.
        for (let i = 0; i < numSamples; i++) {
            // Calculate and store the value for this sample.
            buf[i] = Math.sin(frequency * PI_2 * i / Constants.sampleRate) * amplitude;
        }
    
        // Return the channel buffer.
        return buffer;
    }

    private generateTriangleWave(numSamples:number, frequency:number, amplitude:number, ctx:any) {

        // Here we calculate the number of samples for each wave oscillation.
        var samplesPerOscillation = Constants.sampleRate / frequency;
        // This is the first quarter of the oscillation. 0 - 1/4
        var first = samplesPerOscillation / 4;
        // This is the second quarter of the oscillation. 1/4 - 1/2
        var second = samplesPerOscillation / 2;
        // This is the third quarter of the oscillation. 1/2 - 3/4
        var third = (samplesPerOscillation / 2) + (samplesPerOscillation / 4);
        // We will count the samples as we go.
        var counter = 0;
    
        // Step value. This is how much the sample value changes per sample.
        var step = 1 / first;
    
        // Create the buffer for the node.
        var buffer = ctx.createBuffer(1, numSamples, Constants.sampleRate);
    
        // Create the buffer into which the audio data will be placed.
        var buf = buffer.getChannelData(0);
    
        // Loop numSamples times -- that's how many samples we will calculate and store.
        for (var i = 0; i < numSamples; i++) {
            // Increment the counter.
            counter++;
    
            // See if this is the first quarter.
            if (counter <= first) {
                // Store the value.
                buf[i] = step * counter * amplitude;
            }
            // See if this is the second quarter.
            else if (counter <= second) {
                // We want the count relative to this quarter.
                var cnt = counter - first;
    
                // Store the value.
                buf[i] = 1 - step * cnt * amplitude;
            }
            // See if this is the third quarter.
            else if (counter <= third) {
                // We want the count relative to this quarter.
                var cnt = counter - second;
    
                // Store the value.
                buf[i] = -(step * cnt) * amplitude;
            }
            // This is the fourth quarter.
            else {
                // We want the count relative to this quarter.
                var cnt = counter - third;
    
                // Store the value.
                buf[i] = -1 + (step * cnt) * amplitude;
    
                // See if we are done with this cycle.
                if (counter >= samplesPerOscillation) {
                    // Set to zero so we are ready for another cycle.
                    counter = 0;
                }
            }
        }
        return buffer;
    }

    private generateSquareWave(numSamples:number, frequency:number, amplitude:number, ctx:any) {

        // Here we calculate the number of samples for each wave oscillation.
        var samplesPerOscillation = Constants.sampleRate / frequency;
        // Create the value for the first oscillation change.
        var first = samplesPerOscillation / 2;
        // We will count the samples as we go.
        var counter = 0;
    
        // Create the buffer for the node.
        var buffer = ctx.createBuffer(1, numSamples, Constants.sampleRate);
    
        // Create the buffer into which the audio data will be placed.
        var buf = buffer.getChannelData(0);
    
        // Loop numSamples times -- that's how many samples we will calculate and store.
        for (var i = 0; i < numSamples; i++) {
            // Increment the counter.
            counter++;
    
            // This is the first half of the oscillation. it should be 1.
            if (counter <= first) {
                // Store the value.
                buf[i] = 1 * amplitude;
            }
            // This is the second half of the oscillation. It should be -1.
            else {
                // Store the value.
                buf[i] = -1 * amplitude;
    
                // See if we are done with this cycle.
                if (counter >= samplesPerOscillation) {
                    // Set to zero so we are ready for another cycle.
                    counter = 0;
                }
            }
        }
    
        // Return the channel buffer.
        return buffer;
    }

    private generateInstrumentWave(numSamples:number, frequency:number, ctx:any, soundType:number) {    

        // Get the instrument specs.
        let inst = this.getOvertoneFrequencies(soundType, frequency);
    
        // Precalculate 2PI
        let PI_2 = Math.PI * 2;
    
        // Create the buffer for the node.
        let buffer = ctx.createBuffer(1, numSamples, Constants.sampleRate);
    
        // Create the buffer into which the audio data will be placed.
        var buf = buffer.getChannelData(0);
    
        // Zero the buffer
        for (var i = 0; i < numSamples; i++) {
            buf[i] = 0;
        }
    
        // Loop through the instrument spec.
        for (var j = 0; j < inst.length / 2; j++) {
            // Get the frequency multiplier from the data array.
            var f = frequency * inst[j * 2];
            //console.log("f: ", f, ", which is ", frequency, " times ", inst[j*2])
            // Get the amplitude value from the data array.
            var a = inst[j * 2 + 1];
            //console.log("a: ", a)
            // Loop numSamples times -- that's how many samples we will calculate and store.
            for (var i = 0; i < numSamples; i++) {
                // Calculate and store the value for this sample.
                buf[i] += (Math.sin(f * PI_2 * i / Constants.sampleRate) * a);
                //buf[i] = frequency;
            }
        }
    
        // Return the channel buffer.
        return buffer;
    }

    private getOvertoneFrequencies(instrumentIndex:number, frequency:number) {
        // Get the list of note amplitude values for this instrument.
        let list = instrumentList[instrumentIndex];
        // We will start with a default value.
        let index = 0;
        //console.log("frequency : " + frequency, ", list: " + list + ", instrumentIndex: " + instrumentIndex);
        let diff = Math.abs(frequency - list[0][0]);
    
        // Loop through the list of frequencies/amplitudes and find the closest match.
        for (let i = 1; i < list.length; i++) {
            // Get the difference between incoming frequency value and the frequeny of this list element.
            let td = Math.abs(frequency - list[i][0]);
    
            // If this is less (we are closer to the specified frequency) then we record the index and remember the new difference.
            if (td < diff) {
                diff = td;
                index = i;
            }
        }
    
        // Here we take the current array and make a new array to return.
        let retList = [];
        for (let i = 1; i < list[index].length; i++) {
            retList.push(i); // Push the harmonic number.
            retList.push(list[index][i]); // Push the amplitude.
        }
    
        return retList;
    }

    public setStopFlag() {
        this.stopFlag = true;
    }

    public setDebugOutput(b:boolean){
        this.debugOutput = b;
    }

}