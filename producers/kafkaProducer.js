const kafka = require('../config/kafkaConfig');

const producer = kafka.producer();

const run = async () => {
  await producer.connect();
  console.log('Productor de Kafka listo');
};

run().catch(console.error);

module.exports = producer;
