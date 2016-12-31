/* @flow */
/* eslint no-unused-expressions: 0,
  flowtype/no-weak-types: 0,
  flowtype/union-intersection-spacing: 0,
  max-len: 0
*/
import type { Store as ReduxStore, Middleware, Dispatch } from 'redux';

// Redux types
export type Redux$State = any;
export type Redux$Action = Object;
export type Redux$Store = ReduxStore<Redux$State, Redux$Action>;
export type Redux$Middleware = Middleware<Redux$State, Redux$Action>;
export type Redux$Dispatch = Dispatch<Redux$Action>;

// Enum types
const socketTypes = { HTTP: 'HTTP', HTTPS: 'HTTPS' };
export type rxweb$SocketType = $Keys<typeof socketTypes>;
export const rxweb$HTTP: rxweb$SocketType = 'HTTP';
export const rxweb$HTTPS: rxweb$SocketType = 'HTTPS';

export type rxweb$FilterFunc = (task: rxweb$Task) => boolean;
export type rxweb$SubscribeFunc = (task: rxweb$Task) => void;

export type rxweb$Request = http$IncomingMessage & http$ClientRequest;
export type rxweb$Response = http$IncomingMessage &
  http$ClientRequest &
  http$ServerResponse &
  Koa$Response;

export interface rxweb$ITask {
  type: string;
  data: any;
  request?: rxweb$Request;
  response?: rxweb$Response;
}

export type rxweb$NextAction = (value: rxweb$ITask) => mixed | Redux$Dispatch;

export class rxweb$Task {
  constructor(
    _type: string = 'INITIAL',
    _data: any = {},
    _next?: rxweb$NextAction,
    _request?: ?rxweb$Request,
    _response?: ?rxweb$Response    
  ) {
    _request && (this.request = _request);
    _response && (this.response = _response);
    _next && (this.next = _next);
    this.type = _type;
    this.data = _data;
  }
  type: string;
  data: any;
  request: rxweb$Request;
  response: rxweb$Response;
  next: rxweb$NextAction;
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

declare module 'rxweb' {
  declare var SocketType: rxweb$SocketType;
  declare var Task: Class<rxweb$Task>;
  declare var Middleware: Class<rxweb$Middleware>;
  declare var FilterFunc: rxweb$FilterFunc;
  declare var SubscribeFunc: rxweb$SubscribeFunc;
}
