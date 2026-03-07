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
  SafeAreaView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
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
      "Success",
      `Water reminders scheduled every ${intervalHours} hours.`,
    );
  };

  const cancelWaterReminder = async () => {
    await Notifications.cancelAllScheduledNotificationsAsync();
    Alert.alert("Turned Off", "Water reminders have been cancelled.");
  };

  const toggleReminder = async (value: boolean) => {
    if (value) {
      const { status } = await Notifications.requestPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permission Denied",
          "Please allow notifications in your device settings to use this feature.",
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
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Cài đặt</Text>
        <Text style={styles.subtitle}>Quản lý tuỳ chọn của bạn</Text>

        {/* Account Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Tài khoản</Text>
          <View style={styles.settingCard}>
            {isGuest ? (
              <View style={styles.accountGuestContainer}>
                <View style={styles.accountInfo}>
                  <View
                    style={[styles.iconBox, { backgroundColor: "#F1F5F9" }]}
                  >
                    <User color="#64748B" size={24} />
                  </View>
                  <View>
                    <Text style={styles.settingTitle}>Khách</Text>
                    <Text style={styles.settingDescription}>
                      Đăng nhập để đồng bộ
                    </Text>
                  </View>
                </View>
                <TouchableOpacity
                  style={styles.loginButton}
                  onPress={() => router.push("/(auth)/login")}
                >
                  <LogIn color="#FFF" size={16} />
                  <Text style={styles.loginButtonText}>Đăng nhập</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.accountGuestContainer}>
                <View style={styles.accountInfo}>
                  <View
                    style={[styles.iconBox, { backgroundColor: "#DBEAFE" }]}
                  >
                    <User color="#3B82F6" size={24} />
                  </View>
                  <View>
                    <Text style={styles.settingTitle}>{user?.name}</Text>
                    <Text style={styles.settingDescription}>{user?.email}</Text>
                  </View>
                </View>
                <TouchableOpacity
                  style={styles.logoutButton}
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

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Nhắc nhở</Text>

          <View style={styles.settingCard}>
            <View style={styles.settingHeader}>
              <View style={[styles.iconBox, { backgroundColor: "#DBEAFE" }]}>
                <Droplet color="#3B82F6" size={24} />
              </View>
              <View style={styles.settingTextContainer}>
                <Text style={styles.settingTitle}>Drink Water</Text>
                <Text style={styles.settingDescription}>
                  Remind me to drink water during the day
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
              <View style={styles.intervalContainer}>
                <Text style={styles.intervalLabel}>Remind me every:</Text>
                <View style={styles.intervalButtonGroup}>
                  {[1, 2, 4].map((hours) => (
                    <TouchableOpacity
                      key={hours}
                      style={[
                        styles.intervalButton,
                        reminderInterval === hours &&
                          styles.intervalButtonActive,
                      ]}
                      onPress={() => changeInterval(hours)}
                    >
                      <Text
                        style={[
                          styles.intervalButtonText,
                          reminderInterval === hours &&
                            styles.intervalButtonTextActive,
                        ]}
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

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>General</Text>
          <TouchableOpacity style={styles.generalItem}>
            <View style={styles.generalItemLeft}>
              <Bell color="#64748B" size={20} />
              <Text style={styles.generalItemText}>
                Notification Permissions
              </Text>
            </View>
            <ChevronRight color="#CBD5E1" size={20} />
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  content: {
    flex: 1,
    padding: 24,
    paddingTop: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#1E293B",
  },
  subtitle: {
    fontSize: 16,
    color: "#64748B",
    marginBottom: 32,
    marginTop: 4,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1E293B",
    marginBottom: 16,
  },
  settingCard: {
    backgroundColor: "#FFF",
    borderRadius: 20,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  settingHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconBox: {
    width: 48,
    height: 48,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  settingTextContainer: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1E293B",
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 14,
    color: "#64748B",
  },
  accountGuestContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  accountInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  loginButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#3B82F6",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
  },
  loginButtonText: {
    color: "#FFF",
    fontWeight: "600",
    marginLeft: 6,
  },
  logoutButton: {
    padding: 8,
    borderRadius: 12,
    backgroundColor: "#FEE2E2",
  },
  intervalContainer: {
    marginTop: 20,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: "#F1F5F9",
  },
  intervalLabel: {
    fontSize: 14,
    color: "#64748B",
    marginBottom: 12,
    fontWeight: "500",
  },
  intervalButtonGroup: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  intervalButton: {
    flex: 1,
    paddingVertical: 12,
    backgroundColor: "#F1F5F9",
    borderRadius: 12,
    alignItems: "center",
    marginHorizontal: 4,
  },
  intervalButtonActive: {
    backgroundColor: "#3B82F6",
  },
  intervalButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#64748B",
  },
  intervalButtonTextActive: {
    color: "#FFF",
  },
  generalItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#FFF",
    padding: 20,
    borderRadius: 16,
    marginBottom: 12,
  },
  generalItemLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  generalItemText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#1E293B",
    marginLeft: 12,
  },
});
