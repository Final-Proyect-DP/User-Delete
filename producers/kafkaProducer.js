const kafka = require('../config/kafkaConfig');
const producer = kafka.producer();

const run = async () => {
  await producer.connect();
};

run().catch(console.error);

module.exports = producer;
