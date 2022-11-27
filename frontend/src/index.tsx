import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';

// Imports for Icons
import { library } from '@fortawesome/fontawesome-svg-core'
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { fab } from '@fortawesome/free-brands-svg-icons'
import { faBars, faHome, faInfo, faCircleInfo, faSearch, faPlugCirclePlus, faPlusCircle, faPlus, faHeart, faPlayCircle, faEllipsisH} from '@fortawesome/free-solid-svg-icons'
import {RecoilRoot} from 'recoil'


// Adding icons to global library
library.add(fab, faBars, faHome, faInfo, faCircleInfo, faSearch, faPlusCircle, faPlus, faHeart, faPlayCircle, faEllipsisH)

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <React.StrictMode>
    <RecoilRoot>
      <App />
    </RecoilRoot>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
