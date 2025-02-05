import { View, Text, Image, Platform } from "react-native";
import React from "react";
import { Tabs, Redirect } from "expo-router";
import { icons } from "../../constants";

const TabsIcon = ({ icon, color, name, focused }) => {
  return (
    <View className="items-center justify-center gap-2">
      <Image
        source={icon}
        resizeMode="contain"
        tintColor={color}
        className="w-6 h-6"
        style={Platform.OS === "web" ? { width: 25, height: 25 } : {}}
      />
      <Text
        className={`${
          focused ? "font-psemibold" : "font-pregular"
        } text-center text-xs`}
        style={{
          color: color,
          width: 70, // Adjust the width based on  layout
          textAlign: "center", // Ensures proper alignment
        }}
        numberOfLines={1} // Restrict text to a single line
      >
        {name}
      </Text>
    </View>
  );
};

const TabsLayout = () => {
  return (
    <>
      {/* modify the tab propertes */}
      <Tabs
        screenOptions={{
          tabBarShowLabel: false,
          tabBarActiveTintColor: "blue",
          tabBarInactiveTintColor: "#CDCDE0",
          tabBarStyle: {
            backgroundColor: "#161622",
            borderTopWidth: 2,
            borderTopColor: "#232533",
            height: 100,
            paddingTop: 20,
          },
        }}
      >
        <Tabs.Screen
          name="home"
          options={{
            title: "Home",
            headerShown: false,
            tabBarIcon: ({ color, focused }) => (
              <TabsIcon
                icon={icons.home}
                color={color}
                name={"Home"}
                focused={focused}
              />
            ),
          }}
        />
        <Tabs.Screen
          name="CreateJoin"
          options={{
            title: "Create/Join",
            headerShown: false,
            tabBarIcon: ({ color, focused }) => (
              <TabsIcon
                icon={icons.plus}
                color={color}
                name={"Create/Join"}
                focused={focused}
              />
            ),
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: "Profile",
            headerShown: false,
            tabBarIcon: ({ color, focused }) => (
              <TabsIcon
                icon={icons.profile}
                color={color}
                name={"Profile"}
                focused={focused}
              />
            ),
          }}
        />
      </Tabs>
    </>
  );
};

export default TabsLayout;
