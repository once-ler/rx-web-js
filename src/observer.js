/* @flow */

import {Observable, Scheduler} from 'rxjs';
import type {rxweb$Task, rxweb$FilterFunc} from './rxweb';

export class rxweb$Observer {
  _observer: Observable<rxweb$Task>;

  constructor(o: Observable<rxweb$Task>, filterFunc: rxweb$FilterFunc) {
    this._observer = o
      .observeOn(Scheduler.asap)
      .filter(filterFunc);
  }

  observable(): Observable<rxweb$Task> {
    return this._observer;
  }

  subscribe(
    onNext: ?(value: rxweb$Task) => mixed,
    onError: ?(error: any) => mixed,
    onCompleted: ?() => mixed
  ) {
    this._observer.subscribe(onNext, onError, onCompleted);
  }
}

declare module 'rxweb' {
  declare var Observer: rxweb$Observer;
}
