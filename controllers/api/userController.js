const bcrypt = require('bcryptjs')
const db = require('../../models')
const User = db.User
const Restaurant = db.Restaurant
const Comment = db.Comment
const Category = db.Category

const jwt = require('jsonwebtoken')
const passportJWT = require('passport-jwt')
const ExtractJwt = passportJWT.ExtractJwt
const JwtStrategy = passportJWT.Strategy

const userController = {
  signUpPage: (req, res) => {
    return res.json({ status: 'success', message: 'connect signUp page' })
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
                return res.json({ status: 'success', message: `註冊成功 userName: ${user.name}, userEmail: ${user.email}` })
              })
          }
        })
    }
  },

  signInPage: (req, res) => {
    return res.json({ status: 'success', message: 'connect signIn page' })
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

  // logout
  // 前端專案會找個方法把 token 儲存在客戶端，假設是 localStorage，，當使用者按下畫面上的「登出」按鈕時，發生的事情是前端專案默默地把 localStorage 裡的 token 刪除。前端可自行處理登出功能，後端不需要製作 logout 的 API。

  getUser: (req, res) => {
    const reqParamsId = Number(req.params.id)
    const reqUser = req.user
    return User.findByPk(req.params.id, { include: [{ model: User, as: 'Followers' }, { model: User, as: 'Followings' }, { model: Restaurant, as: 'FavoritedRestaurants' }] })
      .then(user => {
        Comment.findAll({ raw: true, nest: true, where: { UserId: req.params.id }, include: [{ model: Restaurant, include: [Category] }] })
          .then(comments => {
            let commentedRestaurantNum = 0
            const commentsDealed = []  // 存放挑選後的 comments
            const commentsRestaurantsId = [] // 存放每筆 comment 的 restaurant id
            comments.forEach(item => {
              // 如果這筆 comment 的 restaurant id 還不存在 commentsRestaurantsId，則繼續執行下去
              // 如果已經存在 commentsRestaurantsId，這跳過這筆 comment
              // 避免有對同一家 restaurant 有重複的 1 筆以上的 comment
              if (!commentsRestaurantsId.includes(item.Restaurant.id)) {
                commentsRestaurantsId.push(item.Restaurant.id)
                if (item.Restaurant.description) {
                  item.Restaurant.description = item.Restaurant.description.substring(0, 50)
                }
                // 把這筆 comment 加到 commentsDealed
                commentsDealed.push(item)
              }
            })
            commentedRestaurantNum = commentsDealed.length

            const userIsFollowed = req.user.Followings.map(d => d.id).includes(user.id)

            return res.json({ status: 'success', message: `connect user age, comments: ${commentsDealed}, commentedRestaurantNum: ${commentedRestaurantNum}, reqParamsId: ${reqParamsId}, reqUser: ${reqUser}, userIsFollowed: ${userIsFollowed}` })
          })
      })
  },

  editUser: (req, res) => {
    return User.findByPk(req.user.id)
      // return User.findByPk(req.params.id) 用 req.params 可以通過測試檔，用 req.user 通過不了
      // 但是用 req.params 會有問題，可以竄改其他帳號的資料
      // 例如用 A 帳號進入到 users/1/edit 頁面
      // 再手動於網址列改成其他user的id users/2/edit 就可進到其他帳號的編輯頁
      // 按下送出後，就可以修改其他帳號的資訊
      .then(user => {
        return res.json({ status: 'success', message: 'connect user edit page' })
      })
  },

  putUser: (req, res) => {
    if (!req.body.name) {
      return res.json({ status: 'error', message: "name didn't exist" })
    }

    const { file } = req
    if (file) {
      imgur.setClientID(IMGUR_CLIENT_ID)
      imgur.upload(file.path, (err, img) => {
        if (err) { console.log('Error: ', err) }
        return User.findByPk(req.user.id)
          // return User.findByPk(req.params.id) 用 req.params 可以通過測試檔，用 req.user 通過不了
          // 但是用 req.params 會有問題，可以竄改其他帳號的資料
          // 例如用 A 帳號進入到 users/1/edit 頁面
          // 再手動於網址列改成其他user的id users/2/edit 就可進到其他帳號的編輯頁
          // 按下送出後，就可以修改其他帳號的資訊
          .then(user => {
            user.update({
              name: req.body.name,
              email: req.body.email,
              image: file ? img.data.link : user.image
            })
              .then((user) => {
                return res.json({ status: 'success', message: 'user profile was successfully to update'})
              })
          })
      })
    } else {
      return User.findByPk(req.user.id)
        // return User.findByPk(req.params.id)
        .then(user => {
          user.update({
            name: req.body.name,
            email: req.body.email,
            image: user.image
          })
            .then((user) => {
              return res.json({ status: 'success', message: 'user profile was successfully to update' })
            })
        })
    }
  },

}

module.exports = userController
