/* @flow */

const socketTypes = { HTTP: 'HTTP', HTTPS: 'HTTPS' };
export type rxweb$SocketType = $Keys<typeof socketTypes>;
export const rxweb$HTTP: rxweb$SocketType = 'HTTP';
export const rxweb$HTTPS: rxweb$SocketType = 'HTTPS';

export type rxweb$FilterFunc<rxweb$SocketType> = (task: rxweb$Task<rxweb$SocketType>) => boolean;
export type rxweb$SubscribeFunc<rxweb$SocketType> = (task: rxweb$Task<rxweb$SocketType>) => void;

export class rxweb$Task<rxweb$SocketType> {
  constructor(_request?: Koa$Request, _response?: Koa$Response) {
    _request && (this.request = _request);
    _response && (this.response = _response);
  }
  request: Koa$Request;
  response: Koa$Response;
  data: ?(string|Buffer|stream$Duplex|Object|Array<*>|number|bool);
  type: string;
}

export class rxweb$Middleware<rxweb$SocketType> {
  constructor(_filterFunc?: rxweb$FilterFunc<rxweb$SocketType>, _subscribeFunc?: rxweb$SubscribeFunc<rxweb$SocketType>) {
    _filterFunc && (this.filterFunc = _filterFunc);
    _subscribeFunc && (this.subscribeFunc = _subscribeFunc);
  }
  filterFunc: rxweb$FilterFunc<rxweb$SocketType>;
  subscribeFunc: rxweb$SubscribeFunc<rxweb$SocketType>;
}

export class rxweb$HttpTask extends rxweb$Task<typeof rxweb$HTTP> {
  constructor(_request?: Koa$Request, _response?: Koa$Response) {
    super(_request, _response);
  }  
}
export class rxweb$HttpsTask extends rxweb$Task<typeof rxweb$HTTPS> {
  constructor(_request?: Koa$Request, _response?: Koa$Response) {
    super(_request, _response);
  }  
}

export class rxweb$HttpMiddleware extends rxweb$Middleware<typeof rxweb$HTTP> {
  constructor(_filterFunc: rxweb$FilterFunc<typeof rxweb$HTTP>, _subscribeFunc: rxweb$SubscribeFunc<typeof rxweb$HTTP>) {
    super(_filterFunc, _subscribeFunc);
  }  
}
export class rxweb$HttpsMiddleware extends rxweb$Middleware<typeof rxweb$HTTPS> {
  constructor(_filterFunc: rxweb$FilterFunc<typeof rxweb$HTTPS>, _subscribeFunc: rxweb$SubscribeFunc<typeof rxweb$HTTPS>) {
    super(_filterFunc, _subscribeFunc);
  }  
}

declare module "rxweb" {
  declare var rxweb$SocketType: rxweb$SocketType;
  declare var rxweb$Task: Class<rxweb$Task<typeof rxweb$SocketType>>;
  declare var rxweb$Middleware: Class<rxweb$Middleware<typeof rxweb$SocketType>>; 
  declare var rxweb$FilterFunc: rxweb$FilterFunc<typeof rxweb$SocketType>;
  declare var rxweb$SubscribeFunc: rxweb$SubscribeFunc<typeof rxweb$SocketType>;
  declare var rxweb$HttpTask: Class<rxweb$HttpTask>;
  declare var rxweb$HttpsTask: Class<rxweb$HttpsTask>;
  declare var rxweb$HttpMiddleware: Class<rxweb$HttpMiddleware>;
  declare var rxweb$HttpsMiddleware: Class<rxweb$HttpsMiddleware>;
}
