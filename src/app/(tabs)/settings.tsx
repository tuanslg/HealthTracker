import * as Notifications from "expo-notifications";
import { router } from "expo-router";
import * as SQLite from "expo-sqlite";
import {
  Bell,
  ChevronRight,
  Droplet,
  LogIn,
  LogOut,
  User,
} from "lucide-react-native";
import React, { useEffect, useState } from "react";
import {
  Alert,
  ScrollView,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import AsyncStorage from "@react-native-async-storage/async-storage";
import { useTranslation } from "react-i18next";
import { useAuthStore } from "../../store/authStore";

// Notification handler for foreground notifications
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export default function SettingsScreen() {
  const [isReminderEnabled, setIsReminderEnabled] = useState(false);
  const [reminderInterval, setReminderInterval] = useState(2); // hours
  const { user, isGuest, logout } = useAuthStore();
  const { t, i18n } = useTranslation();

  const changeLanguage = async (lng: string) => {
    i18n.changeLanguage(lng);
    await AsyncStorage.setItem("settings.lang", lng);
  };

  useEffect(() => {
    loadSettings();
    checkExistingPermissions();
  }, []);

  const loadSettings = async () => {
    try {
      const db = await SQLite.openDatabaseAsync("health.db");
      await db.execAsync(
        "CREATE TABLE IF NOT EXISTS Settings (id INTEGER PRIMARY KEY NOT NULL, reminderEnabled INTEGER, reminderInterval INTEGER);",
      );

      const result: any = await db.getFirstAsync(
        "SELECT * FROM Settings WHERE id = 1",
      );
      if (result) {
        setIsReminderEnabled(result.reminderEnabled === 1);
        setReminderInterval(result.reminderInterval || 2);
      } else {
        await db.runAsync(
          "INSERT INTO Settings (id, reminderEnabled, reminderInterval) VALUES (1, 0, 2)",
        );
      }
    } catch (error) {
      console.log("Error loading DB settings", error);
    }
  };

  const saveSettings = async (enabled: boolean, interval: number) => {
    try {
      const db = await SQLite.openDatabaseAsync("health.db");
      await db.runAsync(
        "UPDATE Settings SET reminderEnabled = ?, reminderInterval = ? WHERE id = 1",
        [enabled ? 1 : 0, interval],
      );
    } catch (error) {
      console.log("Error saving DB settings", error);
    }
  };

  const checkExistingPermissions = async () => {
    const { status } = await Notifications.getPermissionsAsync();
    if (status !== "granted") {
      setIsReminderEnabled(false);
    }
  };

  const scheduleWaterReminder = async (intervalHours: number) => {
    // Cancel all previously scheduled reminders first
    await Notifications.cancelAllScheduledNotificationsAsync();

    // Schedule a repeating notification every intervalHours * 3600 seconds
    const notificationId = await Notifications.scheduleNotificationAsync({
      content: {
        title: "💦 Time to drink water!",
        body: "Stay hydrated. It's been a while, drink a glass of water now.",
      },
      trigger: {
        seconds: intervalHours * 3600, // Converts hours to seconds
        type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
        repeats: true,
      },
    });

    console.log("Scheduled repeating notification with id:", notificationId);
    Alert.alert(
      t("settings.success"),
      t("settings.water_reminders_scheduled", { hours: intervalHours }),
    );
  };

  const cancelWaterReminder = async () => {
    await Notifications.cancelAllScheduledNotificationsAsync();
    Alert.alert(
      t("settings.turned_off"),
      t("settings.water_reminders_cancelled"),
    );
  };

  const toggleReminder = async (value: boolean) => {
    if (value) {
      const { status } = await Notifications.requestPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          t("settings.permission_denied"),
          t("settings.please_allow_notifications"),
        );
        return;
      }
      setIsReminderEnabled(true);
      await scheduleWaterReminder(reminderInterval);
      await saveSettings(true, reminderInterval);
    } else {
      setIsReminderEnabled(false);
      await cancelWaterReminder();
      await saveSettings(false, reminderInterval);
    }
  };

  const changeInterval = async (hours: number) => {
    setReminderInterval(hours);
    if (isReminderEnabled) {
      await scheduleWaterReminder(hours);
    }
    await saveSettings(isReminderEnabled, hours);
  };

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      className="flex-1"
      contentContainerClassName="p-6 pt-10 pb-20"
    >
      <Text className="text-3xl font-bold text-slate-800">
        {t("settings.title")}
      </Text>
      <Text className="text-base text-slate-500 mb-8 mt-1">
        {t("settings.subtitle")}
      </Text>

      {/* Account Section */}
      <View className="mb-8">
        <Text className="text-lg font-bold text-slate-800 mb-4">
          {t("settings.account")}
        </Text>
        <View className="bg-white rounded-[20px] p-5 shadow-sm">
          {isGuest ? (
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center">
                <View className="w-12 h-12 rounded-2xl bg-slate-100 justify-center items-center mr-4">
                  <User color="#64748B" size={24} />
                </View>
                <View>
                  <Text className="text-lg font-semibold text-slate-800 mb-1">
                    {t("settings.guest")}
                  </Text>
                  <Text className="text-sm text-slate-500">
                    {t("settings.guest_desc")}
                  </Text>
                </View>
              </View>
              <TouchableOpacity
                className="flex-row items-center bg-blue-500 px-4 py-2.5 rounded-xl"
                onPress={() => router.push("/(auth)/login")}
              >
                <LogIn color="#FFF" size={16} />
                <Text className="text-white font-semibold ml-2">
                  {t("settings.login")}
                </Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center">
                <View className="w-12 h-12 rounded-2xl bg-blue-100 justify-center items-center mr-4">
                  <User color="#3B82F6" size={24} />
                </View>
                <View>
                  <Text className="text-lg font-semibold text-slate-800 mb-1">
                    {user?.name}
                  </Text>
                  <Text className="text-sm text-slate-500">{user?.email}</Text>
                </View>
              </View>
              <TouchableOpacity
                className="p-2.5 bg-red-100 rounded-xl"
                onPress={() => {
                  logout();
                }}
              >
                <LogOut color="#EF4444" size={20} />
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>

      <View className="mb-8">
        <Text className="text-lg font-bold text-slate-800 mb-4">
          {t("settings.reminders")}
        </Text>

        <View className="bg-white rounded-[20px] p-5 shadow-sm">
          <View className="flex-row items-center">
            <View className="w-12 h-12 rounded-2xl bg-blue-100 justify-center items-center mr-4">
              <Droplet color="#3B82F6" size={24} />
            </View>
            <View className="flex-1">
              <Text className="text-lg font-semibold text-slate-800 mb-1">
                {t("settings.drink_water")}
              </Text>
              <Text className="text-sm text-slate-500">
                {t("settings.drink_water_desc")}
              </Text>
            </View>
            <Switch
              value={isReminderEnabled}
              onValueChange={toggleReminder}
              trackColor={{ false: "#CBD5E1", true: "#3B82F6" }}
              thumbColor={"#FFF"}
            />
          </View>

          {isReminderEnabled && (
            <View className="mt-5 pt-5 border-t border-slate-100">
              <Text className="text-sm font-medium text-slate-500 mb-3">
                {t("settings.remind_every")}
              </Text>
              <View className="flex-row justify-between">
                {[1, 2, 4].map((hours) => (
                  <TouchableOpacity
                    key={hours}
                    className={`flex-1 py-3 rounded-xl items-center mx-1 ${
                      reminderInterval === hours
                        ? "bg-blue-500"
                        : "bg-slate-100"
                    }`}
                    onPress={() => changeInterval(hours)}
                  >
                    <Text
                      className={`text-base font-semibold ${
                        reminderInterval === hours
                          ? "text-white"
                          : "text-slate-500"
                      }`}
                    >
                      {hours}h
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}
        </View>
      </View>

      <View className="mb-8">
        <Text className="text-lg font-bold text-slate-800 mb-4">
          {t("settings.general")}
        </Text>

        {/* Notification Permission */}
        <TouchableOpacity className="flex-row items-center justify-between bg-white p-5 rounded-2xl mb-3 shadow-sm">
          <View className="flex-row items-center">
            <Bell color="#64748B" size={20} />
            <Text className="text-base font-medium text-slate-800 ml-3">
              {t("settings.notifications")}
            </Text>
          </View>
          <ChevronRight color="#CBD5E1" size={20} />
        </TouchableOpacity>

        {/* Language Switch */}
        <View className="bg-white p-5 rounded-2xl shadow-sm">
          <Text className="text-base font-medium text-slate-800 mb-3">
            {t("settings.language")}
          </Text>
          <View className="flex-row justify-between">
            <TouchableOpacity
              className={`flex-1 py-3 rounded-xl items-center mx-1 ${i18n.language === "en" ? "bg-blue-500" : "bg-slate-100"}`}
              onPress={() => changeLanguage("en")}
            >
              <Text
                className={`text-base font-semibold ${i18n.language === "en" ? "text-white" : "text-slate-500"}`}
              >
                {t("settings.english")}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              className={`flex-1 py-3 rounded-xl items-center mx-1 ${i18n.language === "vi" ? "bg-blue-500" : "bg-slate-100"}`}
              onPress={() => changeLanguage("vi")}
            >
              <Text
                className={`text-base font-semibold ${i18n.language === "vi" ? "text-white" : "text-slate-500"}`}
              >
                {t("settings.vietnamese")}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}
