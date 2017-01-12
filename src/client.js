/* @flow */
/* eslint no-unused-vars: 0, max-len: 0, flowtype/no-weak-types: 0, no-unused-expressions: 0, curly: 0, no-console: 0 */
import type {
  rxweb$Task,
  rxweb$Middleware,
  rxweb$NextAction,
  rxweb$Route,
  Redux$State,
  Redux$Action,
  Redux$Store,
  Redux$Middleware,
  Redux$Dispatch
} from './rxweb';
import { rxweb$Base } from './base';

export class rxweb$Client extends rxweb$Base {
  reduxMiddlewares: Array<Redux$Middleware> = [];
  store: Redux$Store;

  constructor() {
    super();
  }

  applyReduxMiddleware() {
    for (const r of this.routes) {
      const rxwebMiddleware = ({dispatch, getState}) => reduxNext => action => {
        if (action.type !== r.expression) return reduxNext(action);
        // Need to inject dispatch (reduxNext) here.
        r.action(this.next, reduxNext, action, getState);
        // Must return object because inside Redux.
        return reduxNext({ type: '_' });
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

// flow types
export {
  rxweb$FilterFunc as FilterFunc,
  rxweb$SubscribeFunc as SubscribeFunc,
  Redux$Action as ReduxAction,
  Redux$Dispatch as ReduxDispatch,
  Redux$Middleware as ReduxMiddleware,
  Redux$Store as ReduxStore,
  Redux$State as ReduxState
} from './rxweb';

export {
  rxweb$Middleware as Middleware,
  rxweb$Route as Route,
  rxweb$Subject as Subject,
  rxweb$Client as Client,
  rxweb$Task as Task
} from './rxweb';

declare module 'rxweb' {
  declare var Client: rxweb$Client;
}
