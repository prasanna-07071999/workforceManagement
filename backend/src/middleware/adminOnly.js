const adminOnly = (request, response, next) => {
    try{
        if(!request.user){
        return response.status(401).json({message: "Unauthorized"})
    }

    if (!request.user.isAdmin){
        return response.status(403).json({message: "Access Denined Admins Only"})
    }
    } catch(e){
        response.status(500).json({message: "Server Error", error: e.message})
    }
    
    next()
}
module.exports = adminOnly
