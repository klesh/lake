require('module-alias/register')
const amqp = require('amqplib/callback_api')

const connectionString = require('@config/resolveConfig').rabbitMQ.connectionString

module.exports = (queue, callback) => {
  amqp.connect(connectionString, function (error0, connection) {
    if (error0) {
      throw error0
    }
    connection.createChannel(function (error1, channel) {
      if (error1) {
        throw error1
      }

      channel.assertQueue(queue)

      console.log(' [*] Waiting for messages in %s. To exit press CTRL+C', queue)

      channel.consume(queue, async function (msg) {
        const job = JSON.parse(msg.content.toString())

        await callback(job)
      }, {
        noAck: true
      })
    })
  })
}
