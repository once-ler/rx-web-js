/* eslint-disable max-len */
import request from 'supertest';
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
    result.should.be.equal(resolveValue);
  });

  it('rejects callback promises with errors', async () => {
    const rejectError = new Error();
    let caught;
    try {
      await promiseTo(cb => cb(rejectError));
    } catch (error) {
      caught = error;
    }
    caught.should.be.equal(rejectError);
  });

});

describe('can create http server', () => {

  const app = new rxweb$Server(3000);

  it('resolves to an instance of rxweb$Server', () => {    
    app.should.be.an.instanceOf(rxweb$Server);
  });

  it('has required properties', () => {
    app.should.have.properties('getServer', 'middlewares', 'routes', 'sub', 'next', 'getSubject');
  });

});

describe('client can connect', () => {

  let app;

  it('get a response from the server', async () => {
    app = new rxweb$Server(3000);
    app.start();

    const response = await request(app.getServer())
      .get('/');

    response.text.should.equal('Not Found');
  });

  after(function (done) {
    app.stop(done);
  });

});

describe('test routes and middlewares', () => {

  let app;

  it('server recognizes routes', async () => {
    app = new rxweb$Server(3000);

    app.routes = [
      new rxweb$Route(
        '/foo',
        'POST',
        (next, req, res) => {
          res.body = { requestBody: req.body, path: 'foo' };
        }
      ),
      new rxweb$Route(
        '/bar',
        'POST',
        (next, req, res) => {
          res.body = { requestBody: req.body, path: 'bar' };
        }
      )
    ];

    app.start();

    // POST /foo
    const response = await request(app.getServer())
      .post('/foo')
      .send({ test: 'bar' });

    response.status.should.equal(200);
    const resp = JSON.parse(response.text);
    resp.should.have.propertyByPath('requestBody', 'test').equal('bar');
    resp.should.have.property('path').equal('foo');

    // POST /bar
    const response1 = await request(app.getServer())
      .post('/bar')
      .send({ test: 'foo' });

    response1.status.should.equal(200);
    const resp1 = JSON.parse(response1.text);
    resp1.should.have.propertyByPath('requestBody', 'test').equal('foo');
    resp1.should.have.property('path').equal('bar');
  });

  after(function (done) {
    app.stop(done);
  });

});
