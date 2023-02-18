import {
  Message,
  Producer as KafkaProducer,
  ProducerBatch,
  TopicMessages,
} from "kafkajs";
import { client } from "./config";
import ServiceHealth from "@/utils/health";

export default class Producer<MessageFormat> {
  private producer: KafkaProducer;
  private topic: string;

  constructor(topic: string) {
    this.producer = this.createProducer();
    this.topic = topic;

    ServiceHealth.addProducer(topic, this.producer);
  }

  public async start(): Promise<void> {
    try {
      await this.producer.connect();
    } catch (error) {
      this.producer
        .logger()
        .error("Error connecting the producer: ", error as Object | undefined);
    }
  }

  public async shutdown(): Promise<void> {
    await this.producer.disconnect();
  }

  public async sendBatch(messages: Array<MessageFormat>): Promise<void> {
    // translate messages to kafka messages
    const kafkaMessages: Array<Message> = messages.map(message => {
      return {
        value: JSON.stringify(message),
      };
    });
    const topicMessages: TopicMessages = {
      topic: this.topic,
      messages: kafkaMessages,
    };

    // create batch request
    const batch: ProducerBatch = {
      topicMessages: [topicMessages],
    };

    // send it out
    await this.producer.sendBatch(batch);
  }

  private createProducer(): KafkaProducer {
    return client.producer({
      allowAutoTopicCreation: true,
    });
  }
}
