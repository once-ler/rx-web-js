/* @flow */
import type { rxweb$Task, Redux$Action } from './rxweb';
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

const middleware = (next: (value: any) => void) => (url: ?string) => {
  let websocket: WebSocketSubject<any>;
  
  type RespondFunc = (string, any) => (() => mixed);

  return (api: MiddlewareAPI<any, any>) => (reduxDispatch: any) => (action: any) => {
    switch (action.type) {
      case 'WEBSOCKET_CONNECT':
        if (!websocket)
          websocket = webSocket(url);

        const { dispatch, getState } = api;
        const respond: RespondFunc = (actionType: string, msg: any) => {
          const task: rxweb$Task = {
            type: actionType,
            data: msg,
            next,
            init: () => dispatch({ ...getState(), type: `${actionType}_INIT` }),
            done: (payload: Redux$Action) => dispatch({ ...getState(), payload, type: `${actionType}_SUCCESS` }),
            error: (payload: Redux$Action) => dispatch({ ...getState(), payload, type: `${actionType}_ERROR` }),
            store: { dispatch, getState }
          };          
          next(task);
          return reduxDispatch(task);
        };

        websocket
          .retry()
          .subscribe(
            msg => respond('WEBSOCKET_PAYLOAD', msg),
            err => respond('WEBSOCKET_ERROR', err)
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
