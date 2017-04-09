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
        if (task.init)
          task.init();

        return Observable.fromPromise(promiseFunc(task))
          .mergeMap(result => {
            // Update store with <action.type>_SUCCESS.
            let resp;
            const finalize = () => {
              const {data, errors, ...rest} = resp;
              if (task.done && typeof errors === 'undefined')
                task.done(typeof data === 'object' ? {...rest, ...data} : resp);

              if (typeof errors === 'object' && task.error)
                task.error({...rest, errors});
            };

            // axios.Response: result.data
            if (typeof result.headers === 'object' && typeof result.data === 'object') {
              if (Object.prototype.toString.call(result.data) === '[object Array]')
                resp = { ...task, data: result };
              else
                resp = { ...task, ...result.data };
              
              finalize();
              return Observable.of(resp);
            }

            // fetch.Response: result.json
            if (result instanceof Response) {
              // https://developer.mozilla.org/en-US/docs/Web/API/Body/bodyUsed
              const clonedResult = result.clone();

              result.json()
                .then(d => {
                  resp = { ...task, data: d };
                  finalize();
                });

              // result.json() returns a promise; so we return Observable of original result to next Observer.              
              return Observable.of({...task, response: clonedResult});
            } else {
              // Default
              resp = { ...task, data: result };
              finalize();
              return Observable.of(resp);
            }        
          })
          .catch((e) => {
            // Update store with <action.type>_ERROR.
            // For axios: https://github.com/mzabriskie/axios/blob/master/UPGRADE_GUIDE.md#error-handling
            let resp;
            const { message, code, response } = e;
            if (typeof message !== undefined || typeof response !== undefined)
              resp = {...task, message, code, response};
            else
              resp = { ...task, ...e };
            if (task.error)
              task.error(resp);
            return Observable.of(resp);
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
      .subscribe(onNext, onError || (e => console.error(e)), onCompleted);
  }
}

declare module 'rxweb' {
  declare var Observer: rxweb$Observer;
}
