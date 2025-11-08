const express = require('express');
const router = express.Router();
const { isAuthenticated } = require('../../middleware/auth');

function isAdmin(req, res, next) {
  if (req.user && req.user.roles.includes('administrator')) {
    return next();
  }
  res.status(403).send('Forbidden D');
}

router.use(isAuthenticated, isAdmin);

router.get('/', (req, res) => {
  res.render('pages/admin/index', { title: 'Admin' });
});

const userModel = require('../../models/userModel');

router.get('/users', async (req, res) => {
  const { page = 1, limit = 10, email } = req.query;
  const users = await userModel.findAll({
    page: parseInt(page, 10),
    limit: parseInt(limit, 10),
    email
  });
  res.render('pages/admin/users', {
    title: 'User Management',
    users,
    currentPage: parseInt(page, 10),
    limit: parseInt(limit, 10),
    email
  });
});

module.exports = router;
