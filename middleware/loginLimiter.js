const rateLimit = require('express-rate-limit')
const {logEvents} = require('./logger')

const loginLimmiter = rateLimit({
    windowMs: 60*1000, 
    max: 5, 
    message: 
        { message: 'Too many login attempts from this IP, please try agin after a 60 second pause'}, 
    handler: (req, res, next, options) => {
        logEvents(`Too Many Requests: ${options.message.message}\t${req.method}\t${req/url}\t${req.handler.origin}`, 'errLog.log')
        res.status(options.statusCode).send(options.message)
    }, 
    standardHeaders: true, 
    legacyHeaders: false, 
})

module.exports = loginLimmiter