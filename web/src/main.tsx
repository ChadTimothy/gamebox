import React from 'react';
import ReactDOM from 'react-dom/client';
import { WordMorph } from './widgets/WordMorph.js';
import './styles/globals.css';

// Render the Word Challenge widget
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <WordMorph />
  </React.StrictMode>,
);
