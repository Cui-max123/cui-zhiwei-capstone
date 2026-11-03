function parsePagination(query = {}, defaultLimit = 9) {
  const page = Math.max(1, Number.parseInt(query.page, 10) || 1);
  const requested = Number.parseInt(query.limit, 10) || defaultLimit;
  const limit = Math.min(50, Math.max(1, requested));
  return { page, limit, skip: (page - 1) * limit };
}

function pageMeta({ page, limit, total }) {
  return {
    page,
    limit,
    total,
    pages: Math.max(1, Math.ceil(total / limit))
  };
}

module.exports = { parsePagination, pageMeta };
