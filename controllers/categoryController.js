const db = require('../models')
const Category = db.Category

const categoryService = require('../services/categoryService')

let categoryController = {
  getCategories: (req, res) => {
    categoryService.getCategories(req, res, (data) => {
      return res.render('admin/categories', data)
    })
  },

  postCategory: (req, res) => {
    if (!req.body.name) {
      req.flash('error_messages', 'name didn\'t exist')
      return res.redirect('back')
    }

    return Category.create({
      name: req.body.name
    })
      .then(category => {
        res.redirect('/admin/categories')
      })
  },

  putCategory: (req, res) => {
    if (!req.body.name) {
      req.flash('error_messages', 'name didn\'t exist')
      return res.redirect('back')
    }

    return Category.findByPk(req.params.id)
      .then(category => {
        category.update({
          name: req.body.name
        })
      })
      .then(category => {
        res.redirect('/admin/categories')
      })
  },

  deleteCategory: (req, res) => {
    return Category.findByPk(req.params.id)
      .then(category => {
        category.destroy()
      })
      .then((category) => {
        res.redirect('/admin/categories')
      })
  }
}

module.exports = categoryController
