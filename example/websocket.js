const url = 'wss://echo.websocket1.org/';

const client = new RxWeb.Client();

const WebSocketPayloadMiddleware = new RxWeb.Middleware(
  task => task.type === 'WEBSOCKET_PAYLOAD',
  task => {
    log(`WebSocket Payload ${JSON.stringify(task, null, '  ')}`);
    // dispatch may occur on different frame?  Immdiately calling getState does not get expected results.
    setTimeout(() => log(`Store ${JSON.stringify(task.store.getState(), null, '  ')}`), 100);
  }
);

const WebSocketErrorMiddleware = new RxWeb.Middleware(
  task => task.type === 'WEBSOCKET_ERROR',
  task => {
    console.log(task);
    log(`WebSocket Error ${JSON.stringify(task, null, '  ')}`);
    log(`Store ${JSON.stringify(task.store.getState(), null, '  ')}`);
  }
);

client.middlewares = [ WebSocketPayloadMiddleware, WebSocketErrorMiddleware ];

client.start();

const rxMiddlewares = client.getReduxMiddlewares();

const rxReducers = client.getReduxReducers();
console.log(rxMiddlewares);
const reducers = Redux.combineReducers({...rxReducers});
const store = Redux.createStore(reducers, {}, Redux.applyMiddleware(...rxMiddlewares));

store.dispatch({type: 'WEBSOCKET_CONNECT', data: { url }});

store.dispatch({
  type: 'WEBSOCKET_SEND',
  data: {
    another: 'hello'
  }
});
