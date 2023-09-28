//debugger反向自动代理
import httpProxy from 'http-proxy'
var proxy = httpProxy.createProxyServer({
  secure: false //可接受自签证书
})

export default function (options) {
  return {
    name: 'dynamic-proxy',
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
          let urlObj = new URL(req.headers.referer)
          var debug = urlObj.search.slice(1).match(new RegExp('(^|&)debug=([^&]*)(&|$)', 'i'))
          debug = debug ? debug[2] : options.default
          req.url = req.url.replace(options.path, '')
          proxy.web(req, res, {
            changeOrigin: true,
            target: debug
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
