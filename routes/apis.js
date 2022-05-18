const express = require('express')
const router = express.Router()
const passport = require('../config/passport')

const helpers = require('../_helpers')

const adminController = require('../controllers/api/adminController')

const multer = require('multer')
const upload = multer({ dest: 'temp/' })

const authenticated = (req, res, next) => {
  // 開發時的寫法註解起來
  // if (req.isAuthenticated()) {
  // 改用下方測試用的 _helper.js
  if (helpers.ensureAuthenticated(req)) {
    return next()
  }
  return res.redirect('/signin')
}
const authenticatedAdmin = (req, res, next) => {
  // 開發時的寫法註解起來
  // if (req.isAuthenticated()) {
  //   if (req.user.isAdmin) {
  // 改用下方測試用的 _helper.js
  if (helpers.ensureAuthenticated(req)) {
    if (helpers.getUser(req).isAdmin) {
      return next()
    }
    return redirect('/')
  }
  return res.redirect('/signin')
}

router.get('/admin/restaurants', authenticatedAdmin, adminController.getRestaurants)

module.exports = router
