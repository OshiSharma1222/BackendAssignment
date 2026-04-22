const prisma = require('../config/prisma');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');

function baseScope(user) {
  return user.role === 'ADMIN' ? {} : { ownerId: user.id };
}

const listTasks = asyncHandler(async (req, res) => {
  const page = req.query.page || 1;
  const limit = req.query.limit || 10;
  const skip = (page - 1) * limit;

  const where = {
    ...baseScope(req.user),
    ...(req.query.status ? { status: req.query.status } : {}),
    ...(req.query.priority ? { priority: req.query.priority } : {}),
    ...(req.query.search
      ? {
          OR: [
            { title: { contains: req.query.search, mode: 'insensitive' } },
            { description: { contains: req.query.search, mode: 'insensitive' } },
          ],
        }
      : {}),
  };

  const [items, total] = await Promise.all([
    prisma.task.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
      include: {
        owner: { select: { id: true, name: true, email: true } },
      },
    }),
    prisma.task.count({ where }),
  ]);

  res.json({
    success: true,
    data: items,
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit) || 1,
    },
  });
});

const getTask = asyncHandler(async (req, res) => {
  const task = await prisma.task.findFirst({
    where: { id: req.params.id, ...baseScope(req.user) },
    include: { owner: { select: { id: true, name: true, email: true } } },
  });
  if (!task) throw ApiError.notFound('Task not found');
  res.json({ success: true, data: task });
});

const createTask = asyncHandler(async (req, res) => {
  const { title, description, status, priority, dueDate } = req.body;
  const task = await prisma.task.create({
    data: {
      title,
      description: description ?? null,
      status: status || 'PENDING',
      priority: priority || 'MEDIUM',
      dueDate: dueDate ? new Date(dueDate) : null,
      ownerId: req.user.id,
    },
  });
  res.status(201).json({ success: true, data: task });
});

const updateTask = asyncHandler(async (req, res) => {
  const existing = await prisma.task.findFirst({
    where: { id: req.params.id, ...baseScope(req.user) },
  });
  if (!existing) throw ApiError.notFound('Task not found');

  const { title, description, status, priority, dueDate } = req.body;
  const task = await prisma.task.update({
    where: { id: existing.id },
    data: {
      ...(title !== undefined ? { title } : {}),
      ...(description !== undefined ? { description } : {}),
      ...(status !== undefined ? { status } : {}),
      ...(priority !== undefined ? { priority } : {}),
      ...(dueDate !== undefined ? { dueDate: dueDate ? new Date(dueDate) : null } : {}),
    },
  });
  res.json({ success: true, data: task });
});

const deleteTask = asyncHandler(async (req, res) => {
  const existing = await prisma.task.findFirst({
    where: { id: req.params.id, ...baseScope(req.user) },
  });
  if (!existing) throw ApiError.notFound('Task not found');

  await prisma.task.delete({ where: { id: existing.id } });
  res.status(204).send();
});

module.exports = { listTasks, getTask, createTask, updateTask, deleteTask };
