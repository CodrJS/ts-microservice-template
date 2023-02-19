# Kafka Micro-Service Template

## Getting Started

```bash
# Clone the repo
git clone git@github.com:CodrJS/ts-kafka-template.git

# Install yarn if you don't have it already
npm install -g yarn

# Install dependencies, build and run the code
yarn install
yarn build
yarn start
```

## Kafka

Custom built consumer and producer classes can be imported from `@/utils/kafka`.

## Heath Checks

This repository has a custom-built service health tracker. ServiceHealth is a singleton located at `src/utils/health/index.ts`. This utility is used in an Express api server to allow gathering information about the system's health.