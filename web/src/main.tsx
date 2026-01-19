import React from 'react';
import ReactDOM from 'react-dom/client';
import { WordChallenge } from './widgets/WordChallenge.js';
import './styles/globals.css';

// Render the Word Challenge widget
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <WordChallenge />
  </React.StrictMode>,
);
