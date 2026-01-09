const createLog = require('../utils/createLog')

const logMiddleware = (request, response, next) => {
    response.on('finish', () => {
        let event = "REQUEST"
        if(request.method === "POST") event = "CREATE"
        else if (request.method = "PUT" || request.method === "PATCH") event = "UPDATE"
        else if (request.method = "DELETE") event = "DELETE"
        else if (request.method = "GET") event = "READ"
        
        createLog({
            request,
            action: `${request.method} ${request.originalUrl}`,
            event, 
            status: request.statusCode
        })
    })
    next()
}

module.exports = logMiddleware
