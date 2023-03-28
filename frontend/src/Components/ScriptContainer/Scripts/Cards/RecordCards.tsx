import { useState } from 'react';
import { Modal } from 'react-bootstrap';
import { useRecoilValue, useRecoilState } from 'recoil';
import { userJWT, userModeState } from '../../../../JWT';
import { useAppSelector } from '../../../../Redux/hooks';
import CardCarousel from '../../../CardCarousel/CardCarousel';
import UploadTrackModal from '../../../UploadTrackModal/UploadTrackModal';
import { User } from '../../../../util/Interfaces';

import { Track } from '../../../../util/Interfaces';

// Import CSS
import './RecordCards.css'

const RecordCards = () => {
    
    const [user, setUser] = useRecoilState(userModeState);
    const [userMode, setUserMode] = useRecoilState(userModeState);
    const jwt = useRecoilValue(userJWT);

    // Toggles Record and Stop button when recording
    const [recordVisibility, setRecordVisibility] = useState(true);
    const [show, setShow] = useState(false);
    const handleClose = () => setShow(false);

    // For collecting image from Redux
    const scriptCards = useAppSelector(state => state.cardArraySlice);

    function setVisibilityButton() {
        setRecordVisibility(!recordVisibility);
    }

    const defaultImage = 'https://cdn.discordapp.com/attachments/1022862908012634172/1028025868175540355/DALLE_2022-10-07_15.27.09_-_A_brain_listening_music_eyes_open_smiling_vector_art.png';

    const emptyTrack:Track = {
        "createdAt": "",    // auto generated by db
        "id": "",           // auto generated by db
        "likeCount": 0,
        "midi": "",
        "public": false,
        "thumbnail": defaultImage,
        "title": "",
        "userID": user?.id || "",
        "fullname": user?.firstName || ""
    }

    // const [currentTrack, setCurrentTrack] = useState<Track>(emptyTrack);
    function showEditTrackInfo() {

        console.log("user: ", user);

        setShow(true);
     }
    // ======================================================

    return (
        <div className='container' id='record-track-container'>
            <Modal id='pop-up' show={show} onHide={handleClose}>
                <UploadTrackModal track={emptyTrack}/>
            </Modal>
            <div>
                <div id='record-track-info-div'>
                    <div id='display-record-card-div'>
                        Displaying Cards:
                        <CardCarousel></CardCarousel>
                        {/* <div className='card-display'>
                        </div> */}
                    </div>
                    {/* <div className='record-btns-div'>
                        {recordVisibility && <button type="button" className="btn btn-secondary" id='recording-play-btn' onClick={setVisibilityButton}>
                            <FontAwesomeIcon icon={["fas", "circle"]} />
                            Record
                        </button>
                        }
                         {!recordVisibility && <button type="button" className="btn btn-secondary" id='recording-play-btn' onClick={setVisibilityButton}>
                            <FontAwesomeIcon icon={["fas", "square"]} />
                            Stop
                        </button>
                        }
                        
                        <button type="button" className="btn btn-secondary" id='recording-pause-btn'>
                            <FontAwesomeIcon icon={["fas", "pause"]} />
                            Pause
                        </button>
                    </div> */}
                </div>
                <div id='record-publish-buttons-div'>
                    <button type="button" className="btn btn-secondary" id='record-cancel-btn'>Cancel</button>
                    <button type="button" className="btn btn-secondary" id='record-publish-btn' onClick={showEditTrackInfo}>Save</button>
                </div>
            </div>          
        </div>);
}

export default RecordCards;