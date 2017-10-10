/* @flow */
/* eslint no-unused-expressions: 0,
  flowtype/no-weak-types: 0,
  flowtype/union-intersection-spacing: 0,
  max-len: 0
*/
import type { Store as RdxStore, Middleware as RdxMiddleware, Dispatch, MiddlewareAPI } from 'redux';
import { rxweb$Subject } from './subject';
import { rxweb$Observer } from './observer';
import { rxweb$Proxy } from './proxy';

// Redux types
export type Redux$State = any;
export type Redux$Action = Object;
export type Redux$Store = RdxStore<Redux$State, Redux$Action>;
export type Redux$Middleware = RdxMiddleware<Redux$State, Redux$Action>;
export type Redux$Dispatch = Dispatch<Redux$Action>;
export type Redux$GetState = () => Redux$Store;

// Enum types
const socketTypes = { HTTP: 'HTTP', HTTPS: 'HTTPS' };
export type rxweb$SocketType = $Keys<typeof socketTypes>;
export const rxweb$HTTP: rxweb$SocketType = 'HTTP';
export const rxweb$HTTPS: rxweb$SocketType = 'HTTPS';

export type rxweb$FilterFunc = (task: rxweb$Task) => boolean;
export type rxweb$SubscribeFunc = (task: rxweb$Task) => void;
export type rxweb$PromiseFunc = (task: rxweb$Task) => Promise<rxweb$Task>;

// Web server types
export type rxweb$Request = http$IncomingMessage &
  http$ClientRequest;
export type rxweb$Response = http$IncomingMessage &
  http$ClientRequest &
  http$ServerResponse &
  Koa$Response;
export type rxweb$SocketServer = net$Server | tls$Server;
export type rxweb$Socket = net$Socket;
export type rxweb$Body = any;

// rxjs Subject.next()
export type rxweb$NextAction = (value: Object) => mixed;

export type rxweb$Task = {
  type: string;
  data: any;
  next: rxweb$NextAction;
  request: rxweb$Request;
  response: rxweb$Response;
  store: MiddlewareAPI<Redux$State, Redux$Action>;
  init: () => Redux$Dispatch;
  done: (data: Redux$Action) => Redux$Dispatch;
  error: (data: Redux$Action) => Redux$Dispatch;
};

export class rxweb$Middleware {
  constructor(...params: any[]) {
    const [ arg0, arg1, arg2 ] = params;
    (typeof arg0 === 'function') && (this.filterFunc = arg0);
    (typeof arg0 === 'string') && (this.type = arg0) && (this.filterFunc = task => task.type === arg0);
    !arg2 && (this.subscribeFunc = arg1);
    arg2 && (this.promiseFunc = arg1) && (this.subscribeFunc = arg2);
  }
  type: string;
  filterFunc: rxweb$FilterFunc;
  subscribeFunc: rxweb$SubscribeFunc;
  promiseFunc: rxweb$PromiseFunc;
}

// Browser client or server implementation
export type rxweb$WebAction = (
  _request: rxweb$Request,
  _response: rxweb$Response,
  _next: rxweb$NextAction
) => void;

export type rxweb$BrowserAction = (
  _dispatch: Redux$Dispatch,
  _reduxAction: Redux$Action,
  _next: rxweb$NextAction,
  _getState: Redux$GetState
) => void;

export class rxweb$Route {
  expression: string;
  verb: string;
  action: rxweb$WebAction & rxweb$BrowserAction
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

type rxweb$StaticOptions = {
  maxage: number;
  hidden: bool;
  index: string;
  defer: bool;
  gzip: bool;
  extensions: bool;
};

export class rxweb$Static {
  root: string = '.';
  options: rxweb$StaticOptions = {
    maxage: 0, hidden: false, index: 'index.html', defer: false, gzip: true, extensions: false
  };
  contructor(_root: string, _options?: rxweb$StaticOptions) {
    this.root = _root;
    this.options = { ...this.options, ..._options };
  }
}

export { rxweb$Subject } from './subject';
export { rxweb$Observer } from './observer';
export { rxweb$Proxy } from './proxy';

declare module 'rxweb' {
  declare var FilterFunc: rxweb$FilterFunc;
  declare var SubscribeFunc: rxweb$SubscribeFunc;
  declare var Middleware: Class<rxweb$Middleware>;
  declare var SocketType: rxweb$SocketType;
  declare var SocketServer: rxweb$SocketServer;
  declare var Socket: rxweb$Socket;
  declare var Body: rxweb$Body;
  declare var Task: Class<rxweb$Task>;
  declare var Observer: rxweb$Observer;
  declare var Subject: rxweb$Subject;
  declare var Route: rxweb$Route;
  declare var Proxy: rxweb$Proxy;
  declare var ReduxStore: Redux$Store;
  declare var ReduxState: Redux$State;
  declare var ReduxAction: Redux$Action;
  declare var ReduxDispatch: Redux$Dispatch;
  declare var ReduxMiddleware: Redux$Middleware;
  declare var ReduxGetState: Redux$GetState
}
