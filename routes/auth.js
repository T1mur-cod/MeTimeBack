const express = require('express');
const passport = require('passport');
const User = require('../models/user.model');
const { ensureLoggedIn } = require('../utils/middlewares');
const { filterInput } = require('../utils/helpers');
// const { destroyAuthSession: destroySocketSession } = require('../socketApi')

const router = express.Router();

router.post('/login', passport.authenticate('local'), async (req, res) => {
  try {
    res.json({
      user: await User.findById(req.user._id),
      message: 'logged in',
    });
  } catch (err) {
    console.log('error in /login', err);
    res.status(500).json({
      msg: 'Something went wrong!, cannot process your request at this moment!',
    });
  }
});

router.get('/login', ensureLoggedIn, async (req, res) => {
  try {
    res.json({
      user: await User.findById(req.user._id),
      message: 'logged in',
    });
  } catch (err) {
    console.log('error in get.login (checks if logged in)', err);
    res.status(500).json({
      msg: 'Something went wrong cannot process your request right now',
    });
  }
});

router.post('/logout', (req, res) => {
  // const { socketId } = req.session;
  req.logout();
  req.session.destroy((err) => {
    if (err) console.log('error /logout', err);
    res.redirect('/');
  });
  // destroySocketSession(socketId)
});

router.post('/signup', async (req, res) => {
  try {
    let { password, fullname, username } = req.body;
    password = filterInput(password, 'password');
    username = filterInput(username, 'username', { min_length: 4 });
    fullname = filterInput(fullname, 'name', { min_length: 0 });
    if (await User.exists({ screen_name: username })) {
      res.status(409).json({
        message: 'username is taken',
      });
      return;
    }
    const user = await User.create(
      {
        screen_name: username,
        name: fullname,
        password,
      },
    );
    console.log('username', user);
    if (user) {
      req.login(
        {
          _id: user._id,
        },
        (err) => {
          if (err) {
            console.log('error logging in new user', err);
            res.status(409).json({
              message: 'user created, log in now',
            });
            return;
          }
          res.json({
            message: 'user succesfully created, logging in',
            user,
          });
        },
      );
    }
    console.log('user created', user);
  } catch (err) {
    console.log('error in /signup>>>>>\n', err);
    res.status(400).json({
      message: 'Your request could not be completed',
    });
  }
});
module.exports = router;
