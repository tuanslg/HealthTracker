import { router } from "expo-router";
import { ArrowLeft, Lock, Mail } from "lucide-react-native";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useTranslation } from "react-i18next";
import { useAuthStore } from "../../store/authStore";

export default function LoginScreen() {
  const { t } = useTranslation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { loginWithGoogle, isLoading, login } = useAuthStore();

  const handleEmailLogin = () => {
    if (!email || !password) {
      Alert.alert(t("auth.error"), t("auth.error_missing_email"));
      return;
    }
    // Giả lập call API login
    login({
      id: "email_12345",
      name: "Người dùng Email",
      email: email,
      provider: "email",
    });
    router.replace("/(tabs)/settings");
  };

  const handleGoogleLogin = async () => {
    await loginWithGoogle();
    router.replace("/(tabs)/settings");
  };

  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1 p-6"
      >
        <TouchableOpacity
          className="w-10 h-10 rounded-full bg-slate-100 items-center justify-center mt-2 mb-5"
          onPress={() => router.back()}
        >
          <ArrowLeft size={24} color="#1E293B" />
        </TouchableOpacity>

        <View className="mb-8">
          <Text className="text-3xl font-bold text-slate-800 mb-2">
            {t("auth.welcome_back")}
          </Text>
          <Text className="text-base text-slate-500 leading-6">
            {t("auth.login_desc")}
          </Text>
        </View>

        <View className="flex-1">
          <View className="flex-row items-center bg-white border border-slate-200 rounded-2xl px-4 py-1 mb-4 shadow-sm">
            <Mail size={20} color="#64748B" className="mr-3" />
            <TextInput
              className="flex-1 py-3 text-base text-slate-800"
              placeholder={t("auth.email_placeholder")}
              placeholderTextColor="#94A3B8"
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={setEmail}
            />
          </View>

          <View className="flex-row items-center bg-white border border-slate-200 rounded-2xl px-4 py-1 mb-4 shadow-sm">
            <Lock size={20} color="#64748B" className="mr-3" />
            <TextInput
              className="flex-1 py-3 text-base text-slate-800"
              placeholder={t("auth.password_placeholder")}
              placeholderTextColor="#94A3B8"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
            />
          </View>

          <TouchableOpacity className="self-end mb-6">
            <Text className="text-blue-500 font-semibold text-sm">
              {t("auth.forgot_password")}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            className="bg-blue-500 rounded-2xl py-4 items-center mb-6 shadow-md shadow-blue-500/50"
            onPress={handleEmailLogin}
            disabled={isLoading}
          >
            <Text className="text-white text-base font-bold">
              {t("auth.login_btn")}
            </Text>
          </TouchableOpacity>

          <View className="flex-row items-center mb-6">
            <View className="flex-1 h-px bg-slate-200" />
            <Text className="px-4 text-slate-400 text-sm">
              {t("auth.or_continue_with")}
            </Text>
            <View className="flex-1 h-px bg-slate-200" />
          </View>

          <TouchableOpacity
            className="flex-row items-center justify-center bg-white border border-slate-200 rounded-2xl py-4 shadow-sm"
            onPress={handleGoogleLogin}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#1E293B" />
            ) : (
              <>
                <Text className="text-xl font-bold text-red-500 mr-3">G</Text>
                <Text className="text-base font-semibold text-slate-800">
                  {t("auth.login_google")}
                </Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        <View
          className={`flex-row justify-center items-center pb-${Platform.OS === "android" ? "5" : "0"}`}
        >
          <Text className="text-slate-500 text-base">
            {t("auth.no_account")}{" "}
          </Text>
          <TouchableOpacity onPress={() => router.push("/(auth)/signup")}>
            <Text className="text-blue-500 text-base font-bold">
              {t("auth.signup_now")}
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
