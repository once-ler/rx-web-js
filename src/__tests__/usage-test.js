import { describe, it } from 'mocha';
import request from 'supertest-as-promised';
import should from 'should';
import {
  rxweb$Middleware
} from '../rxweb';
import {
  Client as rxweb$Client
} from '../client';
import { combineReducers, createStore, applyMiddleware } from 'redux';

// Make WebSocket mimic browser.
global.WebSocket = require('ws');

describe('Useful errors for WebSocket when incorrectly used', () => {
  let client = new rxweb$Client();
  let url = 'wss://echo.websocket.fake.org/';

  const WebSocketPayloadMiddleware = new rxweb$Middleware(
    task => task.type === 'WEBSOCKET_PAYLOAD',
    task => {
      // dispatch may occur on different frame?  Immdiately calling getState does not get expected results.
      setTimeout(() => log(`Store ${JSON.stringify(task.store.getState(), null, '  ')}`), 100);
    }
  );

  const WebSocketErrorMiddleware = new rxweb$Middleware(
    task => task.type === 'WEBSOCKET_ERROR',
    task => {
      log(`WebSocket Error ${JSON.stringify(task, null, '  ')}`);
      log(`Store ${JSON.stringify(task.store.getState(), null, '  ')}`);
    }
  );

  client.middlewares = [ WebSocketPayloadMiddleware, WebSocketErrorMiddleware ];
  client.start();

  const rxMiddlewares = client.getReduxMiddlewares();
  const rxReducers = client.getReduxReducers();
  const reducers = combineReducers({...rxReducers});
  const store = createStore(reducers, {}, applyMiddleware(...rxMiddlewares));

  store.dispatch({type: 'WEBSOCKET_CONNECT', data: { url }});

  it('Catches network error when endpoint is unreacheable', async () => {
    const waitForState = () => new Promise(resolve => {
      setTimeout(() => resolve(task.store.getState()), 100);
    });
    const storeState = await waitForState();

    storeState.webSocket.should.have.properties('connect', 'send', 'error');
    storeState.should.have.propertyByPath('webSocket', 'error').match(/^Error conecting to/);
  });

  it('', async () => {

  });

});

describe('', () => {
  let app = new rxweb$Client();

  it('', () => {

  });


});