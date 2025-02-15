import React, { useEffect, useState } from "react";
import { View, Text, ActivityIndicator, Button } from "react-native";
import { useRoute } from "@react-navigation/native";
import { account } from "../../lib/appwrite";
import { useRouter } from "expo-router";

const Verification = () => {
  const route = useRoute();
  const router = useRouter();
  const { userId, secret } = route.params || {}; // Ensure params are defined
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [isVerified, setIsVerified] = useState(false);

  useEffect(() => {
    const verifyEmail = async () => {
      if (!userId || !secret) {
        // checks if userId or secret is missing
        setMessage("Verifeing Account ...");
        setLoading(false);
        return;
      }

      try {
        // updateVerification is a method from the Appwrite SDK passing the userId and secret
        await account.updateVerification(userId, secret);
        setMessage("Email verified successfully!");
        setIsVerified(true);
      } catch (error) {
        console.error("Verification failed:", error);
        setMessage("Failed to verify email.");
      } finally {
        setLoading(false);
      }
    };

    verifyEmail();
  }, [userId, secret]);

  useEffect(() => {
    if (!loading && message === "Email verified successfully!") {
      // Check if the email is verified and no loading
      router.replace("/home");
    }
  }, [loading, message, router]);

  useEffect(() => {
    // Check if the email is verified every 15 seconds
    const checkEmailVerification = async () => {
      try {
        const user = await account.get();
        if (user.emailVerification) {
          setIsVerified(true);
          setMessage("Email verified successfully!");
        }
      } catch (error) {}
    };

    const intervalId = setInterval(checkEmailVerification, 15000); // Check every 15 seconds

    return () => clearInterval(intervalId); // Cleanup interval on component unmount
  }, []);

  return (
    <View className="flex-1 justify-center items-center bg-primary">
      {loading ? (
        <>
          <ActivityIndicator size="large" color="#0000ff" />
          <Text className="text-lg">Verifying your email...</Text>
        </>
      ) : (
        <>
          <Text className="text-2xl text-white font-psemibold">{message}</Text>
          {isVerified && (
            <Button
              title="Go to Sign In"
              onPress={() => router.push("/sign-in")}
            />
          )}
        </>
      )}
    </View>
  );
};

export default Verification;
