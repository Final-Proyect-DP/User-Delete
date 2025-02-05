const kafka = require('../config/kafkaConfig');

const producer = kafka.producer();

const run = async () => {
  await producer.connect();
  console.log('Kafka producer ready');
};

run().catch(console.error);

module.exports = producer;
