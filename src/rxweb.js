/* @flow */
/* eslint no-unused-expressions: 0,
  flowtype/no-weak-types: 0,
  flowtype/union-intersection-spacing: 0,
  max-len: 0
*/
import type { Store as RdxStore, Middleware as RdxMiddleware, Dispatch } from 'redux';
import isPlainObject from 'lodash/isPlainObject';
import { rxweb$Subject } from './subject';
import { rxweb$Server, rxweb$Route } from './server';

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
    arg3 && (typeof arg3 === 'object') && (this.request = arg3);
    arg4 && isPlainObject(arg4) && (this.action = arg4);
    arg4 && !isPlainObject(arg4) && (this.response = arg4);
  }
  type: string;
  data: any;
  next: rxweb$NextAction;
  request: rxweb$Request;
  response: rxweb$Response;
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

// re-export rxweb$Subject
export { rxweb$Subject } from './subject';

// re-export rxweb$Server
export { rxweb$Server, rxweb$Route } from './server';

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
}
