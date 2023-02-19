import { start, stop } from "@/server/kafka";
import { ServiceHealth } from "@codrjs/health";

start();

process.on("SIGINT", async function () {
  console.log("Shutting down...");
  console.log(JSON.stringify(ServiceHealth.getStatus(), null, 2));

  await stop();

  process.exit();
});
