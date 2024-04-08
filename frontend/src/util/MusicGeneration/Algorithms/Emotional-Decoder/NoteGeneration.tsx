import {getNoteLengthStringFromInt, getMillisecondsFromBPM, GetFloorOctave, getFrequencyFromNoteOctaveString} from '../../MusicHelperFunctions';

// import {initMIDIWriter, addNoteToMIDITrack, printTrack, generateMIDIURIAndDownloadFile, generateMIDIURI, generateMIDIFileFromURI} from '../MusicGeneration/MIDIWriting';
import * as Constants from '../../../Constants';
import { CytonSettings, GanglionSettings, MusicSettings, DataStream8Ch, DataStream4Ch } from '../../../Interfaces';
import { KeyGroups, Keys } from '../../../Enums';
import { MIDIManager } from './MIDIManager';
import { TDebugOptionsObject } from '../../../Types';
import { EmotionDecoder } from './EmotionDecoder';
import { AbstractNoteHandler } from '../AbstractNoteHandler';
import * as fs from 'fs';

/* This abstract class contains all named functions that must be implemented in your new notehandler class
for any new music generation algorithm.*/
function readMidiFile(filePath: string): Promise<Uint8Array> {
    return new Promise((resolve, reject) => {
        fs.readFile(filePath, (err, data) => {
            if (err) {
                reject(err);
            } else {
                const uint8Array = new Uint8Array(data);
                resolve(uint8Array);
            }
        });
    });
}

async function getMidiData(filePath: string): Promise<Uint8Array> {
    try {
        const midiData = await readMidiFile(filePath);
        return midiData;
    } catch (error) {
        console.error('Error reading MIDI file:', error);
        throw error;
    }
}
export class NoteHandler extends AbstractNoteHandler 
{

    protected stopFlag:boolean = false;
    private decoder = new EmotionDecoder();

    public originalNoteGeneration = async (EEGdataObj: DataStream8Ch | DataStream4Ch, /*instrument:number, noteType:number, noteVolume:number, numNotes:number*/) => {
        if (this.stopFlag) {
            console.log('stopped');
            return;
        }
    }

    
    public midiGenerator(){
        return "frontend/src/util/MusicGeneration/Algorithms/Emotional-Decoder/midi/fake.MID";
    }

    public returnMIDI(): Promise<Uint8Array> {
        const path = this.midiGenerator()
        return getMidiData(path);
        //return ; //return midi
    }

    public setDebugOutput(b: boolean)
    {
        this.debugOutput = b;
        if (this.debugOutput) console.log("Setting Notehandler debug to ", b);
    }

    public setStopFlag()
    {
        this.stopFlag = true;
    }

}