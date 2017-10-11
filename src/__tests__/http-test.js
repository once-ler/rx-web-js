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
  rxweb$Route,
  rxweb$Static
} from '../rxweb';

import {
  Server as rxweb$Server,
  rxweb$Proxy
} from '../server';

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

  const app = new rxweb$Server(8000);

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
    app = new rxweb$Server(8000);
    app.start();
    
    const response = await request(app.getServer())
      .get('/');

    response.statusCode.should.equal(404);  
    response.text.should.equal('Not Found');
  });

  after(function (done) {
    app.stop(done);
  });

});

describe('test routes and middlewares', () => {
  
  let app;

  it('server recognizes routes', async () => {
    app = new rxweb$Server(8000);

    app.routes = [
      new rxweb$Route(
        '/just',
        'GET',
        (req, res, next) => {
          res.send({ requestBody: 'just' });
        }
      ),
      new rxweb$Route(
        '/foo',
        'POST',
        (req, res, next) => {
          res.send({ requestBody: req.body, path: 'foo' });
        }
      ),
      new rxweb$Route(
        '/bar',
        'POST',
        (req, res, next) => {
          res.send({ requestBody: req.body, path: 'bar' });
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

describe('test proxy', () => {
  
  let app;

  it('server forwards requests to proxy', async () => {
    app = new rxweb$Server(8000);

    const proxyAction = rxweb$Proxy({
      target: 'https://www.reddit.com',
      pathRewrite: {
        '^/api/reddit': ''
      },
      secure: false,
      changeOrigin: true
    });
    
    app.routes = [
      new rxweb$Route(
        '/api/reddit/search.json',
        'GET',
        proxyAction
      )
    ];

    const HttpProxyCompletedMiddleware = new rxweb$Middleware(
      task => task.type === 'HTTP_PROXY_COMPLETED',
      task => {
        // Note: ctx.response.res has already been sent to client.
        // Just showing the destination url for now.
        console.log(task.data);
      }
    );

    app.middlewares = [HttpProxyCompletedMiddleware];
    app.start();

    const search = 'cats';

    const response = await request(app.getServer())
      .get(`/api/reddit/search.json?q=${search}&syntax=plain&type=sr&restrict_sr=true&include_facets=false&limit=10&sr_detail=false`)
      .set('Accept', 'application/json');

    console.log(response.text);
  });

  after(function (done) {
    app.stop(done);
  });

});

describe('test static file', () => {  
  let app;

  it('server can serve static file', async () => {
    app = new rxweb$Server(8000);

    app.statics = [
      new rxweb$Static(__dirname + '/fixtures')
    ]
    app.start();

    const response = await request(app.getServer())
    .get('/index.html')
    .set('Accept', 'text/html');

    response.text.should.match(/Used to test serving static file/);
  });

  after(function (done) {
    app.stop(done);
  });
  
});
