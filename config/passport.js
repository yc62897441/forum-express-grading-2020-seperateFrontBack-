const passport = require('passport')
const localStrategy = require('passport-local').Strategy
const bcrypt = require('bcryptjs')
const db = require('../models')
const User = db.User
const Restaurant = db.Restaurant

// setup passport strategy
passport.use(new localStrategy(
  // customize user field
  {
    usernameField: 'email',
    passwordField: 'password',
    passReqToCallback: true
  },
  // authenticate user
  (req, email, password, cb) => {
    User.findOne({ where: { email: email } })
      .then(user => {
        if (!user) {
          return cb(null, false, req.flash('error_messages', '帳號或密碼輸入錯誤'))
        }
        if (!bcrypt.compareSync(password, user.password)) {
          return cb(null, false, req.flash('error_messages', '帳號或密碼輸入錯誤！'))
        }
        return cb(null, user)
      })
  }
))

// serialize and deserialize user
passport.serializeUser((user, cb) => {
  return cb(null, user.id)
})
passport.deserializeUser((id, cb) => {
  User.findByPk(id, {
    include: [{ model: Restaurant, as: 'FavoritedRestaurants' }, { model: Restaurant, as: 'LikedRestaurants' }, { model: User, as: 'Followers' }, { model: User, as: 'Followings' }]
  })
    .then(user => {
      user = user.toJSON()
      return cb(null, user)
    })
})

module.exports = passport
