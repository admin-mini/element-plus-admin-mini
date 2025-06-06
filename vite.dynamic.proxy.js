//debugger反向自动代理
import httpProxy from 'http-proxy'
var proxy = httpProxy.createProxyServer({
  secure: false //可接受自签证书
})
let cacheDebugUrl = ''
export default function (options, debugStr = 'debug') {
  return {
    name: 'dynamic-proxy-' + debugStr,
    configureServer(server) {
      options = Object.assign(
        {
          path: '/api',
          default: 'https://www.baidu.com',
          changeOrigin: true
        },
        options
      )

      server.middlewares.use((req, res, next) => {
        if (options.path instanceof RegExp === false) {
          options.path = new RegExp('^' + options.path)
        }

        let u = new URL(req.url, 'http://localhost')
        if (options.path.test(u.pathname)) {
          let urlObj
          let debug
          try {
            urlObj = new URL(req.headers.referer || req.url || 'http://localhost')
            debug = urlObj.search
              .slice(1)
              .match(new RegExp('(^|&)' + debugStr + '=([^&]*)(&|$)', 'i'))
            debug = debug ? debug[2] : options.default
          } catch (e) {}
          req.url = req.url.replace(options.path, '')

          cacheDebugUrl = debug || cacheDebugUrl
          proxy.web(req, res, {
            changeOrigin: true,
            target: decodeURIComponent(cacheDebugUrl)
          })
          proxy.on('error', (err) => {
            res.statusCode = 500
            res.end(err.message)
          })
        } else {
          next()
        }
      })
    }
  }
}
