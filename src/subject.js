/* @flow */

import {Subject as RxSubject, Scheduler} from 'rxjs';
import type {rxweb$Task} from './rxweb';

export class rxweb$Subject {

  sub: RxSubject<rxweb$Task>;

  constructor() {
    this.sub = new RxSubject();
    this.sub
      .subscribeOn(Scheduler.queue)
      .publish();
  }

  get(): RxSubject<rxweb$Task> {
    return this.sub;
  }
}

declare module "rxweb" {
  declare var Subject: rxweb$Subject;
}
