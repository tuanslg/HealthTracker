import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
import * as SQLite from "expo-sqlite";
import { ArrowLeft, Camera, User as UserIcon } from "lucide-react-native";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Alert,
  Image,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import ScreenWrapper from "../components/ScreenWrapper";

import { useAuthStore } from "../store/authStore";
import { getBmiCategory } from "../utils/bmi";

export default function ProfileScreen() {
  const { t } = useTranslation();
  const { user, isGuest } = useAuthStore();
  const [bmi, setBmi] = useState<number | null>(null);
  const [avatarUri, setAvatarUri] = useState<string | null>(null);

  useEffect(() => {
    loadProfileData();
  }, []);

  const loadProfileData = async () => {
    try {
      const db = await SQLite.openDatabaseAsync("health.db");

      try {
        await db.execAsync("ALTER TABLE UserProfile ADD COLUMN avatar TEXT;");
      } catch (e) {}

      const result: any = await db.getFirstAsync(
        "SELECT * FROM UserProfile WHERE id = 1",
      );

      if (result) {
        if (result.bmi) setBmi(result.bmi);
        if (result.avatar) setAvatarUri(result.avatar);
      }
    } catch (error) {
      console.log("Error loading DB", error);
    }
  };

  const saveAvatarToDb = async (uri: string) => {
    try {
      const db = await SQLite.openDatabaseAsync("health.db");

      const existing: any = await db.getFirstAsync(
        "SELECT id FROM UserProfile WHERE id = 1",
      );

      if (existing) {
        await db.runAsync("UPDATE UserProfile SET avatar = ? WHERE id = 1", [
          uri,
        ]);
      } else {
        await db.runAsync(
          "INSERT INTO UserProfile (id, avatar) VALUES (1, ?)",
          [uri],
        );
      }
    } catch (error) {
      console.log("Error saving DB", error);
    }
  };

  const pickImage = async (useCamera = false) => {
    let result;
    if (useCamera) {
      const permission = await ImagePicker.requestCameraPermissionsAsync();
      if (!permission.granted) {
        Alert.alert(t("settings.permission_denied"));
        return;
      }
      result = await ImagePicker.launchCameraAsync({
        mediaTypes: ["images"],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 1,
      });
    } else {
      const permission =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        Alert.alert(t("settings.permission_denied"));
        return;
      }
      result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 1,
      });
    }

    if (!result.canceled) {
      const uri = result.assets[0].uri;
      setAvatarUri(uri);
      saveAvatarToDb(uri);
    }
  };

  const showAvatarOptions = () => {
    Alert.alert(t("profile.change_avatar"), "", [
      { text: t("profile.take_photo"), onPress: () => pickImage(true) },
      { text: t("profile.choose_library"), onPress: () => pickImage(false) },
      { text: t("profile.cancel"), style: "cancel" },
    ]);
  };

  const bmiCategoryResult = bmi ? getBmiCategory(bmi, t) : null;
  const borderColor = bmiCategoryResult ? bmiCategoryResult.color : "#94A3B8";

  return (
    <ScreenWrapper className="flex-1 bg-slate-50">
      <View className="px-4 py-3 pb-4 flex-row items-center bg-white border-b border-slate-100">
        <TouchableOpacity onPress={() => router.back()} className="p-2 mr-2">
          <ArrowLeft size={24} color="#1E293B" />
        </TouchableOpacity>
        <Text className="text-xl font-bold text-slate-800">
          {t("profile.title")}
        </Text>
      </View>

      <ScrollView className="flex-1" contentContainerClassName="p-6">
        <View className="items-center mb-8">
          <TouchableOpacity onPress={showAvatarOptions}>
            <View
              style={{ borderColor, borderWidth: 4 }}
              className="w-32 h-32 rounded-full overflow-hidden items-center justify-center bg-slate-200"
            >
              {avatarUri ? (
                <Image source={{ uri: avatarUri }} className="w-full h-full" />
              ) : user?.avatar ? (
                <Image
                  source={{ uri: user.avatar }}
                  className="w-full h-full"
                />
              ) : (
                <UserIcon size={48} color="#94A3B8" />
              )}
            </View>
            <View className="absolute bottom-0 right-0 bg-blue-500 w-10 h-10 rounded-full items-center justify-center border-4 border-slate-50 shadow-sm shadow-blue-500/30">
              <Camera size={18} color="#FFF" />
            </View>
          </TouchableOpacity>
          <Text className="mt-4 text-2xl font-bold text-slate-800">
            {isGuest ? t("profile.guest") : user?.name || "User"}
          </Text>
          {!isGuest && (
            <Text className="text-slate-500 mt-1">{user?.email}</Text>
          )}
        </View>

        <View className="bg-white rounded-3xl p-6 shadow-sm shadow-slate-200">
          <Text className="text-lg font-bold text-slate-800 mb-4">
            {t("profile.personal_info")}
          </Text>

          <View className="flex-row items-center justify-between py-4 border-b border-slate-100">
            <Text className="text-slate-500 font-medium whitespace-nowrap">
              {t("profile.bmi_score")}
            </Text>
            {bmi ? (
              <View className="items-end">
                <Text className="text-lg font-bold text-slate-800">
                  {bmi.toFixed(1)}
                </Text>
                <Text
                  style={{ color: bmiCategoryResult?.color }}
                  className="text-sm font-bold"
                >
                  {bmiCategoryResult?.text}
                </Text>
              </View>
            ) : (
              <Text className="text-slate-400 font-medium">
                {t("profile.no_bmi")}
              </Text>
            )}
          </View>
        </View>
      </ScrollView>
    </ScreenWrapper>
  );
}
