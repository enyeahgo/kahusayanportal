module.exports = function getUserDataFromCookie(req, res, next) {
    if(req.cookies['__session']){
        if(req.cookies['__session'].userdata){
            res.isLoggedIn = true;
            res.userdata = req.cookies['__session'].userdata;
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