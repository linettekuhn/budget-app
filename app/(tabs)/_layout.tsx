import { HapticTab } from "@/components/haptic-tab";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import Entypo from "@expo/vector-icons/Entypo";
import Octicons from "@expo/vector-icons/Octicons";
import { Tabs } from "expo-router";
import { SQLiteDatabase, SQLiteProvider } from "expo-sqlite";
import React, { useCallback } from "react";
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

  const createDatabase = useCallback(async (db: SQLiteDatabase) => {
    try {
      await db.execAsync(`
        CREATE TABLE IF NOT EXISTS categories (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          color TEXT NOT NULL
        );
        CREATE TABLE IF NOT EXISTS transactions (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          amount DECIMAL(13, 2) NOT NULL,
          type TEXT NOT NULL,
          date TEXT DEFAULT (datetime('now')),
          categoryId INTEGER,
          FOREIGN KEY (categoryId) REFERENCES categories(id)
          );
      `);

      type CountResult = { count: number };
      const existingCategories = await db.getAllAsync<CountResult>(
        "SELECT COUNT(*) as count FROM categories"
      );
      // TODO: dark and light mode category colors
      if (existingCategories[0].count === 0) {
        await db.execAsync(`
          INSERT INTO categories (name, color) VALUES
            ('Food', '#FF6B6B'),
            ('Transport', '#4ECDC4'),
            ('Entertainment', '#FFD93D'),
            ('Bills', '#6A4C93');
        `);
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.log(error.message);
      } else {
        console.log("error creating database");
      }
    }
  }, []);

  return (
    <SQLiteProvider databaseName="transactions.db" onInit={createDatabase}>
      <Tabs
        safeAreaInsets={{ bottom: 0 }}
        screenOptions={{
          tabBarActiveTintColor: Colors[colorScheme ?? "light"].tint,
          headerShown: false,
          tabBarButton: HapticTab,
          tabBarShowLabel: false,
          tabBarStyle: {
            backgroundColor: Colors[colorScheme ?? "light"].tabsColor,
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
                      ? Colors[colorScheme ?? "light"].tabIconSelected
                      : Colors[colorScheme ?? "light"].secondary1
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
    </SQLiteProvider>
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
