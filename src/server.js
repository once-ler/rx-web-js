/* @flow */
/* eslint no-unused-vars: 0, max-len: 0, flowtype/no-weak-types: 0, no-unused-expressions: 0, curly: 0, no-console: 0 */
import KoaServer from 'koa';
import KoaServerRouter from 'koa-router';
// import { applyMiddleware } from 'redux';
import type {
  rxweb$Task,
  rxweb$Request,
  rxweb$Response,
  rxweb$Middleware,
  rxweb$NextAction,
  Redux$State,
  Redux$Action,
  Redux$Store,
  Redux$Middleware
} from './rxweb';
import {rxweb$Observer} from './observer';
import {rxweb$Subject} from './subject';

export type rxweb$WebAction = (
  _next: rxweb$NextAction,
  _request?: rxweb$Request,
  _response?: rxweb$Response
  ) => void;

export class rxweb$Route {
  expression: string;
  verb: string;
  action: rxweb$WebAction;
  constructor(_expression: string, _verb: string, _action: rxweb$WebAction) {
    this.expression = _expression;
    this.verb = _verb;
    this.action = _action;
  }
}

export interface rxweb$IServer {
  server: Koa$Koa;
  port: number;
  sub: rxweb$Subject;
  middlewares: Array<rxweb$Middleware>;
  routes: Array<rxweb$Route>;
  reduxMiddlewares: Array<Redux$Middleware>;
  // onNext: rxweb$Middleware;
  applyRoutes: () => void;
  applyReduxMiddleware: () => void;
  getSubject: () => rxweb$Subject;
  start: () => void;
  makeObserversAndSubscribeFromMiddlewares: () => void;
  // next: (value: rxweb$Task) => void;
  next: rxweb$NextAction;
}

class rxweb$ServerBase {
  server: Koa$Koa;
  port: number;
  sub: rxweb$Subject;
  middlewares: Array<rxweb$Middleware> = [];
  routes: Array<rxweb$Route> = [];
  reduxMiddlewares: Array<Redux$Middleware> = [];
  store: Redux$Store;
  // onNext: rxweb$Middleware;
  getSubject(): rxweb$Subject {
    return this.sub;
  }
  next(value: rxweb$Task): void {
    this.sub.get().next(value);
  }
  constructor(_store?: Redux$Store) {
    this.sub = new rxweb$Subject();
    _store && (this.store = _store);
  }
}

export class rxweb$Server extends rxweb$ServerBase {
  constructor(_port: number = 3000, _store?: Redux$Store) {
    super(_store);
    this.port = _port;
    this.server = new KoaServer();
  }

  isBrowser() {
    return typeof window !== undefined || (process && process.env.BROWSER);
  }

  applyReduxMiddleware() {
    // const middlewares: Array<ReduxMiddlware> = [];
    for (const r of this.routes) {
      const rxwebMiddleware = ({dispatch, getState}) => next => action => {
        if (action.type !== r.expression) return next(action);

        // Need to inject dispatch here.
        r.action(next);
        // Must return object
        return next({ type: '_' });
      };
      this.reduxMiddlewares.push(rxwebMiddleware);
    }
  }

  applyRoutes() {
    if (this.isBrowser()) return this.applyReduxMiddleware();

    const router = new KoaServerRouter();
    for (const r of this.routes) {
      router[r.verb.toLowerCase()](r.expression, (ctx) => {
        r.action(this.next, ctx.request, ctx.response);
      });
    }

    this.server
      .use(router.routes())
      .use(router.allowedMethods);
  }

  start() {
    // Depending on the observer's filter function,
    // each observer will act or ignore any incoming web request.
    this.makeObserversAndSubscribeFromMiddlewares();

    // Defaults: 1 endpoint for POST/GET
    // TODO
    // Apply user-defined routes
    this.applyRoutes();

    // Start the server.
    // TODO
    this.server.listen(this.port);
  }

  makeObserversAndSubscribeFromMiddlewares() {
    // No subscription, observers does nothing.
    // Create Observers that react to subscriber broadcast.
    for (const m of this.middlewares) {
      const o: rxweb$Observer = new rxweb$Observer(
        this.sub.get().asObservable(),
        m.filterFunc
      );
      o.subscribe(m.subscribeFunc);
    }

    /*
    // Deprecate
    // Last Observer is the one that will respond to client
    // after all middlwares have been processed.
    const lastObserver: rxweb$Observer = new rxweb$Observer(
      this.sub.get().asObservable(),
      this.onNext.filterFunc
    );
    lastObserver.subscribe(this.onNext.subscribeFunc);
    */
  }
}

export class rxweb$HttpsServer extends rxweb$Server {
  constructor(_port: number = 3000, _store?: Redux$Store, _certFile: string, _privateKeyFile: string) {
    super(_port, _store);
  }
}

declare module 'rxweb' {
  declare var Server: rxweb$Server;
  declare var IServer: rxweb$IServer;
  declare var Route: rxweb$Route;
  declare var WebAction: rxweb$WebAction;
}
