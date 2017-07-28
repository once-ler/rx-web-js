
const url = "wss://echo.websocket.org/";

// const client = new RxWeb.Client({useWebSocket: true, url});
const client = new RxWeb.Client();

const WebSocketMiddleware = new RxWeb.Middleware(
  'WEBSOCKET_PAYLOAD',
  task => {
    console.log(task);
    log(`Task ${JSON.stringify(task, null, '  ')}`);
  }
);

client.middlewares = [WebSocketMiddleware];

client.start();

const webSocket = RxWeb.WebSocketReducer;
const webSocketMiddleware = RxWeb.WebSocketMiddleware(url);
const rxMiddlewares = client.getReduxMiddlewares();
const middlewares = [webSocketMiddleware].concat(rxMiddlewares);
const rxReducers = client.getReduxReducers();
const reducers = Redux.combineReducers({
  webSocket,
  ...rxReducers
});

const store = Redux.createStore(reducers, {}, Redux.applyMiddleware(...middlewares));

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
