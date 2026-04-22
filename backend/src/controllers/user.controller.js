const prisma = require('../config/prisma');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');

const listUsers = asyncHandler(async (_req, res) => {
  const users = await prisma.user.findMany({
    orderBy: { createdAt: 'desc' },
    select: { id: true, name: true, email: true, role: true, createdAt: true },
  });
  res.json({ success: true, data: users });
});

const updateUserRole = asyncHandler(async (req, res) => {
  const { role } = req.body;
  if (!['USER', 'ADMIN'].includes(role)) throw ApiError.badRequest('role must be USER or ADMIN');

  const user = await prisma.user.update({
    where: { id: req.params.id },
    data: { role },
    select: { id: true, name: true, email: true, role: true, createdAt: true },
  });
  res.json({ success: true, data: user });
});

const deleteUser = asyncHandler(async (req, res) => {
  if (req.params.id === req.user.id) {
    throw ApiError.badRequest('You cannot delete your own account from this endpoint');
  }
  await prisma.user.delete({ where: { id: req.params.id } });
  res.status(204).send();
});

module.exports = { listUsers, updateUserRole, deleteUser };
