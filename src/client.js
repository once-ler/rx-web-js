/* @flow */
/* eslint no-unused-vars: 0, max-len: 0, flowtype/no-weak-types: 0, no-unused-expressions: 0, curly: 0, no-console: 0 */
import type { MiddlewareAPI } from 'redux'
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
  store: Redux$Store;

  constructor() {
    super();
  }

  applyReduxMiddleware() {
    for (const r of this.routes) {
      const rxwebMiddleware = (api: MiddlewareAPI<Redux$State, Redux$Action>) => reduxDispatch => action => {
        if (action.type !== r.expression) return reduxDispatch(action);
        // Need to inject dispatch (reduxNext) here.
        r.action(
          { url: action.type, body: action },
          { browser: true, send: reduxDispatch },
          this.next,
          api.getState
        );
        return reduxDispatch({...api.getState(), ...action});
      };
      this.reduxMiddlewares.push(rxwebMiddleware);
    }
  }

  getReduxMiddleware() {
    return this.reduxMiddlewares;
  } 

  start() {
    // Depending on the observer's filter function,
    // each observer will act or ignore any incoming web request.
    this.makeObserversAndSubscribeFromMiddlewares();

    this.applyReduxMiddleware();
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
