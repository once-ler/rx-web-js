/* @flow */

import { Subject as  RxSubject } from 'rxjs/Subject';
import 'rxjs/add/operator/publish';
import type {rxweb$Task} from './rxweb';

export class rxweb$Subject {

  sub: RxSubject<rxweb$Task>;

  constructor() {
    this.sub = new RxSubject();
    this.sub.publish();
  }

  get(): RxSubject<rxweb$Task> {
    return this.sub;
  }
}

declare module 'rxweb' {
  declare var Subject: rxweb$Subject;
}
