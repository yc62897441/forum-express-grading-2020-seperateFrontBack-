const db = require('../models')
const Restaurant = db.Restaurant
const User = db.User
const Category = db.Category
const fs = require('fs')
const imgur = require('imgur-node-api')
const IMGUR_CLIENT_ID = process.env.IMGUR_CLIENT_ID

const adminService = require('../services/adminService')

const adminController = {
  getRestaurants: (req, res) => {
    adminService.getRestaurants(req, res, (data) => {
      return res.render('admin/restaurants', data)
    })
  },

  createRestaurant: (req, res) => {
    Category.findAll({ raw: true, nest: true })
      .then(categories => {
        res.render('admin/create', { categories: categories })
      })
  },

  postRestaurant: (req, res) => {
    adminService.postRestaurant(req, res, (data) => {
      if (data['status'] === 'error') {
        req.flash('error_messages', data['message'])
        return res.redirect('back')
      } else {
        req.flash('success_messages', data['message'])
        return res.redirect('/admin/restaurants')
      }
    })
  },

  getRestaurant: (req, res) => {
    adminService.getRestaurant(req, res, (data) => {
      return res.render('admin/restaurant', data)
    })
  },

  editRestaurant: (req, res) => {
    Category.findAll({ raw: true, nest: true })
      .then(categories => {
        return Restaurant.findByPk(req.params.id, { raw: true })
          .then(restaurant => {
            return res.render('admin/create', { restaurant: restaurant, categories: categories })
          })
      })
  },

  putRestaurant: (req, res) => {
    adminService.putRestaurant(req, res, (data) => {
      if (data['status'] === 'error') {
        req.flash('error_messages', data['message'])
        return res.redirect('back')
      } else {
        req.flash('success_messages', data['message'])
        return res.redirect('/admin/restaurants')
      }
    })
  },

  deleteRestaurant: (req, res) => {
    adminService.deleteRestaurant(req, res, (data) => {
      if (data['status'] === 'success') {
        return res.redirect('/admin/restaurants')
      }
    })
  },

  getUsers: (req, res) => {
    User.findAll({ raw: true })
      .then(users => {
        return res.render('admin/users', { users: users })
      })
  },

  toggleAdmin: (req, res) => {
    User.findByPk(req.params.id)
      .then(user => {
        if (user.email === 'root@example.com') {
          req.flash('error_messages', "Can not change this user's item!")
          return res.redirect('/admin/users')
        }
        if (user.isAdmin) { return user.update({ isAdmin: false }) }
        if (!user.isAdmin) { return user.update({ isAdmin: true }) }
      })
      .then((user) => {
        req.flash('success_messages', 'user was successfully to update')
        return res.redirect('/admin/users')
      })
  },
  // ?????????????????????????????????
  //   toggleAdmin: (req, res) => {
  //   const toggle = req.body.toggle
  //   const id = req.params.id
  //   User.findByPk(req.params.id)
  //     .then(user => {
  //       if (user.email === 'root@example.com') {
  //         req.flash('error_messages', "Can not change this user's item!")
  //         return res.redirect('/admin/users')
  //       }
  //       user.update({
  //         isAdmin: req.body.toggle,
  //       })
  //     })
  //     .then((user) => {
  //       req.flash('success_messages', 'user was successfully to update')
  //       return res.redirect('/admin/users')
  //     })
  // }
}

module.exports = adminController
