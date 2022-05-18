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
}

module.exports = categoryService
