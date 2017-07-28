/* @flow */
import type { MiddlewareAPI } from 'redux';
import { webSocket } from 'rxjs/observable/dom/webSocket';
import { WebSocketSubject } from 'rxjs/observable/dom/WebSocketSubject';
import 'rxjs/add/operator/retry';

const reducer = (state: any = {}, action: any) => {
  switch (action.type) {
    case 'WEBSOCKET_CONNECT':
      return state;
    case 'WEBSOCKET_DISCONNECT':
      return state;
    case 'WEBSOCKET_SEND':
      return {
        ...state,
        payload: action.payload
      };
    case 'WEBSOCKET_PAYLOAD':
      console.log('WEBSOCKET_PAYLOAD');
      return {
        ...state,
        payload: action.payload
      };
    case 'WEBSOCKET_ERROR':
      return {
        ...state,
        error: action.payload
      };
    default:
      return state;
  }
};

const middleware = (next) => (url: ?string) => {
  console.log(next);
  let websocket: WebSocketSubject<any>;

  return (api: MiddlewareAPI<any, any>) => (reduxDispatch: any) => (action: any) => {
    switch (action.type) {
      case 'WEBSOCKET_CONNECT':
        console.log('WEBSOCKET_CONNECT');
        if (!websocket)
          websocket = webSocket(url);

        websocket
          .retry()
          .subscribe(
            msg => { next({ type: 'WEBSOCKET_PAYLOAD', payload: msg }); reduxDispatch({ type: 'WEBSOCKET_PAYLOAD', payload: msg }); },
            err => reduxDispatch({ type: 'WEBSOCKET_ERROR', payload: err })
          );

        return reduxDispatch(action);
      case 'WEBSOCKET_SEND':
        console.log('WEBSOCKET_SEND');
        websocket.next(JSON.stringify(action.payload));
        return reduxDispatch(action);
      case 'WEBSOCKET_DISCONNECT':
        websocket.unsubscribe();
        return reduxDispatch(action);
      default:
        return reduxDispatch(action);
    }
  };
};

export { reducer as WebSocketReducer, middleware as WebSocketMiddleware };
