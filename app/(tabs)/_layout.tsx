import { HapticTab } from "@/components/haptic-tab";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import Entypo from "@expo/vector-icons/Entypo";
import Octicons from "@expo/vector-icons/Octicons";
import { Tabs } from "expo-router";
import React from "react";
import { StyleSheet, View } from "react-native";

const TabIcon = (props: any) => {
  const IconComponent = props.IconComponent;
  const name = props.name;
  const size = props.size;
  const color = props.color;
  const focused = props.focused;

  return (
    <View style={styles.tabIconContainer}>
      <IconComponent name={name} size={size} color={color} />
      {focused && (
        <View style={[styles.indicatorDot, { backgroundColor: color }]} />
      )}
    </View>
  );
};

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const tabsBgColor = Colors[colorScheme ?? "light"].tabBackground;
  const activeTabColor = Colors[colorScheme ?? "light"].secondary[500];

  return (
    <Tabs
      safeAreaInsets={{ bottom: 0 }}
      screenOptions={{
        tabBarActiveTintColor: activeTabColor,
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarShowLabel: false,
        tabBarStyle: {
          backgroundColor: tabsBgColor,
          position: "absolute",
          bottom: 35,
          borderRadius: 25,
          marginHorizontal: 20,
          height: 60,
          paddingBottom: 0,
        },
        tabBarItemStyle: {
          padding: 0,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
        },
        tabBarIconStyle: {
          marginVertical: 0,
          paddingBottom: 2,
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ focused, color }) => (
            <TabIcon
              IconComponent={Octicons}
              name="home"
              size={24}
              color={color}
              focused={focused}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="rewards"
        options={{
          title: "Rewards",
          tabBarIcon: ({ focused, color }) => (
            <TabIcon
              IconComponent={Octicons}
              name="trophy"
              size={23}
              color={color}
              focused={focused}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="transaction"
        options={{
          title: "Transaction",
          tabBarIcon: ({ focused }) => (
            <View style={styles.transactionBtn}>
              <Octicons
                name="feed-plus"
                size={40}
                color={
                  focused
                    ? activeTabColor
                    : Colors[colorScheme ?? "light"].primary[500]
                }
              />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="(budget)"
        options={{
          title: "Budget",
          tabBarIcon: ({ focused, color }) => (
            <TabIcon
              IconComponent={Entypo}
              name="circular-graph"
              size={24}
              color={color}
              focused={focused}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color, focused }) => (
            <TabIcon
              IconComponent={Octicons}
              name="person"
              size={24}
              color={color}
              focused={focused}
            />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  transactionBtn: {
    width: 40,
    alignItems: "center",
    justifyContent: "center",
    height: "100%",
    paddingBottom: 0,
  },
  tabIconContainer: {
    alignItems: "center",
    justifyContent: "center",
    height: "100%",
    paddingBottom: 5,
  },
  indicatorDot: {
    position: "absolute",
    bottom: 5,
    width: 5,
    height: 5,
    borderRadius: 3,
  },
});
