import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import { fetchPokedex } from './util/pokedex';
import { fetchMoves } from './util/move';
import { fetchCharactor } from './util/charactor';
import { fetchAttribute } from './util/attribute';
import { fetchStatus } from './util/status';
import * as serviceWorker from './serviceWorker';

(async function name() {
  await fetchPokedex();
  await fetchMoves();
  await fetchCharactor();
  await fetchAttribute();
  await fetchStatus();
  ReactDOM.render(<App />, document.getElementById('root'));
}())

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: http://bit.ly/CRA-PWA
serviceWorker.unregister();
