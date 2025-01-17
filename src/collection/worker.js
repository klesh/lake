#!/usr/bin/env node

require('module-alias/register')
const axios = require('axios')
const _has = require('lodash/has')

const dbConnector = require('@mongo/connection')
const { collection } = require('../plugins')
const consumer = require('../queue/consumer')
const enrichmentApiUrl = require('@config/resolveConfig').enrichment.connectionString

const queue = 'collection'

const jobHandler = async (job) => {
  const {
    db, client
  } = await dbConnector.connect()

  try {
    await Promise.all(
      Object.keys(job)
        .filter(key => _has(collection, key))
        .map(pluginName => collection[pluginName](db, job[pluginName]))
    )
  } catch (error) {
    console.log('Failed to collect', error)
  } finally {
    dbConnector.disconnect(client)
  }

  await axios.post(enrichmentApiUrl, job)
}

consumer(queue, jobHandler)
