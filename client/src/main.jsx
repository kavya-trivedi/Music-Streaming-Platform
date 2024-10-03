// main.jsx

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import { BrowserRouter } from 'react-router-dom';
import './index.css';
import MusicPlayerContext from './context/MusicPlayer.jsx';

ReactDOM.createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <MusicPlayerContext>
      <App />
    </MusicPlayerContext>
  </BrowserRouter>
);
