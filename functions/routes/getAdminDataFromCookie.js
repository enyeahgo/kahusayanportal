module.exports = function getUserDataFromCookie(req, res, next) {
    if(req.cookies['__session']){
        if(req.cookies['__session'].adminData){
            res.isLoggedIn = true;
            res.adminData = req.cookies['__session'].adminData;
            next()
        } else {
            res.isLoggedIn = false;
            next()
        }
    } else {
        res.isLoggedIn = false;
        next()
    }
}