/* @flow */

const socketTypes = { HTTP: 'HTTP', HTTPS: 'HTTPS' };
export type rxweb$SocketType = $Keys<typeof socketTypes>;
export const rxweb$HTTP: rxweb$SocketType = 'HTTP';
export const rxweb$HTTPS: rxweb$SocketType = 'HTTPS';

export type rxweb$FilterFunc = (task: rxweb$Task) => boolean;
export type rxweb$SubscribeFunc = (task: rxweb$Task) => void;

export type rxweb$Request = http$IncomingMessage | http$ClientRequest;
export type rxweb$Response = http$IncomingMessage | http$ClientRequest | http$ServerResponse;

export class rxweb$Task {
  constructor(_request?: rxweb$Request, _response?: rxweb$Response) {
    _request && (this.request = _request);
    _response && (this.response = _response);
  }
  request: rxweb$Request;
  response: rxweb$Response;
  data: ?(string|Buffer|stream$Duplex|Object|Array<*>|number|bool);
  type: string;
}

export class rxweb$Middleware {
  constructor(_filterFunc?: rxweb$FilterFunc, _subscribeFunc?: rxweb$SubscribeFunc) {
    _filterFunc && (this.filterFunc = _filterFunc);
    _subscribeFunc && (this.subscribeFunc = _subscribeFunc);
  }
  filterFunc: rxweb$FilterFunc;
  subscribeFunc: rxweb$SubscribeFunc;
}

declare module "rxweb" {
  declare var rxweb$SocketType: rxweb$SocketType;
  declare var rxweb$Task: Class<rxweb$Task>;
  declare var rxweb$Middleware: Class<rxweb$Middleware>; 
  declare var rxweb$FilterFunc: rxweb$FilterFunc;
  declare var rxweb$SubscribeFunc: rxweb$SubscribeFunc;
}
