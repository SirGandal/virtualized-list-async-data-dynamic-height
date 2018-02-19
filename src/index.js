import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import InfiniteLoaderExample from './InfiniteLoaderExample';
import registerServiceWorker from './registerServiceWorker';

ReactDOM.render(<InfiniteLoaderExample />, document.getElementById('root'));
registerServiceWorker();
