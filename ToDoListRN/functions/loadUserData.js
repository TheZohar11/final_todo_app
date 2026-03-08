import AsyncStorage from "@react-native-async-storage/async-storage";

export async function loadUserData() {
  const storedData = await AsyncStorage.getItem("userData");
  return storedData ? JSON.parse(storedData) : null;
}
