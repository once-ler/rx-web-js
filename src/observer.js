/* @flow */

import {Observable, Subscription, Scheduler} from 'rxjs';
import typeof { rxweb$HTTP, rxweb$HTTPS } from './rxweb';
import type {rxweb$SocketType, rxweb$Task, rxweb$FilterFunc} from './rxweb';

export class rxweb$Observer<rxweb$SocketType> {
  _observer: Observable<rxweb$Task<rxweb$SocketType>>;

  constructor(o: Observable<rxweb$Task<rxweb$SocketType>>, filterFunc: rxweb$FilterFunc<rxweb$SocketType>) {
    this._observer = o
      .observeOn(Scheduler.queue)
      .filter(filterFunc);
  }

  observable(): Observable<rxweb$Task<rxweb$SocketType>> {
    return this._observer;
  }

  subscribe(
    onNext: ?(value: rxweb$Task<rxweb$SocketType>) => mixed,
    onError: ?(error: any) => mixed,
    onCompleted: ?() => mixed
  ) {
    this._observer.subscribe(onNext, onError, onCompleted);
  }
}

export class rxweb$HttpObserver extends rxweb$Observer<rxweb$HTTP> {
  constructor(o: Observable<rxweb$Task<rxweb$HTTP>>, filterFunc: rxweb$FilterFunc<rxweb$HTTP>) {
    super(o, filterFunc);
  }
}

export class rxweb$HttpsObserver extends rxweb$Observer<rxweb$HTTPS> {
  constructor(o: Observable<rxweb$Task<rxweb$HTTPS>>, filterFunc: rxweb$FilterFunc<rxweb$HTTPS>) {
    super(o, filterFunc);
  }
}

declare module "rxweb" {
  declare var rxweb$Observer: rxweb$Observer<rxweb$SocketType>;
  declare var rxweb$HttpObserver: rxweb$HttpObserver;
  declare var rxweb$HttpsObserver: rxweb$HttpsObserver;
}
