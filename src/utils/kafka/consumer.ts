import {
  Consumer as KafkaConsumer,
  ConsumerSubscribeTopics,
  EachBatchPayload,
  EachMessagePayload,
  KafkaMessage,
} from "kafkajs";
import { client } from "./config";
import ServiceHealth from "@/utils/health";

type MessageProcessor<MessageFormat> = (
  message: MessageFormat,
  extra: KafkaMessage
) => void;

export default class Consumer<MessageFormat> {
  private consumer: KafkaConsumer;
  private processor: MessageProcessor<MessageFormat>;
  private topics: ConsumerSubscribeTopics;

  public constructor({
    processor,
    groupId,
    topics,
  }: {
    processor: MessageProcessor<MessageFormat>;
    topics: string[];
    groupId: string;
  }) {
    this.processor = processor;
    this.consumer = client.consumer({ groupId });
    this.topics = {
      topics,
      fromBeginning: false,
    };

    for (const topic of topics) {
      ServiceHealth.addConsumer(topic, this.consumer);
    }
  }

  public async start(): Promise<void> {
    try {
      await this.consumer.connect();
      await this.consumer.subscribe(this.topics);

      await this.consumer.run({
        eachMessage: async (messagePayload: EachMessagePayload) => {
          const { topic, partition, message } = messagePayload;
          const value = message.value?.toString();

          if (value) {
            const payload = JSON.parse(value) as MessageFormat;

            this.processor(payload, message);
            const prefix = `${topic}[${partition} | ${message.offset}] / ${message.timestamp}`;
            this.consumer
              .logger()
              .info(`- ${prefix} ${message.key}#${message.value}`);
          } else {
            const prefix = `${topic}[${partition} | ${message.offset}] / ${message.timestamp}`;
            this.consumer
              .logger()
              .error(`- ${prefix} ${message.key}#${message.value}`);
          }
        },
      });
    } catch (error) {
      const err = error?.toString()
        ? error.toString()
        : `An error occurred while trying to consume: ${this.topics.topics.join(
            ", "
          )}`;
      this.consumer.logger().error(err);
    }
  }

  public async startBatchConsumer(): Promise<void> {
    try {
      await this.consumer.connect();
      await this.consumer.subscribe(this.topics);

      await this.consumer.run({
        eachBatch: async (eachBatchPayload: EachBatchPayload) => {
          const { batch } = eachBatchPayload;
          for (const message of batch.messages) {
            const prefix = `${batch.topic}[${batch.partition} | ${message.offset}] / ${message.timestamp}`;
            console.log(`- ${prefix} ${message.key}#${message.value}`);
          }
        },
      });
    } catch (error) {
      const err = error?.toString()
        ? error.toString()
        : `An error occurred while trying to consume: ${this.topics.topics.join(
            ", "
          )}`;
      this.consumer.logger().error(err);
    }
  }

  public async shutdown(): Promise<void> {
    await this.consumer.disconnect();
  }
}
