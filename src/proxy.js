/* @flow */
/* eslint max-len: 0, guard-for-in: 0 */
import httpProxy from 'http-proxy';

// https://github.com/chimurai/http-proxy-middleware/blob/master/lib/path-rewriter.js
const processPathRewrite = (req: any, pathRewrite: any) => {
  let result = req.url;
  
  for (const rule in pathRewrite) {
    const rgx = new RegExp(rule);
    if (rgx.test(req.url)) {
      result = result.replace(rgx, pathRewrite[rule]);
    }
  }

  return result;
};

export function rxweb$Proxy(_options: any = {}) {
  const options = Object.assign({secure: false, changeOrigin: true, pathRewrite: {}}, _options);
  const proxy = httpProxy.createProxyServer(options);

  return async (request: any, response: any, next: any) => {
    const {pathRewrite, target} = options;
    const newPath = processPathRewrite(request.req, pathRewrite);

    request.req.url = newPath;

    await new Promise((resolve, reject) => {
      response.res.on('close', () => reject(new Error(`Http response closed while proxying to ${target}`)));
      response.res.on('finish', () => resolve());
      proxy.web(request.req, response.res, { target }, e => reject(e));
    });

    next({
      type: 'HTTP_PROXY_COMPLETED',
      data: `${target}${newPath}`,
      request,
      response,
      next
    });
  };
}

declare module 'rxweb' {
  declare var Proxy: rxweb$Proxy;
}
