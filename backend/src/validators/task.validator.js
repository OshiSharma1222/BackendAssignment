const { body, param, query } = require('express-validator');

const STATUSES = ['PENDING', 'IN_PROGRESS', 'DONE'];
const PRIORITIES = ['LOW', 'MEDIUM', 'HIGH'];

const createTaskRules = [
  body('title').trim().isLength({ min: 1, max: 160 }).withMessage('Title is required (max 160)').escape(),
  body('description').optional({ nullable: true }).isString().isLength({ max: 2000 }).withMessage('Description too long'),
  body('status').optional().isIn(STATUSES).withMessage(`status must be one of ${STATUSES.join(', ')}`),
  body('priority').optional().isIn(PRIORITIES).withMessage(`priority must be one of ${PRIORITIES.join(', ')}`),
  body('dueDate').optional({ nullable: true }).isISO8601().withMessage('dueDate must be ISO 8601'),
];

const updateTaskRules = [
  param('id').isUUID().withMessage('Invalid task id'),
  body('title').optional().trim().isLength({ min: 1, max: 160 }).escape(),
  body('description').optional({ nullable: true }).isString().isLength({ max: 2000 }),
  body('status').optional().isIn(STATUSES),
  body('priority').optional().isIn(PRIORITIES),
  body('dueDate').optional({ nullable: true }).isISO8601(),
];

const idParamRules = [param('id').isUUID().withMessage('Invalid task id')];

const listRules = [
  query('page').optional().isInt({ min: 1 }).toInt(),
  query('limit').optional().isInt({ min: 1, max: 100 }).toInt(),
  query('status').optional().isIn(STATUSES),
  query('priority').optional().isIn(PRIORITIES),
  query('search').optional().isString().isLength({ max: 120 }),
];

module.exports = { createTaskRules, updateTaskRules, idParamRules, listRules };
