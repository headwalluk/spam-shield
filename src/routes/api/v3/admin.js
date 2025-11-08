const express = require('express');
const router = express.Router();
const {
  getUsers,
  createUser,
  updateUser,
  deleteUser
} = require('../../../controllers/userController');
const passport = require('../../../middleware/passport');

function isAdmin(req, res, next) {
  if (req.user && req.user.roles.includes('administrator')) {
    return next();
  }
  console.log(req.user); // Outputs "undefined"
  res.status(403).send('Forbidden C');
}

router.use(passport.authenticate('headerapikey', { session: false }), isAdmin);

router.get('/users', getUsers);
router.post('/users', createUser);
router.put('/users/:id', updateUser);
router.delete('/users/:id', deleteUser);

module.exports = router;
