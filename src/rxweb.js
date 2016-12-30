/* @flow */
/* eslint no-unused-expressions: 0,
  flowtype/no-weak-types: 0,
  flowtype/union-intersection-spacing: 0,
  max-len: 0
*/
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

export class rxweb$Task {
  constructor(
    _type: string = 'INITIAL',
    _data: any = {},
    _request?: rxweb$Request,
    _response?: rxweb$Response
  ) {
    _request && (this.request = _request);
    _response && (this.response = _response);
    this.type = _type;
    this.data = _data;
  }
  type: string;
  data: any;
  request: rxweb$Request;
  response: rxweb$Response;
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
