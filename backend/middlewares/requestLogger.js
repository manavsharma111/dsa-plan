export function requestLogger(req, res, next) {
  const start = Date.now()

  res.on('finish', () => {
    const duration = Date.now() - start
    const status = res.statusCode
    const method = req.method
    const url = req.originalUrl

    // Color/format log based on status
    const statusTag = status >= 400 ? `[ERR ${status}]` : `[OK ${status}]`
    console.log(`${statusTag} ${method} ${url} - ${duration}ms`)
  })

  next()
}
