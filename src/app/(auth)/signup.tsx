import { router } from "expo-router";
import { ArrowLeft, Lock, Mail, User } from "lucide-react-native";
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
import ScreenWrapper from "../../components/ScreenWrapper";

import { useTranslation } from "react-i18next";
import { useAuthStore } from "../../store/authStore";

export default function SignupScreen() {
  const { t } = useTranslation();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { loginWithGoogle, isLoading, login } = useAuthStore();

  const handleSignup = () => {
    if (!name || !email || !password) {
      Alert.alert(t("auth.error"), t("auth.error_missing_info"));
      return;
    }
    // Giả lập tạo tài khoản và login
    login({
      id: `email_${Math.random() * 100}`,
      name: name,
      email: email,
      provider: "email",
    });
    router.replace("/(tabs)/settings");
  };

  const handleGoogleSignup = async () => {
    await loginWithGoogle();
    router.replace("/(tabs)/settings");
  };

  return (
    <ScreenWrapper className="flex-1 bg-slate-50">
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
            {t("auth.create_account")}
          </Text>
          <Text className="text-base text-slate-500 leading-6">
            {t("auth.signup_desc")}
          </Text>
        </View>

        <View className="flex-1">
          <View className="flex-row items-center bg-white border border-slate-200 rounded-2xl px-4 py-1 mb-4 shadow-sm">
            <User size={20} color="#64748B" className="mr-3" />
            <TextInput
              className="flex-1 py-3 text-base text-slate-800"
              placeholder={t("auth.name_placeholder")}
              placeholderTextColor="#94A3B8"
              value={name}
              onChangeText={setName}
            />
          </View>

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

          <TouchableOpacity
            className="bg-blue-500 rounded-2xl py-4 items-center mt-4 mb-6 shadow-md shadow-blue-500/50"
            onPress={handleSignup}
            disabled={isLoading}
          >
            <Text className="text-white text-base font-bold">
              {t("auth.signup_btn")}
            </Text>
          </TouchableOpacity>

          <View className="flex-row items-center mb-6">
            <View className="flex-1 h-px bg-slate-200" />
            <Text className="px-4 text-slate-400 text-sm">
              {t("auth.or_signup_with")}
            </Text>
            <View className="flex-1 h-px bg-slate-200" />
          </View>

          <TouchableOpacity
            className="flex-row items-center justify-center bg-white border border-slate-200 rounded-2xl py-4 shadow-sm"
            onPress={handleGoogleSignup}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#1E293B" />
            ) : (
              <>
                <Text className="text-xl font-bold text-red-500 mr-3">G</Text>
                <Text className="text-base font-semibold text-slate-800">
                  {t("auth.signup_google")}
                </Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        <View
          className={`flex-row justify-center items-center pb-${Platform.OS === "android" ? "5" : "0"}`}
        >
          <Text className="text-slate-500 text-base">
            {t("auth.already_have_account")}{" "}
          </Text>
          <TouchableOpacity onPress={() => router.push("/(auth)/login")}>
            <Text className="text-blue-500 text-base font-bold">
              {t("auth.login_here")}
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </ScreenWrapper>
  );
}
