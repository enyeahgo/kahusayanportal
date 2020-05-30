var express = require('express');
var router = express.Router();
const firebase = require('../Firebase');
const saveRegData = require('./saveRegData');
const registerUser = require('./registerUser');
const getUserDataFromCookie = require('./getUserDataFromCookie');
const signInUser = require('./signInUser');

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

router.get('/p', function(req, res, next) {
  res.render('portfolio', { title: 'KAHUSAYAN' });
});

router.get('/t', function(req, res, next) {
  res.render('template', {
    title: 'KAHUSAYAN',
    email: 'enyeahgo@gmail.com',
    mobile: '09159476988',
    fullname: 'Inigo Orosco II',
    error: 'Please fill-out all fields.',
    isLoggedIn: false,
  });
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
                      // res.success = true;
                      // next()
                      res.redirect('/profile');
                  }).catch(function(error) {
                      sessionData.error = error.message;
                      res.cookie('__session', sessionData, { httpOnly: true, sameSite: "none" });
                      // res.success = false;
                      res.redirect('/login');
                  })
          })
          .catch(function(error) {
            sessionData.error = error.message;
            res.cookie('__session', sessionData, { httpOnly: true, sameSite: "none" });
            // res.success = false;
            // next()
            res.redirect('/login');
          });
  // firebase.auth().onAuthStateChanged(function(user) {
  //     if(user){
  //         // Get User Data using UID
          // firebase.database().ref('Users').child(user.uid).once('value')
          //         .then(function(dataSnapshot) {
          //             sessionData.error = '';
          //             sessionData.token = user._lat;
          //             sessionData.userdata = dataSnapshot.val();
          //             res.cookie('__session', sessionData, { httpOnly: true, sameSite: "none" });
          //             // res.success = true;
          //             // next()
          //             res.redirect('/profile');
          //         }).catch(function(error) {
          //             sessionData.error = error.message;
          //             res.cookie('__session', sessionData, { httpOnly: true, sameSite: "none" });
          //             // res.success = false;
          //             res.redirect('/login');
          //         })
  //     }
  // })
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
      isLoggedIn: true
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

module.exports = router;
