import { View, Text, ScrollView, Alert } from "react-native";
import React, { useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import FormField from "../../components/FormField";
import CustomButton from "../../components/CustomButton";
import { createUser } from "../../lib/appwrite";
import { router } from "expo-router";

const SignUp = () => {
  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [emailError, setEmailError] = useState(false);
  const [passwordError, setPasswordError] = useState(false);

  const validateEmail = (email) => {
    if (!email.includes("edu")) {
      setEmailError(true);
    } else {
      setEmailError(false);
    }
  };

  const validatePassword = (password) => {
    const regex = /^(?=.*[A-Z])(?=.*\d)(?=.*[a-zA-Z]).{6,}$/;
    if (!regex.test(password)) {
      setPasswordError(true);
    } else {
      setPasswordError(false);
    }
  };

  const submit = async () => {
    if (form.username === "" || form.email === "" || form.password === "") {
      Alert.alert("Error", "Please fill in all fields");
    }

    if (emailError || passwordError) {
      Alert.alert("Error", "Fill the fields as required");
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await createUser(form.email, form.password, form.username);
      router.replace("/home");
    } catch (error) {
      Alert.alert("Error", error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView className="bg-primary h-full">
      <ScrollView>
        <View className="w-full justify-center min-h-[70vh] px-4 my-6">
          <Text className="text-2xl text-white text-semibold mt-10 font-psemibold">
            Create Account in {""} <Text className="text-blue-400">SGCOA</Text>
          </Text>
          <FormField
            title="Account Name"
            value={form.username}
            handleChangeText={(e) => setForm({ ...form, username: e })}
            otherStyles="mt-7"
          />
          <FormField
            title="Email"
            value={form.email}
            handleChangeText={(e) => {
              setForm({ ...form, email: e });
              validateEmail(e);
            }}
            otherStyles="mt-7"
            keyboardType="email-address"
          />
          {emailError && (
            <Text className="text-red-500 mt-2 font-psemibold">
              Email must contain 'edu'.
            </Text>
          )}
          <FormField
            title="Password"
            value={form.password}
            handleChangeText={(e) => {
              setForm({ ...form, password: e });
              validatePassword(e);
            }}
            otherStyles="mt-7"
            secureTextEntry={true}
          />
          {passwordError ? (
            <Text className="text-red-500 mt-2 font-psemibold ">
              Password must contain one uppercase A-Z and numbers 0-9.
            </Text>
          ) : (
            <Text className="text-green-500 mt-2 font-psemibold">
              Password meets the requirements.
            </Text>
          )}
          <CustomButton
            title={"Sign Up"}
            handlePress={submit}
            containerStyles="mt-7"
            isLoading={isSubmitting}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default SignUp;
