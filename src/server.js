/* @flow */

import typeof { rxweb$HTTP, rxweb$HTTPS } from './rxweb';
import type {
  rxweb$SocketType,
  rxweb$Task,
  rxweb$Middleware,
  rxweb$FilterFunc,
  rxweb$SubscribeFunc
} from './rxweb';
import {rxweb$Observer} from './observer';
import {rxweb$Subscriber} from './subscriber';
import {rxweb$Subject} from './subject';

export class rxweb$Server<T: rxweb$SocketType> {
  sub: rxweb$Subject<T>;
  middlewares: Array<rxweb$Middleware<rxweb$SocketType>>;
  onNext: rxweb$Middleware<rxweb$SocketType>;
  // routes:
  constructor(_port: number, _certFile?: string, _privateKeyFile?: string) {

  }

  applyRoutes() {

  }

  getSubject(): rxweb$Subject<T> {
    return this.sub;
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
  }

  makeObserversAndSubscribeFromMiddlewares() {

  }
}

export class rxweb$HttpServer extends rxweb$Server<rxweb$HTTP> {
  constructor(_port: number) {
    super(_port);
  }
}

export class rxweb$HttpsServer extends rxweb$Server<rxweb$HTTPS> {
  constructor(_port: number, _certFile: string, _privateKeyFile: string) {
    super(_port, _certFile, _privateKeyFile);
  }
}

declare module "rxweb" {
  declare var rxweb$Server: rxweb$Server<rxweb$SocketType>;
  declare var rxweb$HttpServer: rxweb$HttpServer;
  declare var rxweb$HttpsServer: rxweb$HttpsServer;
}
