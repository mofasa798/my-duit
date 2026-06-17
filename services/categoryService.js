const { allAsync, getAsync, runAsync } = require('../config/database');

const getAllCategories = async () => {
  return allAsync(
    'SELECT id, name, type, created_at FROM categories ORDER BY name'
  );
};

const getCategoryById = async (id) => {
  return getAsync(
    'SELECT id, name, type, created_at FROM categories WHERE id = ?',
    [id]
  );
};

const createCategory = async ({ name, type }) => {
  return runAsync('INSERT INTO categories (name, type) VALUES (?, ?)', [
    name,
    type,
  ]);
};

const updateCategory = async (id, { name, type }) => {
  return runAsync('UPDATE categories SET name = ?, type = ? WHERE id = ?', [
    name,
    type,
    id,
  ]);
};

const deleteCategory = async (id) => {
  return runAsync('DELETE FROM categories WHERE id = ?', [id]);
};

module.exports = {
  getAllCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
};
