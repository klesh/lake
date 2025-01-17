const issues = require('./issues')

async function enrich (rawDb, enrichedDb, { boardId, forceAll }) {
  const args = { rawDb, enrichedDb, boardId: Number(boardId), forceAll }
  await issues.enrich(args)
}

module.exports = { enrich }
