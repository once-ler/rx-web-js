/* @flow */
import type { MiddlewareAPI } from 'redux';
import webSocket from 'rxjs/observable/dom/webSocket';
import WebSocketSubject from 'rxjs/observable/dom/WebSocketSubject';

const reducer = (state: any = {}, action: any) => {
  switch (action.type) {
    case 'WEBSOCKET_CONNECT':
      return state;
    case 'WEBSOCKET_DISCONNECT':
      return state;
    case 'WEBSOCKET_SEND':
      return {
        ...state,
        data: action.payload
      };
    case 'WEBSOCKET_PAYLOAD':
      return {
        ...state,
        data: action.payload
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

const middleware = (url: string) => {

  let websocket: WebSocketSubject<any>;

  return (api: MiddlewareAPI<any, any>) => (next: any) => (action: any) => {
    switch (action.type) {
      case 'WEBSOCKET_CONNECT':
        if (!websocket)
          websocket = webSocket.create(url);

        websocket
          .retry()
          .subscribe(
            msg => api.dispatch({ type: 'WEBSOCKET_PAYLOAD', payload: JSON.parse(msg) }),
            err => api.dispatch({ type: 'WEBSOCKET_ERROR', payload: err })
          );

        return next(action);
      case 'WEBSOCKET_SEND':
        websocket.next(JSON.stringify(action.payload));
        return next(action);
      case 'WEBSOCKET_DISCONNECT':
        websocket.unsubscribe();
        return next(action);
      default:
        return next(action);
    }
  };
};

export { reducer as wsReducer, middleware as wsMiddleware };
