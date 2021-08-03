require('module-alias/register')
const { findOrCreateCollection } = require('../../../commondb')
const mongo = require('../util/mongo')
const fetcher = require('./fetcher')

const collectionName = 'gitlab_merge_request_notes'

module.exports = {
  async collect ({ db, projectId, forceAll }) {
    if (!projectId) {
      throw new Error('Failed to collect gitlab data, projectId is required')
    }

    console.info('INFO >>> gitlab collecting notes for project', projectId)
    const mergeRequests = await mongo.findCollection('gitlab_merge_requests', { projectId }, db)
    console.log(`INFO >>> gitlab collecting notes, found ${mergeRequests.length} MRs for project ${projectId}`)
    for (const mr of mergeRequests) {
      await module.exports.collectByMergeRequestIid(db, projectId, mr.iid, forceAll)
    }
    console.info('INFO >>> gitlab collecting notes for project done!', projectId)
  },

  async collectByMergeRequestIid (db, projectId, mergeRequestIid, forceAll) {
    const notesCollection = await findOrCreateCollection(db, collectionName)
    const response = await fetcher.fetch(`projects/${projectId}/merge_requests/${mergeRequestIid}/notes`)
    const notes = response.data

    for (const note of notes) {
      await notesCollection.findOneAndUpdate(
        { id: note.id },
        { $set: note },
        { upsert: true }
      )
    }
  }
}