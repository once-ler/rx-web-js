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
      .mergeMap((task: rxweb$Task) => {
        const request: Promise<rxweb$Task> = promiseFunc(task)
          .then(data => {
            // Update store with <action.type>_SUCCESS.
            if (task.done)
              task.done(data);
            return { ...task, ...data };
          })
          .catch(data => {
            // Update store with <action.type>_ERROR.
            if (task.error)
              task.error(data);
            return { ...task, ...data };
          });         

        return Observable
          .fromPromise(request)
          .catch(data => {
            // Update store with <action.type>_ERROR.
            if (task.error)
              task.error(data);
            return Observable.of({ ...task, ...data });
          });
      });
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
      .subscribe(onNext, onError, onCompleted);
  }
}

declare module 'rxweb' {
  declare var Observer: rxweb$Observer;
}
