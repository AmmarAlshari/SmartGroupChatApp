import { StatusBar } from "expo-status-bar";
import { Text, View } from "react-native";
import { Link } from "expo-router";
import "../global.css";

export default function App() {
  return (
    <View className="flex-1 items-center justify-center bg-black">
      <Text className="text-3xl text-primary font-semibold ">SGCOA</Text>
      <StatusBar style="auto" />
      <Link href="/sign-up" style={{ color: "blue" }}>
        go to profile
      </Link>
    </View>
  );
}
