const firebase = require('../Firebase');

module.exports = function signInUser(req, res, next) {
    var email = req.body.email;
    var password = req.body.password;
    var sessionData = {};

    firebase.auth().signInWithEmailAndPassword(email, password)
            .catch(function(error) {
            sessionData.error = error.message;
            res.cookie('__session', sessionData, { httpOnly: true, sameSite: "none" });
            // res.success = false;
            // next()
            res.redirect('/login');
            });
    firebase.auth().onAuthStateChanged(function(user) {
        if(user){

            // Get User Data using UID
            firebase.database().ref('Users').child(user.uid).once('value')
                    .then(function(dataSnapshot) {
                        sessionData.error = '';
                        sessionData.token = user._lat;
                        sessionData.userdata = dataSnapshot.val();
                        res.cookie('__session', sessionData, { httpOnly: true, sameSite: "none" });
                        // res.success = true;
                        // next()
                        res.redirect('/profile');
                    }).catch(function(error) {
                        sessionData.error = error.message;
                        res.cookie('__session', sessionData, { httpOnly: true, sameSite: "none" });
                        // res.success = false;
                        res.redirect('/login');
                    })
        }
    })
}