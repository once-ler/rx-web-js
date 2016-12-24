/* @flow */

import {Subject, Scheduler} from 'rxjs';
import typeof { rxweb$HTTP, rxweb$HTTPS } from './rxweb';
import type {rxweb$SocketType, rxweb$Task} from './rxweb';

export class rxweb$Subject<rxweb$SocketType> {

  sub: Subject<rxweb$Task<rxweb$SocketType>>;

  constructor() {
    this.sub = new Subject();
    this.sub
      .subscribeOn(Scheduler.queue)
      .publish();
  }

  get(): Subject<rxweb$Task<rxweb$SocketType>> {
    return this.sub;
  }
}

export class rxweb$HttpSubject extends rxweb$Subject<rxweb$HTTP> {
  constructor() {
    super();
  }
}

export class rxweb$HttpsSubject extends rxweb$Subject<rxweb$HTTPS> {
  constructor() {
    super();
  }
}

declare module "rxweb" {
  declare var rxweb$Subject: rxweb$Subject<rxweb$SocketType>;
  declare var rxweb$HttpSubject: rxweb$HttpSubject;
  declare var rxweb$HttpsSubject: rxweb$HttpsSubject;
}
