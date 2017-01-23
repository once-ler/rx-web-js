/* @flow */
/* eslint no-unused-expressions: 0,
  flowtype/no-weak-types: 0,
  flowtype/union-intersection-spacing: 0,
  max-len: 0
*/
import type { Store as RdxStore, Middleware as RdxMiddleware, Dispatch } from 'redux';
import { rxweb$Subject } from './subject';
import { rxweb$Observer } from './observer';

// Redux types
export type Redux$State = any;
export type Redux$Action = Object;
export type Redux$Store = RdxStore<Redux$State, Redux$Action>;
export type Redux$Middleware = RdxMiddleware<Redux$State, Redux$Action>;
export type Redux$Dispatch = Dispatch<Redux$Action>;
export type Redux$GetState = () => Redux$Store;
export type Redux$Request = {
  url?: string,
  body: Redux$Action
}
export type Redux$Response = {
  browser: boolean,
  send: Redux$Dispatch
};

// Enum types
const socketTypes = { HTTP: 'HTTP', HTTPS: 'HTTPS' };
export type rxweb$SocketType = $Keys<typeof socketTypes>;
export const rxweb$HTTP: rxweb$SocketType = 'HTTP';
export const rxweb$HTTPS: rxweb$SocketType = 'HTTPS';

export type rxweb$FilterFunc = (task: rxweb$Task) => boolean;
export type rxweb$SubscribeFunc = (task: rxweb$Task) => void;

// Web server types
export type rxweb$Request = http$IncomingMessage &
  http$ClientRequest &
  Redux$Request;
export type rxweb$Response = http$IncomingMessage &
  http$ClientRequest &
  http$ServerResponse &
  Koa$Response &
  Redux$Response;
export type rxweb$SocketServer = net$Server | tls$Server;

// rxjs Subject.next | Redux dispatch
export type rxweb$NextAction = (value: Object) => mixed;

export type rxweb$Task = {
  type: string;
  data: any;
  next: rxweb$NextAction;
  request: rxweb$Request;
  response: rxweb$Response;
  getState: Redux$GetState;
}

export class rxweb$Middleware {
  constructor(
    _filterFunc?: rxweb$FilterFunc,
    _subscribeFunc?: rxweb$SubscribeFunc
  ) {
    _filterFunc && (this.filterFunc = _filterFunc);
    _subscribeFunc && (this.subscribeFunc = _subscribeFunc);
  }
  filterFunc: rxweb$FilterFunc;
  subscribeFunc: rxweb$SubscribeFunc;
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

export { rxweb$Subject } from './subject';
export { rxweb$Observer } from './observer';

declare module 'rxweb' {
  declare var FilterFunc: rxweb$FilterFunc;
  declare var SubscribeFunc: rxweb$SubscribeFunc;
  declare var Middleware: Class<rxweb$Middleware>;
  declare var SocketType: rxweb$SocketType;
  declare var SocketServer: rxweb$SocketServer;
  declare var Task: Class<rxweb$Task>;
  declare var Observer: rxweb$Observer;
  declare var Subject: rxweb$Subject;
  declare var Route: rxweb$Route;
  declare var ReduxStore: Redux$Store;
  declare var ReduxState: Redux$State;
  declare var ReduxAction: Redux$Action;
  declare var ReduxDispatch: Redux$Dispatch;
  declare var ReduxMiddleware: Redux$Middleware;
  declare var ReduxGetState: Redux$GetState
}
