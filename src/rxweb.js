/* @flow */
/* eslint no-unused-expressions: 0,
  flowtype/no-weak-types: 0,
  flowtype/union-intersection-spacing: 0,
  max-len: 0
*/
import type { Store as RdxStore, Middleware as RdxMiddleware, Dispatch } from 'redux';
import isPlainObject from 'lodash/isPlainObject';
import { rxweb$Server } from './server';
import { rxweb$Client } from './client';

// Redux types
export type Redux$State = any;
export type Redux$Action = Object;
export type Redux$Store = RdxStore<Redux$State, Redux$Action>;
export type Redux$Middleware = RdxMiddleware<Redux$State, Redux$Action>;
export type Redux$Dispatch = Dispatch<Redux$Action>;

// Enum types
const socketTypes = { HTTP: 'HTTP', HTTPS: 'HTTPS' };
export type rxweb$SocketType = $Keys<typeof socketTypes>;
export const rxweb$HTTP: rxweb$SocketType = 'HTTP';
export const rxweb$HTTPS: rxweb$SocketType = 'HTTPS';

export type rxweb$FilterFunc = (task: rxweb$Task) => boolean;
export type rxweb$SubscribeFunc = (task: rxweb$Task) => void;

// Web server types
export type rxweb$Request = http$IncomingMessage & http$ClientRequest;
export type rxweb$Response = http$IncomingMessage &
  http$ClientRequest &
  http$ServerResponse &
  Koa$Response;
export type rxweb$SocketServer = net$Server | tls$Server;

// rxjs Subject.next | Redux dispatch
export type rxweb$NextAction = (value: Object) => mixed;

export class rxweb$Task {
  constructor(...params: any[]) {
    const [ arg0, arg1, arg2, arg3, arg4 ] = params;
    this.type = arg0;
    this.data = arg1;
    arg2 && (this.next = arg2);
    arg3 && (typeof arg3 === 'function') && (this.dispatch = arg3);
    arg3 && (typeof arg3 === 'object' && typeof arg4 !== 'undefined' && !isPlainObject(arg4)) && (this.request = arg3);
    arg3 && (typeof arg3 === 'object' && typeof arg4 === 'undefined') && (this.ctx = arg3);
    arg4 && isPlainObject(arg4) && (this.action = arg4);
    arg4 && !isPlainObject(arg4) && (this.response = arg4);
  }
  type: string;
  data: any;
  next: rxweb$NextAction;
  request: rxweb$Request;
  response: rxweb$Response;
  ctx: Koa$Context;
  dispatch: Redux$Dispatch;
  action: Redux$Action;
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
  _next: rxweb$NextAction,
  _request: rxweb$Request,
  _response: rxweb$Response
) => void;

export type rxweb$KoaAction = (
  _next: rxweb$NextAction,
  _ctx: Koa$Context
) => void;

export type rxweb$BrowserAction = (
  _next: rxweb$NextAction,
  _dispatch: Redux$Dispatch,
  _reduxAction: Redux$Action
) => void;

export class rxweb$Route {
  expression: string;
  verb: string;
  action: rxweb$WebAction & rxweb$BrowserAction & rxweb$KoaAction;
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

// re-export rxweb$Subject
export { rxweb$Subject } from './subject';

// re-export rxweb$KoaServer
export { rxweb$Server } from './server';

// re-export rxweb$ReduxClient
export { rxweb$Client } from './client';

declare module 'rxweb' {
  declare var FilterFunc: rxweb$FilterFunc;
  declare var SubscribeFunc: rxweb$SubscribeFunc;
  declare var Middleware: Class<rxweb$Middleware>;
  declare var SocketType: rxweb$SocketType;
  declare var SocketServer: rxweb$SocketServer;
  declare var Task: Class<rxweb$Task>;
  declare var Server: rxweb$Server;
  declare var Subject: rxweb$Subject;
  declare var Route: rxweb$Route;
  declare var ReduxStore: Redux$Store;
  declare var ReduxState: Redux$State;
  declare var ReduxAction: Redux$Action;
  declare var ReduxDispatch: Redux$Dispatch;
  declare var ReduxMiddleware: Redux$Middleware;
  declare var Client: rxweb$Client;
}
