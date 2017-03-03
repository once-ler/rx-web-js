/* @flow */
/* eslint curly: 0 */

import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/mergeMap';
import 'rxjs/add/operator/filter';
import 'rxjs/add/observable/fromPromise';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import 'rxjs/add/observable/of';
import type {rxweb$Task, rxweb$FilterFunc, rxweb$PromiseFunc} from './rxweb';

export class rxweb$Observer {
  _observer: Observable<rxweb$Task>;

  constructor(o: Observable<rxweb$Task>, filterFunc: rxweb$FilterFunc, promiseFunc: rxweb$PromiseFunc) {
    const o$ = o.filter(filterFunc);

    if (typeof promiseFunc === 'undefined') {
      return this._observer = o$;
    }

    this._observer = o$
      .mergeMap((task: rxweb$Task) =>
        Observable.fromPromise(promiseFunc(task))
          .map(data => {
            // Update store with <action.type>_SUCCESS.
            const resp = { ...task, ...data };
            if (task.done)
              task.done(resp);
            return Observable.of(resp);
          })
          .catch((e) => {
            // Update store with <action.type>_ERROR.
            // For axios: https://github.com/mzabriskie/axios/blob/master/UPGRADE_GUIDE.md#error-handling
            const { message, code, response } = e;
            const resp = { ...task, ...e, message, code, response };
            if (task.error)
              task.error(resp);
            return Observable.of(resp);
          })
      );
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
      .subscribe(onNext, onError || (e => console.error(e)), onCompleted);
  }
}

declare module 'rxweb' {
  declare var Observer: rxweb$Observer;
}
