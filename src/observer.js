/* @flow */

import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/mergeMap';
import 'rxjs/add/operator/filter';
import 'rxjs/add/observable/of';
import type {rxweb$Task, rxweb$FilterFunc, rxweb$PromiseFunc} from './rxweb';

export class rxweb$Observer {
  _observer: Observable<rxweb$Task>;

  constructor(o: Observable<rxweb$Task>, filterFunc: rxweb$FilterFunc, promiseFunc?: rxweb$PromiseFunc) {
    const o$ = o
      // .observeOn(Scheduler.queue)
      .filter(filterFunc);

    if (typeof promiseFunc === 'undefined') {
      return this._observer = o$;
    }

    this._observer = o$
      .mergeMap(promiseFunc);
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
        typeof task.response !== 'undefined' && !task.response.hasOwnProperty('browser') ?
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
