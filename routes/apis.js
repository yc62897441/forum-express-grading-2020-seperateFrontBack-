const express = require('express')
const router = express.Router()
const passport = require('../config/passport')

const helpers = require('../_helpers')

const adminController = require('../controllers/api/adminController')
const categoryController = require('../controllers/api/categoryController')
const userController = require('../controllers/api/userController.js')

const multer = require('multer')
const upload = multer({ dest: 'temp/' })

const authenticated = passport.authenticate('jwt', { session: false })

const authenticatedAdmin = (req, res, next) => {
  if (req.user) {
    if (req.user.isAdmin) { return next() }
    return res.json({ status: 'error', message: 'permission denied' })
  } else {
    return res.json({ status: 'error', message: 'permission denied' })
  }
}

// const authenticated = (req, res, next) => {
//   // 開發時的寫法註解起來
//   // if (req.isAuthenticated()) {
//   // 改用下方測試用的 _helper.js
//   if (helpers.ensureAuthenticated(req)) {
//     return next()
//   }
//   return res.redirect('/signin')
// }
// const authenticatedAdmin = (req, res, next) => {
//   // 開發時的寫法註解起來
//   // if (req.isAuthenticated()) {
//   //   if (req.user.isAdmin) {
//   // 改用下方測試用的 _helper.js
//   if (helpers.ensureAuthenticated(req)) {
//     if (helpers.getUser(req).isAdmin) {
//       return next()
//     }
//     return redirect('/')
//   }
//   return res.redirect('/signin')
// }

router.get('/admin/restaurants', authenticated, authenticatedAdmin, adminController.getRestaurants)
router.post('/admin/restaurants', authenticated, authenticatedAdmin, upload.single('image'), adminController.postRestaurant)
router.get('/admin/restaurants/:id', authenticated, authenticatedAdmin, adminController.getRestaurant)
router.put('/admin/restaurants/:id', authenticated, authenticatedAdmin, upload.single('image'), adminController.putRestaurant)
router.delete('/admin/restaurants/:id', authenticated, authenticatedAdmin, adminController.deleteRestaurant)

router.get('/admin/categories', authenticated, authenticatedAdmin, categoryController.getCategories)
router.post('/admin/categories', authenticated, authenticatedAdmin, categoryController.postCategory)
router.get('/admin/categories/:id', authenticated, authenticatedAdmin, categoryController.getCategories)
router.put('/admin/categories/:id', authenticated, authenticatedAdmin, categoryController.putCategory)
router.delete('/admin/categories/:id', authenticated, authenticatedAdmin, categoryController.deleteCategory)

router.get('/signup', userController.signUpPage)
router.post('/signup', userController.signup)

router.post('/signin', userController.signIn)

module.exports = router
