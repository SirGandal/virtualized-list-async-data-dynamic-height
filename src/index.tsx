import * as React from 'react';
import * as ReactDOM from 'react-dom';
import InfiniteLoaderExample from './InfiniteLoaderExample';
import registerServiceWorker from './registerServiceWorker';
import './index.css';

ReactDOM.render(
  <InfiniteLoaderExample />,
  document.getElementById('root') as HTMLElement
);
registerServiceWorker();
