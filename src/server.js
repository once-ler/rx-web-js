/* @flow */

import KoaServer from 'koa';
import KoaServerRouter from 'koa-router';
import type {
  rxweb$Request,
  rxweb$Response,
  rxweb$Task,
  rxweb$Middleware,
  rxweb$FilterFunc,
  rxweb$SubscribeFunc
} from './rxweb';
import {rxweb$Observer} from './observer';
import {rxweb$Subscriber} from './subscriber';
import {rxweb$Subject} from './subject';

declare type WebAction = (_request?: rxweb$Request, _response?: rxweb$Response) => void;

export type rxweb$Route = {
  expression: string;
  verb: string;
  action: WebAction;
};

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
}

export class rxweb$Server extends rxweb$ServerBase {
  server: Koa$Koa;
  
  // routes:
  constructor(_port: number, _certFile?: string, _privateKeyFile?: string) {
    super();
    this.port = _port;
    this.server = new KoaServer();
  }

  applyRoutes() {
    for(let r of this.routes) {
      KoaServerRouter[r.verb](r.expression, (ctx, next) => {
        r.action(ctx.request, ctx.response);
      });
    }

    this.server
      .use(KoaServerRouter.routes())
      .use(KoaServerRouter.allowedMethods);
  }

  start() {
    // Depending on the observer's filter function, each observer will act or ignore any incoming web request.
    this.makeObserversAndSubscribeFromMiddlewares();

    // Defaults: 1 endpoint for POST/GET
    // TODO
    
    // Apply user-defined routes
    this.applyRoutes();

    // Start the server.
    // TODO
    this.server.listen(_port);
  }

  makeObserversAndSubscribeFromMiddlewares() {
    // No subscription, observers does nothing.
    // Create Observers that react to subscriber broadcast.
    for(let m of this.middlewares) {
      const o: rxweb$Observer = new rxweb$Observer(this.sub.get().asObservable(), m.filterFunc);
      o.subscribe(m.subscribeFunc);
    }

    // Last Observer is the one that will respond to client after all middlwares have been processed.
    const lastObserver: rxweb$Observer = new rxweb$Observer(this.sub.get().asObservable(), this.onNext.filterFunc);
    lastObserver.subscribe(this.onNext.subscribeFunc);
  }
}

declare module "rxweb" {
  declare var rxweb$Server: rxweb$Server;
  declare var rxweb$IServer: rxweb$IServer;
}
