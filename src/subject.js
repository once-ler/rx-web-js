/* @flow */

import {Subject, Scheduler} from 'rxjs';
import type {rxweb$Task} from './rxweb';

export class rxweb$Subject {

  sub: Subject<rxweb$Task>;

  constructor() {
    this.sub = new Subject();
    this.sub
      .subscribeOn(Scheduler.queue)
      .publish();
  }

  get(): Subject<rxweb$Task> {
    return this.sub;
  }
}

declare module "rxweb" {
  declare var rxweb$Subject: rxweb$Subject;
}
