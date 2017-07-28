
const webSocketUrl = 'wss://echo.websocket.org/';

// const client = new RxWeb.Client({useWebSocket: true, url});
const client = new RxWeb.Client({webSocketUrl});

const WebSocketMiddleware = new RxWeb.Middleware(
  task => task.type === 'WEBSOCKET_PAYLOAD',
  task => {
    console.log(task);
    log(`Task ${JSON.stringify(task, null, '  ')}`);
  }
);

client.middlewares = [ WebSocketMiddleware ];

client.start();

console.log(client);

const webSocket = RxWeb.WebSocketReducer;
const webSocketMiddleware = RxWeb.WebSocketMiddleware(webSocketUrl);
const rxMiddlewares = client.getReduxMiddlewares();
const middlewares = [ webSocketMiddleware ].concat(rxMiddlewares);

console.log(middlewares);
const rxReducers = client.getReduxReducers();

/*
const reducers = Redux.combineReducers({
  webSocket,
  ...rxReducers
});
*/

console.log([{...rxReducers}, webSocket]);
const reducers = Redux.combineReducers({...rxReducers});
// const store = Redux.createStore(reducers, {}, Redux.applyMiddleware(...middlewares));
const store = Redux.createStore(reducers, {}, Redux.applyMiddleware(...rxMiddlewares));

store.dispatch({type: 'WEBSOCKET_CONNECT'});
store.dispatch({
  type: 'WEBSOCKET_SEND',
  payload: {
    another: 'hello'
  }
});

/*
let subject = Rx.Observable.webSocket(url);
subject
  .retry()
  .subscribe(
   (msg) => console.log('message received: ' + msg),
   (err) => console.log(err),
   () => console.log('complete')
 );
subject.next(JSON.stringify({ op: 'hello' }));
*/
