import { StatusBar } from "expo-status-bar";
import { Image, ScrollView, Text, View } from "react-native";
import { Redirect, router } from "expo-router";
import "../global.css";
import { SafeAreaView } from "react-native-safe-area-context";
import { images } from "../constants";
import CustomButton from "../components/CustomButton";
// onboarding screen the main screen
export default function App() {
  return (
    <SafeAreaView className="bg-primary h-full">
      <ScrollView contentContainerStyle={{ height: "100%" }}>
        <View className="w-full justify-center items-center h-full px-4">
          <Image
            source={images.logo}
            className="w-[130px] h-[130px]"
            resizeMode="contain"
          />
          <View className="relative mt-1">
            <Text className="text-3xl text-white font-bold text-center">
              Secure chats made simple! with{" "}
              <Text className="text-blue-400">SGCOA</Text>
            </Text>
            <Text className="text-sm font-pregular text-gray-100 mt-7 text-center">
              Where safety meets connection—group chats made secure and easy!
              with Smart Group Chat Application.
            </Text>
          </View>
          <CustomButton
          title={'Get Started'}
          handlePress={()=> router.push('/sign-up')} 
          containerStyles="w-full mt-10"/>
        </View>
      </ScrollView>
      <StatusBar backgroundColor="#161622" style="light"/>
    </SafeAreaView>
  );
}
