import React from 'react';
import ReactDOM from 'react-dom/client';
import { WordMorph } from './widgets/WordMorph.js';
import { TwentyQuestions } from './widgets/TwentyQuestions.js';
import { Connections } from './widgets/Connections.js';
import './styles/globals.css';

// Get widget name from URL query parameter
const params = new URLSearchParams(window.location.search);
const widgetName = params.get('widget') || 'word-morph';

// Select which widget to render
let WidgetComponent: React.ComponentType;
switch (widgetName) {
  case 'twenty-questions':
    WidgetComponent = TwentyQuestions;
    break;
  case 'connections':
    WidgetComponent = Connections;
    break;
  case 'word-morph':
  default:
    WidgetComponent = WordMorph;
    break;
}

// Render the selected widget
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <WidgetComponent />
  </React.StrictMode>,
);
