import React, { useEffect, useState } from "react";
import {FaPlayCircle,FaTrash } from 'react-icons/fa';
import { useParams } from "react-router-dom";
import sendAPI from "../sendAPI";
import { useRecoilValue } from 'recoil';

import { Modal, Button } from "react-bootstrap";

import {userJWT, userModeState} from '../context/GlobalState'

const Playlist = () => {
  //id for the playlist
  const { pid } = useParams();
  const [playlist, setPlaylist] = useState([]);
  const [thumbnail, setThumbnail] = useState();
  const [allPost, setAllPost] = useState([]);
  const [modalState, setModalState] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [message, setMessage] = useState('')

  const user = useRecoilValue(userModeState);
  const jwt = useRecoilValue(userJWT);

  useEffect(() => {

    const params = {
      id: pid,
    };
    sendAPI("get", "/playlists/getPlaylistByID", params).then((res) => {
      setPlaylist(res.data);
    getPost()
    });
    
  }, []);

  const getPost=()=>{
    const params = {
      id: pid,
    };
    sendAPI('get', '/playlists/getPostsByPlaylistID', params).then((res)=> {
      setAllPost(res.data)
    })
  }

  const updatePlaylist = () =>{
    const bodyData ={
      id: pid,
      name: newTitle,
      thumbnail: thumbnail,
      token: jwt,
    }
    sendAPI('put', '/playlists/updatePlaylist', bodyData)
      .then((res) =>{
        setMessage('Update Successful')
        console.log(res.data)
      })
      .catch((err) => {
        console.log.apply(err.response.data)
      })
    
  }

  const openModal = () => {
    setModalState(true);
  }
  const closeModal = () => {
    setModalState(false);
  }

  const deleteSong=(prop)=>{ 
    const dataBody = {
      postID: prop,
      playlistID: pid,
      token: jwt,
    }
    sendAPI("delete", "/playlists/removePostFromPlaylist", dataBody)
      .then((res) =>{
        getPost()
      })
  }

  const updateProfilePic = (file) => {
    var file = document.querySelector('input[type=file]')['files'][0];
    var reader = new FileReader();
    var baseString;
    reader.onloadend = function () {
        baseString = reader.result;
        setThumbnail(baseString); 
    };
    reader.readAsDataURL(file);
    // setProfilePicture(baseString);
  }

  return (
    <div className="playlistMain">
      <div className="playlistHeader">
        <img
          src={
            playlist.thumbnail
              ? playlist.thumbnail
              : "https://wtwp.com/wp-content/uploads/2015/06/placeholder-image.png"
          }
          className="playlistSinglePic"
        />
        <button className="editButton" onClick={openModal}>
          Edit Playlist
        </button>
        <label className="playlistTitle">{playlist.name}</label>
        
      </div>
      <table className="playlistBody">
        <tbody>
      {allPost.map((item, index) => {
            return(
              <tr key={index}>
                <td><img className="smallPostThumbnail" src={item.post.thumbnail? item.post.thumbnail :"https://wtwp.com/wp-content/uploads/2015/06/placeholder-image.png"} /> </td>
                <td className="smallPostText">{index} - {item.post.title}</td>
                <td><button className="playlistPostButton" onClick={(e) =>deleteSong(item.post.id)}><FaTrash /></button></td>
                <td><button className="playlistPostButton"><FaPlayCircle /></button></td>
              </tr>
            )
          })}
        </tbody>
      </table>
      <Modal show={modalState} onHide={closeModal}>
        <Modal.Header closeButton>
          <Modal.Title>Edit Playlist</Modal.Title>
        </Modal.Header>
        <Modal.Body>
        <label>New Playlist Title</label>
        <input type="text" onChange={(e) => setNewTitle(e.target.value)}/>
        <label for="file-upload" className="custom-file-upload">
    				Upload Image (optional)
				</label>
				<input id="file-upload" type="file" />
        
        
        </Modal.Body>
      </Modal>
      <Modal show={modalState} onHide={closeModal}>
        <Modal.Header closeButton>
          <Modal.Title>Create Playlist</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p style={{ textAlign: "left" }}>
            Playlist Title <span style={{ color: "red" }}>*</span>
          </p>
          <input
            onChange={(e) => setNewTitle(e.target.value)}
            className="inputModal"
          />
          <p style={{ textAlign: "left" }}>Playlist Thumbnail</p>
          <label for="file-upload" className="custom-file-upload">
    				Upload Image (optional)
				</label>
				<input id="file-upload" onChange={(event) => updateProfilePic(event.target.files[0])} type="file"/>
        </Modal.Body>
        <Modal.Footer>
          <p>{message}</p>
          <Button variant="primary" onClick={updatePlaylist}>
            Update
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default Playlist;
