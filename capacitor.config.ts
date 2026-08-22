import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "fr.javachrist.ridecloud",
  appName: "RideCloud",
  webDir: "native-www",
  server: {
    url: "https://ridecloud.app"
  }
};

export default config;
