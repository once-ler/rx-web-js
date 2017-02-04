/* @flow */

import { Subject as  RxSubject } from 'rxjs/Subject';
import 'rxjs/add/operator/publish';
import 'rxjs/add/operator/subscribeOn';
import { asap } from 'rxjs/scheduler/asap';
import type {rxweb$Task} from './rxweb';

export class rxweb$Subject {

  sub: RxSubject<rxweb$Task>;

  constructor() {
    this.sub = new RxSubject();
    this.sub
      .subscribeOn(asap)
      .publish();
  }

  get(): RxSubject<rxweb$Task> {
    return this.sub;
  }
}

declare module 'rxweb' {
  declare var Subject: rxweb$Subject;
}
