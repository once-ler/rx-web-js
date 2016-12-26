/* @flow */

import {Subscription, Scheduler} from 'rxjs';
import Subscriber from 'rxjs/Subscriber';
import type {rxweb$Task } from './rxweb';

export class rxweb$Subscriber {
  create(
      value: (o: rxweb$Task) => void,
      error?: (e?: any) => void,
      complete?: () => void
    ) {
    return new Subscriber(value, error, complete);
  }
}

declare module "rxweb" {
  declare var rxweb$Subscriber: rxweb$Subscriber;
}
