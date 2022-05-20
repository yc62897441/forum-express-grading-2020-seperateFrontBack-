const bcrypt = require('bcryptjs')
const db = require('../../models')
const User = db.User

const jwt = require('jsonwebtoken')
const passportJWT = require('passport-jwt')
const ExtractJwt = passportJWT.ExtractJwt
const JwtStrategy = passportJWT.Strategy

const userController = {
  signUpPage: (req, res) => {
    return res.json({ status: 'success', message: 'connet signup page' })
  },

  signup: (req, res) => {
    // confirm password
    if (req.body.passwordCheck !== req.body.password) {
      return res.json({ status: 'error', message: '兩次密碼輸入不同！' })
    } else {
      User.findOne({ where: { email: req.body.email } })
        .then(user => {
          if (user) {
            return res.json({ status: 'error', message: '信箱重複！' })
          } else {
            User.create({
              name: req.body.name,
              email: req.body.email,
              password: bcrypt.hashSync(req.body.password, bcrypt.genSalt(10).null)
            })
              .then(user => {
                return res.json({status: 'success', message: `註冊成功 userName: ${user.name}, userEmail: ${user.email}`})
              })
          }
        })
    }
  },

  signIn: (req, res) => {
    // 檢查必要資料
    if (!req.body.email || !req.body.password) {
      return res.json({ status: 'error', message: "required fields didn't exist" })
    }

    const username = req.body.email
    const password = req.body.password

    User.findOne({ where: { email: username } })
      .then(user => {
        // 檢查 user 是否存在與密碼是否正確
        if (!user) {
          return res.status(401).json({ status: 'error', message: 'no such user found' })
        }
        if (!bcrypt.compareSync(password, user.password)) {
          return res.status(401).json({ status: 'error', message: 'passwords did not match' })
        }

        // 簽發 token
        const payload = { id: user.id }
        const token = jwt.sign(payload, process.env.JWT_SECRET)
        return res.json({
          status: 'success', message: 'ok', token: token, user: {
            id: user.id, name: user.name, email: user.email, isAdmin: user.isAdmin
          }
        })
      })
  },

}

module.exports = userController
