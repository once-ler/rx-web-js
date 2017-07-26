
const url = "wss://echo.websocket.org/";

// const client = new RxWeb.Client({useWebSocket: true, url});
const client = new RxWeb.Client();

const WebSocketMiddleware = new RxWeb.Middleware(
  task => task.type === 'WEBSOCKET',
  task => {
    console.log(task);
    console.log(task.data.message);
    log(`Task ${task.data.message}`);
  }
);

client.middlewares = [WebSocketMiddleware];

client.start();

const webSocket = (state = {}, action) => {
  console.log(action)
  switch (action.type) {
    case 'webSocket':
      return {
        ...state,
        data: action.data
      };
    default:
      return state;
  }
};

const middlewares = client.getReduxMiddlewares();
const rxReducers = client.getReduxReducers();
const reducers = Redux.combineReducers({
  webSocket,
  ...rxReducers
});

const store = Redux.createStore(reducers, {}, Redux.applyMiddleware(...middlewares));

console.log(client.getSubject().sub.next(JSON.stringify({message: 'hello'})));

store.dispatch({
  type: 'WEBSOCKET',
  data: {
    message: 'hey'
  }
});

let subject = Rx.Observable.webSocket(url);
subject
  .retry()
  .subscribe(
   (msg) => console.log('message received: ' + msg),
   (err) => console.log(err),
   () => console.log('complete')
 );
subject.next(JSON.stringify({ op: 'hello' }));