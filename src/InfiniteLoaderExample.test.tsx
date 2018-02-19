import * as React from 'react';
import * as ReactDOM from 'react-dom';
import InfiniteLoaderExample from './InfiniteLoaderExample';

it('renders without crashing', () => {
  const div = document.createElement('div');
  ReactDOM.render(<InfiniteLoaderExample />, div);
});
