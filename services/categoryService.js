const db = require('../models')
const Category = db.Category

let categoryService = {
  getCategories: (req, res, callback) => {
    Category.findAll({ raw: true, nest: true })
      .then(categories => {
        if (req.params.id) {
          Category.findByPk(req.params.id, { raw: true, nest: true })
            .then(category => {
              callback({ categories: categories, category: category })
            })

        } else {
          callback({ categories: categories })
        }
      })
  },

  postCategory: (req, res, callback) => {
    if (!req.body.name) {
      return callback({ status: 'error', message: 'name didn\'t exist' })
    }
    return Category.create({
      name: req.body.name
    })
      .then(category => {
        return callback({ status: 'success', message: '' })
      })
  },

  putCategory: (req, res, callback) => {
    if (!req.body.name) {
      return callback({ status: 'error', message: 'name didn\'t exist' })
    }

    return Category.findByPk(req.params.id)
      .then(category => {
        category.update({
          name: req.body.name
        })
      })
      .then(category => {
        return callback({ status: 'success', message: '' })
      })
  },

  deleteCategory: (req, res, callback) => {
    return Category.findByPk(req.params.id)
      .then(category => {
        category.destroy()
      })
      .then((category) => {
        return callback({ status: 'success', message: '' })
      })
  }
}

module.exports = categoryService
