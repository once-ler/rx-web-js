/* @flow */

import {Subject as RxSubject, Scheduler} from 'rx-lite';
import type {rxweb$Task} from './rxweb';

export class rxweb$Subject {

  sub: RxSubject<rxweb$Task>;

  constructor() {
    this.sub = new RxSubject();
    this.sub
      .subscribeOn(Scheduler.asap)
      .publish();
  }

  get(): RxSubject<rxweb$Task> {
    return this.sub;
  }
}

declare module 'rxweb' {
  declare var Subject: rxweb$Subject;
}
