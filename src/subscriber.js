/* @flow */
/* eslint no-unused-vars: 0 */
import {Subscription, Scheduler} from 'rxjs';
import RxSubscriber from 'rxjs/Subscriber';
import type {rxweb$Task } from './rxweb';

export class rxweb$Subscriber {
  create(
      value: (o: rxweb$Task) => void,
      error?: (e?: any) => void,
      complete?: () => void
    ) {
    return new RxSubscriber(value, error, complete);
  }
}

declare module 'rxweb' {
  declare var Subscriber: rxweb$Subscriber;
}
