const express = require('express');
const router = express.Router();
const firebase = require('../Firebase');
const getAdminDataFromCookie = require('./getAdminDataFromCookie');

router.get('/', getAdminDataFromCookie, function(req, res, next) {
    if(res.isLoggedIn){
        res.render('index-admin', {
          title: 'DIRECTORATE',
          isLoggedIn: true,
        });
      } else {
        res.render('index-admin', {
          title: 'DIRECTORATE',
          isLoggedIn: false,
        });
      }
})

router.get('/login', function(req, res, next) {
    res.render('login-admin', {
        title: 'DIRECTORATE',
        error: req.cookies['__session'] ? req.cookies['__session'].error : '',
        isLoggedIn: false,
    })
})

router.post('/login', function(req, res, next) {
    var sessionData = {};
    firebase.auth().signInWithEmailAndPassword(req.body.email, req.body.password)
            .then(function(data) {
                firebase.database().ref('Admins').child(data.user.uid).once('value')
                        .then(function(dataSnapshot) {
                            if(dataSnapshot.val() === null){
                                res.send('Not admin');
                            } else {
                                sessionData.error = '';
                                sessionData.token = data.user._lat;
                                sessionData.adminData = dataSnapshot.val();
                                res.cookie('__session', sessionData, { httpOnly: true, sameSite: "none" });
                                res.redirect('/td/');
                            }
                        })
                        .catch(function(error) {
                            console.log(error.message);
                        })
            })
            .catch(function(error) {
                sessionData.error = error.message;
                res.cookie('__session', sessionData, { httpOnly: true, sameSite: 'none' });
                res.redirect('/td/login');
            })
})

router.get('/register', function(req, res, next) {
    if(req.cookies['__session']){
        if(req.cookies['__session'].error){
            res.render('register-admin', {
                title: 'DIRECTORATE',
                error: req.cookies['__session'].error,
                isLoggedIn: false,
              });
        } else {
            res.render('register-admin', {
                title: 'DIRECTORATE',
                error: '',
                isLoggedIn: false,
              });
        }
    } else {
        res.render('register-admin', {
            title: 'DIRECTORATE',
            error: '',
            isLoggedIn: false,
          });
    }
})

router.post('/register', function(req, res, next) {
    if(req.body.password === req.body.rpass){

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
            email: req.body.email,
            mobile: req.body.mobile,
            course: req.body.course,
            pos: req.body.pos,
            isOfficer: isOfficer,
            isVerified: true,
        }

        firebase.auth().createUserWithEmailAndPassword(req.body.email, req.body.password)
                .then(function(data) {
                    firebase.database().ref('Admins').child(data.user.uid).set(userdata);
                    res.clearCookie('__session');
                    firebase.database.ref('Admins').child(data.user.uid).once('value')
                            .then(function(dataSnapshot) {
                                var adminData = dataSnapshot.val();

                            })
                            .catch(function(error) {
                                res.cookie('__session', {error: error.message}, { httpOnly: true, sameSite: 'none' });
                                res.redirect('/td/login');
                            })
                })
                .catch(function(error) {
                    res.cookie('__session', {error: error.message}, { httpOnly: true, sameSite: 'none' });
                    res.redirect('/td/register');
                })
    } else {
        res.cookie('__session', {error: 'Password Mismatch! Please check your passwords.'}, { httpOnly: true, sameSite: 'none' });
        res.redirect('/td/register');
    }
})

router.get('/logout', function(req, res, next) {
    firebase.auth().signOut();
    res.clearCookie('__session');
    res.redirect('/');
  })

module.exports = router;