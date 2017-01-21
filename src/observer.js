/* @flow */

// import {Observable, Scheduler} from 'rx-lite';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/mergeMap';
import 'rxjs/add/operator/filter';
import 'rxjs/add/observable/of';
import type {rxweb$Task, rxweb$FilterFunc} from './rxweb';

export class rxweb$Observer {
  _observer: Observable<rxweb$Task>;

  constructor(o: Observable<rxweb$Task>, filterFunc: rxweb$FilterFunc) {
    this._observer = o
      // .observeOn(Scheduler.queue)
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
    this._observer
      .mergeMap(task =>
        task.hasOwnProperty('response') ?
        Observable.of(task) :
        new Promise(resolve =>
          setTimeout(() => resolve(task), Math.random() * 30)
        )
      )
      .subscribe(onNext, onError, onCompleted);
  }
}

declare module 'rxweb' {
  declare var Observer: rxweb$Observer;
}
