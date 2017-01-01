/* @flow */
/**
 *  Copyright (c) 2015, Facebook, Inc.
 *  All rights reserved.
 *
 *  This source code is licensed under the BSD-style license found in the
 *  LICENSE file in the root directory of this source tree. An additional grant
 *  of patent rights can be found in the PATENTS file in the same directory.
 */

// 80+ char lines are useful in describe/it, so ignore in this file.
/* eslint-disable max-len */
import request from 'supertest-as-promised';
import { describe, it } from 'mocha';
import should from 'should';

import type {
  rxweb$FilterFunc,
  rxweb$SubscribeFunc,
  Redux$Middleware,
  Redux$Store,
  Redux$State,
  Redux$Action
} from '../rxweb';

import {
  rxweb$Task,
  rxweb$Middleware,
  rxweb$Subject,
  rxweb$Server,
  rxweb$Route
} from '../rxweb';

function promiseTo(fn) {
  return new Promise((resolve, reject) => {
    fn((error, result) => error ? reject(error) : resolve(result));
  });
}

describe('test harness', () => {

  it('resolves callback promises', async () => {
    const resolveValue = {};
    const result = await promiseTo(cb => cb(null, resolveValue));
    expect(result).to.equal(resolveValue);
  });

  it('rejects callback promises with errors', async () => {
    const rejectError = new Error();
    let caught;
    try {
      await promiseTo(cb => cb(rejectError));
    } catch (error) {
      caught = error;
    }
    expect(caught).to.equal(rejectError);
  });

});

decribe('can create koa server', () => {

  it('resolves to an instance of rxweb$Server', () =>{
    const server = new rxweb$Server(3000);

    server.should.be.an.instanceOf(Object);
  });

});
