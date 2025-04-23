import Constants from "expo-constants";

const API_BASE_URL: string = Constants.expoConfig?.extra?.API_BASE_URL || "http://3.8.177.201:8000";
export default API_BASE_URL;
