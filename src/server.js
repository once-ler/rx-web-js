/* @flow */
/* eslint no-unused-vars: 0, max-len: 0, flowtype/no-weak-types: 0, no-unused-expressions: 0, curly: 0, no-console: 0 */
import KoaServer from 'koa';
import KoaServerRouter from 'koa-router';
import KoaServerBodyParser from 'koa-bodyparser';
import type {
  rxweb$Task,
  rxweb$Request,
  rxweb$Response,
  rxweb$Route,
  rxweb$SocketServer,
  rxweb$NextAction,
  rxweb$FilterFunc,
  rxweb$SubscribeFunc
} from './rxweb';
import { rxweb$Subject, rxweb$Observer, rxweb$Middleware } from './rxweb';
import { rxweb$Base } from './base';

class rxweb$Server extends rxweb$Base {
  server: Koa$Koa;
  port: number;
  listener: rxweb$SocketServer;
  
  constructor(_port?: number = 3000) {
    super();
    
    (this: any).getServer = this.getServer.bind(this);

    _port && (this.port = _port);
    this.server = new KoaServer();
  }

  getServer(): rxweb$SocketServer {
     return this.listener;
  }

  applyRoutes() {
    this.server.use(KoaServerBodyParser());

    const router = new KoaServerRouter();
    for (const r of this.routes) {
      router[r.verb.toLowerCase()](r.expression, ctx => {
        r.action(ctx.request, ctx.response, this.next);
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

    // Start the server.
    this.listener = this.server.listen(this.port);
    if (!process.env.NODE_ENV || !process.env.NODE_ENV.production) {
      console.log(`Listening on port ${this.port}`);
    }
  }

  stop(callback?: Function) {
    this.listener && (this.listener.close(callback));
  }
}

export class rxweb$HttpsServer extends rxweb$Server {
  constructor(_port: number = 3000, _certFile: string, _privateKeyFile: string) {
    super(_port);
  }
}

export { rxweb$Server as Server };

export {
  rxweb$Middleware as Middleware,
  rxweb$Route as Route,
  rxweb$Subject as Subject,
  rxweb$Observer as Observer,
  rxweb$Task as Task
} from './rxweb';

declare module 'rxweb' {
  declare var Subject: rxweb$Subject;
  declare var Observer: rxweb$Observer;
  declare var Route: rxweb$Route;
  declare var FilterFunc: rxweb$FilterFunc;
  declare var SubscribeFunc: rxweb$SubscribeFunc;
  declare var Middleware: Class<rxweb$Middleware>;
  declare var Task: Class<rxweb$Task>;
  declare var Server: rxweb$Server;
}
