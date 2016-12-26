/* @flow */
/* eslint no-unused-vars: 0 */
import KoaServer from 'koa';
import KoaServerRouter from 'koa-router';
import type {
  rxweb$Request,
  rxweb$Response,
  rxweb$Middleware
} from './rxweb';
import {rxweb$Observer} from './observer';
import {rxweb$Subject} from './subject';

export type rxweb$WebAction = (
  _request?: rxweb$Request,
  _response?: rxweb$Response) => void;

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
  port: number;
  sub: rxweb$Subject;
  middlewares: Array<rxweb$Middleware>;
  routes: Array<rxweb$Route>;
  onNext: rxweb$Middleware;
  applyRoutes: () => void;
  getSubject: () => rxweb$Subject;
  start: () => void;
  makeObserversAndSubscribeFromMiddlewares: () => void;
}

class rxweb$ServerBase {
  port: number;
  sub: rxweb$Subject;
  middlewares: Array<rxweb$Middleware>;
  routes: Array<rxweb$Route>;
  onNext: rxweb$Middleware;
  getSubject(): rxweb$Subject {
    return this.sub;
  }
  constructor() {
    this.sub = new rxweb$Subject();
  }
}

export class rxweb$Server extends rxweb$ServerBase {
  server: Koa$Koa;

  constructor(_port: number, _certFile?: string, _privateKeyFile?: string) {
    super();
    this.port = _port;
    this.server = new KoaServer();
  }

  applyRoutes() {
    const router = new KoaServerRouter();
    for (const r of this.routes) {
      router[r.verb.toLowerCase()](r.expression, (ctx, next) => {
        r.action(ctx.request, ctx.response);
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

    // Last Observer is the one that will respond to client
    // after all middlwares have been processed.
    const lastObserver: rxweb$Observer = new rxweb$Observer(
      this.sub.get().asObservable(),
      this.onNext.filterFunc
    );
    lastObserver.subscribe(this.onNext.subscribeFunc);
  }
}

declare module 'rxweb' {
  declare var Server: rxweb$Server;
  declare var IServer: rxweb$IServer;
  declare var Route: rxweb$Route;
  declare var WebAction: rxweb$WebAction;
}
