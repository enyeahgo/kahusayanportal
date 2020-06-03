const express = require('express');
const router = express.Router();
const firebase = require('../Firebase');
const fs = require('fs');

const {Storage} = require('@google-cloud/storage');
const storage = new Storage();

const fileUploader = require('express-fileupload');

router.use(fileUploader({
  limits: { fileSize: 50 * 1024 * 1024 },
}));

const registerUser = require('./registerUser');
const getUserDataFromCookie = require('./getUserDataFromCookie');
const timeAgo = require('epoch-to-timeago').timeAgo;

router.get('/', getUserDataFromCookie, function(req, res, next) {
  if(res.isLoggedIn){
    res.render('index', {
      title: 'KAHUSAYAN',
      isLoggedIn: true,
    });
  } else {
    res.render('index', {
      title: 'KAHUSAYAN',
      isLoggedIn: false,
    });
  }
});

router.get('/login', function(req, res, next) {
  res.render('login', {
    title: 'KAHUSAYAN',
    error: req.cookies['__session'] ? req.cookies['__session'].error : '',
    isLoggedIn: false,
  });
});

router.post('/login', function(req, res, next) {
  var sessionData = {};

  firebase.auth().signInWithEmailAndPassword(req.body.email, req.body.password)
          .then(function(data) {
            firebase.database().ref('Users').child(data.user.uid).once('value')
                  .then(function(dataSnapshot) {
                      sessionData.error = '';
                      sessionData.token = data.user._lat;
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
            sessionData.error = error.message;
            res.cookie('__session', sessionData, { httpOnly: true, sameSite: "none" });
            res.redirect('/login');
          });
})

router.get('/register', function(req, res, next) {

  if(req.cookies['__session']){
    if(req.cookies['__session'].regdata){
      res.render('register', {
        title: 'KAHUSAYAN',
        fname: req.cookies['__session'].regdata.fname,
        mname: req.cookies['__session'].regdata.mname,
        lname: req.cookies['__session'].regdata.lname,
        sn: req.cookies['__session'].regdata.sn,
        email: req.cookies['__session'].regdata.email,
        mobile: req.cookies['__session'].regdata.mobile,
        unit: req.cookies['__session'].regdata.unit,
        pos: req.cookies['__session'].regdata.pos,
        home: req.cookies['__session'].regdata.home,
        error: req.cookies['__session'].error ? req.cookies['__session'].error : '',
        isLoggedIn: false,
      });
    } else {
      res.render('register', {
        title: 'KAHUSAYAN',
        error: req.cookies['__session'].error ? req.cookies['__session'].error : '',
        isLoggedIn: false,
      });
    }
  } else {
    res.render('register', {
      title: 'KAHUSAYAN',
      error: '',
      isLoggedIn: false,
    });
  }
});

router.post('/register', registerUser);

router.get('/profile', getUserDataFromCookie, function(req, res, next) {
  if(res.isLoggedIn){
    res.render('profile', {
      title: 'KAHUSAYAN',
      name: res.userdata.rank+' '+res.userdata.fname+' '+res.userdata.mname.charAt(0)+' '+res.userdata.lname+' '+res.userdata.suffix+' '+res.userdata.sn+' ('+res.userdata.os+') PA',
      isOfficer: res.userdata.isOfficer,
      userdata: res.userdata,
      isLoggedIn: true,
      isVerified: res.userdata.isVerified,
    })
  } else {
    var sessionData = req.cookies['__session'] ? req.cookies['__session'] : {};
    sessionData.error = 'You need to login!';
    res.cookie('__session', sessionData, { httpOnly: true, sameSite: 'none' });
    res.redirect('/login')
  }
  
})

router.get('/logout', function(req, res, next) {
  firebase.auth().signOut();
  res.clearCookie('__session');
  res.redirect('/');
})

router.get('/announcements', getUserDataFromCookie, function(req, res, next) {
  if(req.cookies['__session']){
    if(req.cookies['__session'].userdata){
      if(req.cookies['__session'].userdata.isVerified){
        // Get Announcements
        firebase.database().ref('Announcements').orderByChild('dateAnnounced').on('value', function(dataSnapshot) {

                    // Convert dateAnnounced
                    var timeNow = new Date().getTime();
                    var finalAnnouncements = [];

                    dataSnapshot.forEach(function(child) {
                      finalAnnouncements.push({
                        _key: child.key,
                        announcer: child.val().announcer,
                        dateAnnounced: timeAgo((child.val().dateAnnounced * 1000), timeNow),
                        message: child.val().message,
                        title: child.val().title
                      })
                    });

                    res.render('announcements', {
                      title: 'KAHUSAYAN',
                      announcements: finalAnnouncements,
                      isLoggedIn: true,
                      isVerified: res.userdata.isVerified,
                    })
                })
      } else {
        res.redirect('/profile');
      }
    } else {
      res.cookie('__session', {error: 'You need to login!'}, { httpOnly: true, sameSite: 'none' });
      res.redirect('/login');
    }
  } else {
    res.cookie('__session', {error: 'You need to login!'}, { httpOnly: true, sameSite: 'none' });
    res.redirect('/login');
  }
})

router.get('/uploadphoto', getUserDataFromCookie, function(req, res, next) {
  res.render('uploadphoto', {
    title: 'KAHUSAYAN',
    pageTitle: 'Upload Photo',
    isLoggedIn: true,
    isVerified: res.userdata.isVerified,
    uploadedPhoto: res.userdata.uploadedPhoto,
    photoURL: res.userdata.photoURL
  })
})

router.post('/uploadphoto', function(req, res, next) {
  res.send(JSON.stringify(req.file));
  // storage.bucket('kahusayanportal').upload(req.body.photo, {
  //   gzip: true,
  //   metadata: {
  //     cacheControl: 'public, max-age=31536000',
  //   },
  // })
  // .then(function(result) {
  //   console.log(result)
  // })
  // .catch(console.error);
})


module.exports = router;