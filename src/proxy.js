/* @flow */
/* eslint max-len: 0 */
import httpProxy from 'http-proxy';
const proxy = httpProxy.createProxyServer({});

export function rxweb$Proxy(to: string) {
  return async (request: any, response: any, next: any) => {
    await new Promise((resolve, reject) => {
      response.on('close', () => reject(new Error(`Http response closed while proxying to ${to}`)));
      response.on('finish', () => resolve());
      proxy.web(request, response, { target: to }, e => reject(e));
    });

    next({
      type: 'HTTP_PROXY_COMPLETED',
      data: to,
      request,
      response,
      next
    });
  };
}

declare module 'rxweb' {
  declare var Proxy: rxweb$Proxy;
}
