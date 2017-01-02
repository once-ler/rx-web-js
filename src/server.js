/* @flow */
/* eslint no-unused-vars: 0, max-len: 0, flowtype/no-weak-types: 0, no-unused-expressions: 0, curly: 0, no-console: 0 */
import KoaServer from 'koa';
import KoaServerRouter from 'koa-router';
import KoaServerBodyParser from 'koa-bodyparser';
import type {
  rxweb$Task,
  rxweb$Request,
  rxweb$Response,
  rxweb$SocketServer,
  rxweb$Middleware,
  rxweb$NextAction,
  Redux$State,
  Redux$Action,
  Redux$Store,
  Redux$Middleware,
  Redux$Dispatch
} from './rxweb';
import {rxweb$Observer} from './observer';
import {rxweb$Subject} from './subject';

export type rxweb$WebAction = (
  _next: rxweb$NextAction,
  _request: rxweb$Request,
  _response: rxweb$Response
) => void;

export type rxweb$BrowserAction = (
  _next: rxweb$NextAction,
  _dispatch: Redux$Dispatch,
  _reduxAction: Redux$Action
) => void;

export class rxweb$Route {
  expression: string;
  verb: string;
  action: rxweb$WebAction & rxweb$BrowserAction;
  constructor(...params: any[]) {
    const [ arg0, arg1, arg2 ] = params;
    this.expression = arg0;

    if (typeof arg1 === 'function') {
      this.action = arg1;
    } else {
      this.verb = arg1;
      this.action = arg2;
    }
  }
}

class rxweb$ServerBase {
  server: Koa$Koa;
  port: number;
  sub: rxweb$Subject;
  middlewares: Array<rxweb$Middleware> = [];
  routes: Array<rxweb$Route> = [];
  reduxMiddlewares: Array<Redux$Middleware> = [];
  store: Redux$Store;
  listener: rxweb$SocketServer;
  getServer(): rxweb$SocketServer {
    return this.listener;
  }
  getSubject(): rxweb$Subject {
    return this.sub;
  }
  next(value: rxweb$Task): void {
    this.sub.get().next(value);
  }
  constructor() {
    this.sub = new rxweb$Subject();

    // https://github.com/facebook/flow/issues/1397
    (this: any).next = this.next.bind(this);
    (this: any).getSubject = this.getSubject.bind(this);
    (this: any).getServer = this.getServer.bind(this);
  }
}

export class rxweb$Server extends rxweb$ServerBase {
  constructor(_port?: number = 3000) {
    super();
    if (this.isBrowser()) return;

    _port && (this.port = _port);
    this.server = new KoaServer();
  }

  isBrowser() {
    return typeof window !== 'undefined' || (process && process.env.BROWSER);
  }

  applyReduxMiddleware() {
    for (const r of this.routes) {
      const rxwebMiddleware = ({dispatch, getState}) => reduxNext => action => {
        if (action.type !== r.expression) return reduxNext(action);
        // Need to inject dispatch (reduxNext) here.
        r.action(this.next, reduxNext, action);
        // Must return object because inside Redux.
        return reduxNext({ type: '_' });
      };
      this.reduxMiddlewares.push(rxwebMiddleware);
    }
  }

  applyRoutes() {
    if (this.isBrowser()) return this.applyReduxMiddleware();

    this.server.use(KoaServerBodyParser());

    const router = new KoaServerRouter();
    for (const r of this.routes) {
      router[r.verb.toLowerCase()](r.expression, ctx => {
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

    // Apply user-defined routes
    this.applyRoutes();

    // Exit if inside browser
    if (this.isBrowser()) return;

    // Start the server.
    this.listener = this.server.listen(this.port);
    if (!process.env.NODE_ENV || !process.env.NODE_ENV.production) {
      console.log(`Listening on port ${this.port}`);
    }
  }

  stop(callback?: Function) {
    this.listener && (this.listener.close(callback));
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
  }
}

export class rxweb$HttpsServer extends rxweb$Server {
  constructor(_port: number = 3000, _store?: Redux$Store, _certFile: string, _privateKeyFile: string) {
    super(_port, _store);
  }
}

declare module 'rxweb' {
  declare var Server: rxweb$Server;
  declare var Route: rxweb$Route;
  declare var WebAction: rxweb$WebAction;
}
