module.exports = {
  expo: {
    name: "fitness-app",
    version: "1.0.0",
    updates: {
      url: "https://u.expo.dev/d4831833-e11e-4af2-ba79-902d681cf70e"
    },
    runtimeVersion: {
      policy: "appVersion"
    },
    android: {
      package: "com.ay320.fitnessapp"
    },
    extra: {
      API_BASE_URL: "http://13.42.65.113:8000",
      eas: {
        projectId: "d4831833-e11e-4af2-ba79-902d681cf70e"
      }
    }
  }
};
