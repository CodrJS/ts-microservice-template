import ServiceHealth from "@/utils/health";
import { admin } from "../utils/kafka";
import TestConsumer from "./consumers/TestConsumer";
import TestProducer from "./producers/TestProducer";

export const start = function start() {
  admin.connect().then(() => {
    console.log("Kafka admin has entered the chat.");
  });

  TestConsumer.start();
  TestProducer.start();

  console.log(ServiceHealth.getStatus());
};

export const stop = async function stop() {
  await TestConsumer.shutdown();
  await TestProducer.shutdown();

  await admin.disconnect().then(() => {
    console.log("Kafka admin has left the chat.");
  });
};

process.on("SIGINT", async function () {
  console.log("Shutting down...");
  console.log(JSON.stringify(ServiceHealth.getStatus(), null, 2));

  await stop();

  process.exit();
});
