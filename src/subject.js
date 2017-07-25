/* @flow */

import { Subject as RxSubject } from 'rxjs/Subject';
import webSocket from 'rxjs/observable/dom/webSocket';
import WebSocketSubject from 'rxjs/observable/dom/WebSocketSubject';
import 'rxjs/add/operator/publish';
import type {rxweb$Task} from './rxweb';

type funcArg = {useWebSocket?: boolean, url?: string};

export class rxweb$Subject {

  sub: RxSubject<rxweb$Task> | WebSocketSubject<rxweb$Task>;

  constructor({useWebSocket, url}: funcArg = {}) {
    if (useWebSocket) this.sub = webSocket.create(url);
    else this.sub = new RxSubject();
    this.sub.publish();
  }

  get(): RxSubject<rxweb$Task> {
    return this.sub;
  }
}

declare module 'rxweb' {
  declare var Subject: rxweb$Subject | WebSocketSubject<rxweb$Task>;
}
