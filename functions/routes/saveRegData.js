module.exports = function saveRegData(req, res, next) {
    var sessionData = {};

    if(req.body.password === req.body.rpass){
        res.regdata = {
            rank: req.body.rank,
            os: req.body.os,
            fname: req.body.fname,
            mname: req.body.mname,
            lname: req.body.lname,
            suffix: req.body.suffix,
            sn: req.body.sn,
            gender: req.body.gender,
            email: req.body.email,
            mobile: req.body.mobile,
            course: req.body.course,
            cs: req.body.cs,
            unit: req.body.unit,
            pos: req.body.pos,
            home: req.body.home,
        };
        next()
    } else {
        sessionData.error = 'Passwords did not match. Please check your passwords.';
        res.cookie('__session', sessionData, { httpOnly: true, sameSite: "none" });
        res.redirect('/register');
    }
}