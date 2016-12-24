/* @flow */

import {Observable, Subscription, Scheduler} from 'rxjs';
import type {rxweb$SocketType, rxweb$FilterFunc} from './rxweb';
import type { rxweb$Task } from './rxweb';

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

declare module "rxweb" {
  declare var rxweb$Observer: rxweb$Observer<rxweb$SocketType>; 
}
