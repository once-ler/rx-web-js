/* @flow */
/* eslint no-unused-vars: 0, max-len: 0, flowtype/no-weak-types: 0, no-unused-expressions: 0, curly: 0, no-console: 0 */
import type { MiddlewareAPI, Reducer } from 'redux';
import type {
  rxweb$Task,
  rxweb$NextAction,
  rxweb$Route,
  rxweb$FilterFunc,
  rxweb$SubscribeFunc,
  Redux$State,
  Redux$Action,
  Redux$Store,
  Redux$Middleware,
  Redux$Dispatch
} from './rxweb';
import { webSocket } from 'rxjs/observable/dom/webSocket';
import { rxweb$Subject, rxweb$Observer, rxweb$Middleware } from './rxweb';
import { rxweb$Base } from './base';
import 'rxjs/add/operator/retry';
import {WebSocketReducer} from './websocket';

type WebSocketResponseHandler = (string, any) => (() => mixed);

class rxweb$Client extends rxweb$Base {
  reduxMiddlewares: Array<Redux$Middleware> = [];
  reduxReducers: {[reducerKey: string]: Reducer<Redux$State, Redux$Action>} = {};
  store: Redux$Store;
  webSocketUrl: ?string = null;

  constructor() {
    super();
  }

  createReduxReducer(_type: string) {
    return {
      [_type]: (state = {}, action) => {
        switch (action.type) {
          case `${_type}_INIT`:
            return {
              ...state
            };
          case `${_type}_SUCCESS`:
            return {
              ...state,
              payload: action.payload
            };
          case `${_type}_ERROR`:
            return {
              ...state,
              payload: action.payload
            };
          default:
            return state;
        }
      }
    };
  }

  handleWebSocketResponse(next: any => void, reduxDispatch: any, nextTask: rxweb$Task, getState: any): WebSocketResponseHandler {
    return (actionType: string, msg: any) => {
      const newAction: Object = {type: actionType, data: msg};
      const newProp: rxweb$Task = {...nextTask, ...newAction };
      next(newProp);
      return reduxDispatch({...getState(), ...newAction});
    };
  }

  applyReduxMiddlewares() {
    for (const r of this.middlewares) {
      const rxwebMiddleware = (api: MiddlewareAPI<Redux$State, Redux$Action>) => reduxDispatch => action => {
        if (action.type !== r.type) return reduxDispatch(action);
        
        const { dispatch, getState } = api;
        
        const nextTask: rxweb$Task = {
          ...action,
          next: this.next,
          init: () => dispatch({ ...getState(), type: `${action.type}_INIT` }),
          done: (payload: Redux$Action) => dispatch({ ...getState(), payload, type: `${action.type}_SUCCESS` }),
          error: (payload: Redux$Action) => dispatch({ ...getState(), payload, type: `${action.type}_ERROR` }),
          store: { dispatch, getState }
        };

        const handleWsResponse = this.handleWebSocketResponse(this.next, reduxDispatch, nextTask, getState);

        switch (action.type) {
          case 'WEBSOCKET_CONNECT':
            if (!this.websocket)
              this.websocket = webSocket(action.data.url);
              
              this.websocket
                .catch(e => { console.log(e); handleWsResponse('WEBSOCKET_ERROR', `Error conecting to ${e.target.url} timestamp: ${e.timeStamp}`); })
                .retry()
                .subscribe(
                  msg => handleWsResponse('WEBSOCKET_PAYLOAD', msg),
                  err => handleWsResponse('WEBSOCKET_ERROR', err)
                );
            break;
          case 'WEBSOCKET_SEND':
            console.log('WEBSOCKET_SEND');
            this.websocket.next(JSON.stringify(action.data));
            break;
          case 'WEBSOCKET_DISCONNECT':
            this.websocket.unsubscribe();
            break;
          default:
            break;
        }
        this.next(nextTask);
        return reduxDispatch({...getState(), ...action});
      };
      this.reduxMiddlewares.push(rxwebMiddleware);

      if (r.type) {
        const reducer = this.createReduxReducer(r.type);
        this.reduxReducers = Object.assign(this.reduxReducers, reducer);
      }
    }
  }

  getReduxMiddlewares() {
    return this.reduxMiddlewares;
  }

  getReduxReducers() {
    return this.reduxReducers;
  }

  createWebSocketClient() {
    this.reduxReducers = {...this.reduxReducers, webSocket: WebSocketReducer };
    
    this.middlewares = [
      new rxweb$Middleware(
        'WEBSOCKET_CONNECT',
        task => task
      ),
      new rxweb$Middleware(
        'WEBSOCKET_SEND',
        task => task
      ),
      new rxweb$Middleware(
        'WEBSOCKET_DISCONNECT',
        task => task
      )
    ].concat(this.middlewares);
  }

  start() {
    // Depending on the observer's filter function,
    // each observer will act or ignore any incoming web request.
    this.makeObserversAndSubscribeFromMiddlewares();

    this.createWebSocketClient();

    this.applyReduxMiddlewares();
  }
}

export { rxweb$Client as Client };

export {
  rxweb$Middleware as Middleware,
  rxweb$Route as Route,
  rxweb$Subject as Subject,
  rxweb$Observer as Observer,
  rxweb$Task as Task
} from './rxweb';

// flow types
declare module 'rxweb' {
  declare var Subject: rxweb$Subject;
  declare var Observer: rxweb$Observer;
  declare var Route: rxweb$Route;
  declare var FilterFunc: rxweb$FilterFunc;
  declare var SubscribeFunc: rxweb$SubscribeFunc;
  declare var Middleware: Class<rxweb$Middleware>;
  declare var Task: Class<rxweb$Task>;
  declare var ReduxStore: Redux$Store;
  declare var ReduxState: Redux$State;
  declare var ReduxAction: Redux$Action;
  declare var ReduxDispatch: Redux$Dispatch;
  declare var ReduxMiddleware: Redux$Middleware;
  declare var Client: rxweb$Client;
}
