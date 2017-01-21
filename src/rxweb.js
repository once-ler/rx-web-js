/* @flow */
/* eslint no-unused-expressions: 0,
  flowtype/no-weak-types: 0,
  flowtype/union-intersection-spacing: 0,
  max-len: 0
*/
import type { Store as RdxStore, Middleware as RdxMiddleware, Dispatch } from 'redux';
import isPlainObject from 'lodash/isPlainObject';
import { rxweb$Subject } from './subject';
import { rxweb$Observer } from './observer';

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

// Web server types
export type rxweb$Request = http$IncomingMessage &
  http$ClientRequest &
  Redux$Action;
export type rxweb$Response = http$IncomingMessage &
  http$ClientRequest &
  http$ServerResponse &
  Koa$Response &
  Redux$Dispatch;
export type rxweb$SocketServer = net$Server | tls$Server;

// rxjs Subject.next | Redux dispatch
export type rxweb$NextAction = (value: Object) => mixed;

/*
export class rxweb$Task {
  constructor(...params: any[]) {
    const [ arg0, arg1, arg2, arg3, arg4, arg5 ] = params;
    this.type = arg0;
    // this.data = arg1;
    arg1 && (this.next = arg1);
    arg2 && (this.request = arg2);
    arg3 && (this.response = arg3);
    // arg3 && (typeof arg3 === 'function') && (this.dispatch = arg3);
    // arg3 && (typeof arg3 === 'object') && (this.request = arg3);
    // arg4 && isPlainObject(arg4) && (this.action = arg4);
    // arg4 && !isPlainObject(arg4) && (this.response = arg4);
    arg4 && (this.getState = arg4);
  }
  type: string;
  data: any;
  next: rxweb$NextAction;
  request: rxweb$Request;
  response: rxweb$Response;
  // dispatch: Redux$Dispatch;
  // action: Redux$Action;
  getState: () => Redux$Store;
}
*/

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

// re-export rxweb$Subject
export { rxweb$Subject } from './subject';
export { rxweb$Observer } from './observer';

// re-export rxweb$KoaServer
// export { rxweb$Server } from './server';

// re-export rxweb$ReduxClient
// export { rxweb$Client } from './client';

declare module 'rxweb' {
  declare var FilterFunc: rxweb$FilterFunc;
  declare var SubscribeFunc: rxweb$SubscribeFunc;
  declare var Middleware: Class<rxweb$Middleware>;
  declare var SocketType: rxweb$SocketType;
  declare var SocketServer: rxweb$SocketServer;
  declare var Task: Class<rxweb$Task>;
  // declare var Server: rxweb$Server;
  declare var Observer: rxweb$Observer;
  declare var Subject: rxweb$Subject;
  declare var Route: rxweb$Route;
  declare var ReduxStore: Redux$Store;
  declare var ReduxState: Redux$State;
  declare var ReduxAction: Redux$Action;
  declare var ReduxDispatch: Redux$Dispatch;
  declare var ReduxMiddleware: Redux$Middleware;
  declare var ReduxGetState: Redux$GetState
  // declare var Client: rxweb$Client;
}
