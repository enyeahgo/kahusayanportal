const express = require('express');
const router = express.Router();
const firebase = require('../Firebase');
const timeAgo = require('epoch-to-timeago').timeAgo;
const getAdminDataFromCookie = require('./getAdminDataFromCookie');

router.get('/', getAdminDataFromCookie, function(req, res, next) {
    if(res.isLoggedIn){
        res.render('index-td', {
            title: 'DIRECTORATE',
            name: res.adminData.rank+' '+res.adminData.fname+' '+res.adminData.mname.charAt(0)+' '+res.adminData.lname+' '+res.adminData.suffix+' ('+res.adminData.os+') PA',
            isOfficer: res.adminData.isOfficer,
            adminData: res.adminData,
            isLoggedIn: true,
        });
      } else {
          res.clearCookie('__session');
          res.cookie('__session', {error: 'You need to login as admin.'}, { httpOnly: true, sameSite: 'none' });
          res.redirect('/td/login');
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
                                res.send('You are not allwoed to view this page.');
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
            isAdmin: true
        }

        firebase.auth().createUserWithEmailAndPassword(req.body.email, req.body.password)
                .then(function(data) {
                    firebase.database().ref('Admins').child(data.user.uid).set(userdata);
                    res.clearCookie('__session');
                    firebase.database().ref('Admins').child(data.user.uid).once('value')
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

router.get('/announcements', getAdminDataFromCookie, function(req, res, next) {
    if(res.isLoggedIn){
        // Get Announcements
        firebase.database().ref('Announcements').orderByChild('dateAnnounced').on('value', function(dataSnapshot) {

                    // Convert dateAnnounced
                    var timeNow = new Date().getTime();
                    var finalAnnouncements = [];

                    dataSnapshot.forEach(function(child) {
                    finalAnnouncements.push({
                        _key: child.key,
                        announcer: child.val().announcer,
                        dateAnnounced: timeAgo((child.val().dateAnnounced), timeNow),
                        message: child.val().message,
                        title: child.val().title
                    })
                    });

                    res.render('announcements', {
                    title: 'KAHUSAYAN',
                    announcements: finalAnnouncements,
                    isLoggedIn: true,
                    isVerified: true,
                    isAdmin: true
                    })
                })
    } else {
    res.cookie('__session', {error: 'You need to login as admin!'}, { httpOnly: true, sameSite: 'none' });
    res.redirect('/td/login');
    }
})

router.get('/profile', getAdminDataFromCookie, function(req, res) {
    if(res.isLoggedIn){
        res.redirect('/td/');
    } else {
        res.clearCookie('__session');
        res.cookie('__session', {error: 'You need to login as admin.'}, { httpOnly: true, sameSite: 'none' });
        res.redirect('/td/login');
    }
})

router.get('/post', getAdminDataFromCookie, function(req, res, next) {
    if(res.isLoggedIn){
        res.render('post', {
            title: 'DIRECTORATE',
            isLoggedIn: true,
            error: req.cookies['__session'] ? req.cookies['__session'].error : '',
        })
    } else {
        res.clearCookie('__session');
        res.cookie('__session', {error: 'You need to login as admin.'}, { httpOnly: true, sameSite: 'none' });
        res.redirect('/td/login');
    }
})

router.post('/post', getAdminDataFromCookie, function(req, res, next) {
    var announcementsRef = firebase.database().ref('Announcements');
    var sessionData = req.cookies['__session'];
    if(req.body.title == '' || req.body.message == ''){
        sessionData.error = 'Please put title and message.';
        res.cookie('__session', sessionData, { httpOnly: true, sameSite: 'none' });
        res.redirect('/td/post');
    } else {
        var postData = {
            announcer: (res.adminData.course == '') ? res.adminData.pos : res.adminData.pos + ', ' + res.adminData.course,
            dateAnnounced: new Date().getTime(),
            message: req.body.message,
            title: req.body.title
        }

        var postId = announcementsRef.push().key;
        firebase.database().ref('Announcements').child(postId).set(postData)
                .then(function(dataSnapshot) {
                    res.redirect('/td/announcements');
                })
                .catch(function(error) {
                    sessionData.error = error.message;
                    res.cookie('__session', sessionData, { httpOnly: true, sameSite: 'none' });
                    res.redirect('/td/post');
                })
    }
})

router.get('/students', getAdminDataFromCookie, function(req, res, next) {
    if(res.isLoggedIn){
        firebase.database().ref('Users').orderByChild('lname').once('value')
                .then(function(dataSnapshot) {

                    var aoacStudents = [];
                    var ancoacStudents = [];
                    var ancobcStudents = [];
                    
                    dataSnapshot.forEach(function(child) {
                        if(child.val().course == 'Armor Officer Advance Course'){
                            aoacStudents.push({
                                _key: child.key,
                                name: child.val().rank+' '+child.val().fname+' '+child.val().mname.charAt(0)+' '+child.val().lname+' '+child.val().suffix+' '+child.val().sn+' ('+child.val().os+') PA',
                                email: child.val().email,
                                mobile: child.val().mobile,
                                isVerified: child.val().isVerified,
                                uid: child.val().uid,
                                serial: aoacStudents.length + 1
                              })
                        } else if(child.val().course == 'Armor NCO Advance Course'){
                            ancoacStudents.push({
                                _key: child.key,
                                name: child.val().rank+' '+child.val().fname+' '+child.val().mname.charAt(0)+' '+child.val().lname+' '+child.val().suffix+' '+child.val().sn+' ('+child.val().os+') PA',
                                email: child.val().email,
                                mobile: child.val().mobile,
                                isVerified: child.val().isVerified,
                                uid: child.val().uid,
                                serial: ancoacStudents.length + 1
                                })
                        } else if(child.val().course == 'Armor NCO Basic Course'){
                            ancobcStudents.push({
                                _key: child.key,
                                name: child.val().rank+' '+child.val().fname+' '+child.val().mname.charAt(0)+' '+child.val().lname+' '+child.val().suffix+' '+child.val().sn+' ('+child.val().os+') PA',
                                email: child.val().email,
                                mobile: child.val().mobile,
                                isVerified: child.val().isVerified,
                                uid: child.val().uid,
                                serial: ancobcStudents.length + 1
                                })
                        }
                    })

                    res.render('students', {
                        title: 'DIRECTORATE',
                        pageTitle: 'Students',
                        aoacStudents: aoacStudents,
                        ancoacStudents: ancoacStudents,
                        ancobcStudents: ancobcStudents,
                        isLoggedIn: true
                    })
                })
    } else {
        res.clearCookie('__session');
        res.cookie('__session', {error: 'You need to login as admin.'}, { httpOnly: true, sameSite: 'none' });
        res.redirect('/td/login');
    }
})

router.get('/verifyuser/:uid', function(req, res, next) {
    firebase.database().ref('Users/'+req.params.uid+'/isVerified').set(true);
    res.redirect('/td/students');
})

router.get('/newactivity', getAdminDataFromCookie, function(req, res, next) {
    if(res.isLoggedIn){
        res.render('newactivity', {
            title: 'DIRECTORATE',
            pageTitle: 'New Activity',
            
        })
    } else {
        res.clearCookie('__session');
        res.cookie('__session', {error: 'You need to login as admin.'}, { httpOnly: true, sameSite: 'none' });
        res.redirect('/td/login');
    }
})

module.exports = router;