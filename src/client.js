/* @flow */
/* eslint no-unused-vars: 0, max-len: 0, flowtype/no-weak-types: 0, no-unused-expressions: 0, curly: 0, no-console: 0 */
import type { MiddlewareAPI, Reducer } from 'redux'
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
import { rxweb$Subject, rxweb$Observer, rxweb$Middleware } from './rxweb';
import { rxweb$Base } from './base';

class rxweb$Client extends rxweb$Base {
  reduxMiddlewares: Array<Redux$Middleware> = [];
  reduxReducers: {[reducerKey: string]: Reducer<Redux$State, Redux$Action>} = {};
  
  store: Redux$Store;

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
              data: action.data
            };
          case `${_type}_ERROR`:
            return {
              ...state,
              data: action.data
            };
          default:
            return state;
        }
      }
    };
  }

  applyReduxMiddlewares() {
    for (const r of this.middlewares) {
      const rxwebMiddleware = (api: MiddlewareAPI<Redux$State, Redux$Action>) => reduxDispatch => action => {
        if (action.type !== r.type) return reduxDispatch(action);
        const { dispatch, getState } = api;

        this.next({
          ...action,
          next: this.next,
          init: () => dispatch({ ...getState(), type: `${action.type}_INIT` }),
          done: (data: Redux$Action) => dispatch({ ...getState(), data, type: `${action.type}_SUCCESS` }),
          error: (data: Redux$Action) => dispatch({ ...getState(), data, type: `${action.type}_ERROR` }),
          store: { dispatch, getState }
        });
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

  start() {
    // Depending on the observer's filter function,
    // each observer will act or ignore any incoming web request.
    this.makeObserversAndSubscribeFromMiddlewares();

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
