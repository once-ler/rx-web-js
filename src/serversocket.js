/* @flow */
import webSocket from 'rxjs/observable/dom/webSocket';
import WebSocketSubject from 'rxjs/observable/dom/WebSocketSubject';

// type FuncArg = {url?: string};

export default createMiddleware = (url: string) => {

  let websocket: WebSocketSubject<any>;

  return (store: Object) => (next: Function) => (action: Action) => {
    switch (action.type) {
      case 'WEBSOCKET_CONNECT':
        if (!this.websocket)
          websocket = webSocket.create(url);

        websocket
          .retry()
          .subscribe(
            msg => store.dispatch({ type: 'WEBSOCKET_PAYLOAD', payload: JSON.parse(msg) }),
            err => store.dispatch({ type: 'WEBSOCKET_ERROR', payload: JSON.parse(err) })
          );

        next(action);
        break;
      case 'WEBSOCKET_SEND':
        websocket.next(JSON.stringify(action.payload));
        next(action);
        break;
      default:
        next(action);
    }    
  };

  send(msg: Object) {
    this.websocket.next(JSON.stringify(msg));
  }  
};
