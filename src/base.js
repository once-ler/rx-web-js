/* @flow */
import type { rxweb$Task } from './rxweb';
import { WebSocketSubject } from 'rxjs/observable/dom/WebSocketSubject';
import { rxweb$Route, rxweb$Middleware } from './rxweb';
import { rxweb$Subject } from './subject';
import { rxweb$Observer } from './observer';

export class rxweb$Base {
  sub: rxweb$Subject;
  middlewares: Array<rxweb$Middleware> = [];
  routes: Array<rxweb$Route> = [];
  websocket: WebSocketSubject<any>;
 
  getSubject(): rxweb$Subject {
    return this.sub;
  }
  
  next(value: rxweb$Task): void {
    this.sub.get().next(value);
  }
  
  constructor() {
    this.sub = new rxweb$Subject();

    // https://github.com/facebook/flow/issues/1397
    (this: any).next = this.next.bind(this);
    (this: any).getSubject = this.getSubject.bind(this);
  }

  makeObserversAndSubscribeFromMiddlewares() {
    // No subscription, observers does nothing.
    // Create Observers that react to subscriber broadcast.
    for (const m of this.middlewares) {
      const o: rxweb$Observer = new rxweb$Observer(
        this.sub.get().asObservable(),
        m.filterFunc,
        m.promiseFunc
      );
      o.subscribe(m.subscribeFunc);
    }
  }
}
