/* @flow */

import {Subscription, Scheduler} from 'rxjs';
import Subscriber from 'rxjs/Subscriber';
import typeof { rxweb$HTTP, rxweb$HTTPS } from './rxweb';
import type {rxweb$SocketType, rxweb$Task } from './rxweb';

export class rxweb$Subscriber<rxweb$SocketType> {
  create(
      value: (o: rxweb$Task<rxweb$SocketType>) => void,
      error?: (e?: any) => void,
      complete?: () => void
    ) {
    return new Subscriber(value, error, complete);
  }
}

export class rxweb$HttpSubscriber extends rxweb$Subscriber<rxweb$HTTP> {
  constructor() {
    super();
  }
}

export class rxweb$HttpsSubscriber extends rxweb$Subscriber<rxweb$HTTPS> {
  constructor() {
    super();
  }
}

declare module "rxweb" {
  declare var rxweb$Subscriber: rxweb$Subscriber<rxweb$SocketType>;
  declare var rxweb$HttpSubscriber: rxweb$HttpSubscriber;
  declare var rxweb$HttpsSubscriber: rxweb$HttpsSubscriber;
}
