const express = require('express');
const authRoutes = require('./auth.routes');
const taskRoutes = require('./task.routes');
const userRoutes = require('./user.routes');

const router = express.Router();

router.get('/', (_req, res) => {
  res.json({
    success: true,
    data: {
      name: 'Backend Assignment API',
      version: 'v1',
      endpoints: ['/auth', '/tasks', '/users'],
    },
  });
});

router.use('/auth', authRoutes);
router.use('/tasks', taskRoutes);
router.use('/users', userRoutes);

module.exports = router;
