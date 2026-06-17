const categoryService = require('../services/categoryService');

const getCategories = async (req, res, next) => {
  try {
    const categories = await categoryService.getAllCategories();
    res.json({ success: true, data: categories });
  } catch (error) {
    next(error);
  }
};

const createCategory = async (req, res, next) => {
  try {
    const { name, type } = req.body;

    if (!name || !type) {
      return res
        .status(400)
        .json({ success: false, message: 'name and type are required' });
    }

    const result = await categoryService.createCategory({ name, type });
    res
      .status(201)
      .json({ success: true, data: { id: result.lastID, name, type } });
  } catch (error) {
    if (error.message && error.message.includes('UNIQUE constraint failed')) {
      return res
        .status(400)
        .json({ success: false, message: 'Category name already exists' });
    }
    next(error);
  }
};

const updateCategory = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, type } = req.body;

    if (!name || !type) {
      return res
        .status(400)
        .json({ success: false, message: 'name and type are required' });
    }

    const existing = await categoryService.getCategoryById(id);
    if (!existing) {
      return res
        .status(404)
        .json({ success: false, message: 'Category not found' });
    }

    const result = await categoryService.updateCategory(id, { name, type });
    if (result.changes === 0) {
      return res
        .status(400)
        .json({ success: false, message: 'No category was updated' });
    }

    res.json({ success: true, data: { id: Number(id), name, type } });
  } catch (error) {
    next(error);
  }
};

const deleteCategory = async (req, res, next) => {
  try {
    const { id } = req.params;
    const existing = await categoryService.getCategoryById(id);
    if (!existing) {
      return res
        .status(404)
        .json({ success: false, message: 'Category not found' });
    }

    await categoryService.deleteCategory(id);
    res.json({ success: true, message: 'Category deleted successfully' });
  } catch (error) {
    if (
      error.message &&
      error.message.includes('FOREIGN KEY constraint failed')
    ) {
      return res.status(400).json({
        success: false,
        message:
          'Category cannot be deleted because it is used by transactions',
      });
    }
    next(error);
  }
};

module.exports = {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
};
