const firebase = require('../Firebase');

module.exports = function registerUser(req, res, next) {

    const usersDb = firebase.database().ref('Users');

    var sessionData = {};

    var isOfficer = false;
    if(req.body.rank == 'MAJ' || req.body.rank == 'CPT' || req.body.rank == '1LT' || req.body.rank == '2LT'){
        isOfficer = true;
    }

    var userdata = {
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
        isOfficer: isOfficer
    }

    if(req.body.password === req.body.rpass){
        firebase.auth().createUserWithEmailAndPassword(req.body.email, req.body.password)
                .then(function(data) {
                    userdata.uid = data.user.uid;
                    usersDb.child(data.user.uid).set(userdata);
                    res.clearCookie('__session');

                    // Get User Data using UID
                    firebase.database().ref('Users').child(data.user.uid).once('value')
                            .then(function(dataSnapshot) {
                                sessionData.userdata = dataSnapshot.val();
                                res.cookie('__session', sessionData, { httpOnly: true, sameSite: "none" });
                                res.redirect('/profile');
                            }).catch(function(error) {
                                sessionData.error = error.message;
                                res.cookie('__session', sessionData, { httpOnly: true, sameSite: "none" });
                                res.redirect('/login');
                            })
                })
                .catch(function(error) {
                    sessionData.regdata = userdata;
                    sessionData.error = error.message;
                    res.cookie('__session', sessionData, { httpOnly: true, sameSite: "none" });
                    res.redirect('/register');
                })
    } else {
        sessionData.error = 'Password Mismatch. Please check passwords.';
        sessionData.regdata = userdata;
        res.cookie('__session', sessionData, { httpOnly: true, sameSite: "none" });
        res.redirect('/register');
    }
}