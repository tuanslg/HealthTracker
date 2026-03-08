import { router } from "expo-router";
import {
  ArrowLeft,
  CheckCircle2,
  Smartphone,
  Watch,
} from "lucide-react-native";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { Alert, Platform, Text, TouchableOpacity, View } from "react-native";

import ScreenWrapper from "../components/ScreenWrapper";

export default function DevicesScreen() {
  const { t } = useTranslation();
  const [isAppleHealthConnected, setIsAppleHealthConnected] = useState(false);
  const [isHealthConnectConnected, setIsHealthConnectConnected] =
    useState(false);

  const handleConnectAppleHealth = async () => {
    // Trong thực tế, đây là nơi gọi API của react-native-health để xin quyền
    // AppleHealthKit.initHealthKit(options, (err, results) => { ... })
    Alert.alert(
      "Apple Health",
      "Đang yêu cầu quyền truy cập vào Apple Health để đồng bộ dữ liệu với đồng hồ của bạn...",
      [
        { text: "Từ chối", style: "cancel" },
        {
          text: "Cho phép",
          onPress: () => {
            setIsAppleHealthConnected(true);
            Alert.alert(
              "Thành công",
              "Đã kết nối dữ liệu từ Apple Health (bao gồm đồng hồ Xiaomi).",
            );
          },
        },
      ],
    );
  };

  const handleConnectHealthConnect = async () => {
    // Trong thực tế, đây là nơi gọi API của react-native-health-connect để xin quyền
    // await initialize(); await requestPermission([...])
    Alert.alert(
      "Health Connect",
      "Đang yêu cầu quyền truy cập vào Google Health Connect / Google Fit...",
      [
        { text: "Từ chối", style: "cancel" },
        {
          text: "Cho phép",
          onPress: () => {
            setIsHealthConnectConnected(true);
            Alert.alert(
              "Thành công",
              "Đã kết nối dữ liệu từ thẻ Health Connect.",
            );
          },
        },
      ],
    );
  };

  return (
    <ScreenWrapper className="flex-1 bg-slate-50">
      <View className="px-4 py-3 pb-4 flex-row items-center bg-white border-b border-slate-100">
        <TouchableOpacity onPress={() => router.back()} className="p-2 mr-2">
          <ArrowLeft size={24} color="#1E293B" />
        </TouchableOpacity>
        <Text className="text-xl font-bold text-slate-800">
          Thiết bị & Nguồn cấp dữ liệu
        </Text>
      </View>

      <View className="flex-1 p-6">
        <Text className="text-base text-slate-500 mb-6 leading-6">
          Ứng dụng không thể kết nối trực tiếp với đồng hồ thông minh. Xin vui
          lòng liên kết dữ liệu qua Cổng dữ liệu sức khoẻ của hệ điều hành. Các
          đồng hồ như Xiaomi, Garmin, Apple Watch đều sẽ tự động đồng bộ về đây.
        </Text>

        <Text className="text-lg font-bold text-slate-800 mb-4">
          Cổng dữ liệu hệ thống
        </Text>

        {Platform.OS === "ios" ? (
          <TouchableOpacity
            onPress={handleConnectAppleHealth}
            className={`flex-row items-center bg-white p-5 rounded-2xl shadow-sm mb-4 border-2 ${isAppleHealthConnected ? "border-green-500" : "border-transparent"}`}
          >
            <View className="w-12 h-12 bg-red-50 rounded-full items-center justify-center mr-4">
              <Smartphone color="#EF4444" size={24} />
            </View>
            <View className="flex-1">
              <Text className="text-lg font-semibold text-slate-800 mb-1">
                Apple Health
              </Text>
              <Text className="text-sm text-slate-500">
                {isAppleHealthConnected
                  ? "Đang lấy dữ liệu tự động"
                  : "Chưa liên kết"}
              </Text>
            </View>
            {isAppleHealthConnected && (
              <CheckCircle2 color="#22C55E" size={24} />
            )}
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            onPress={handleConnectHealthConnect}
            className={`flex-row items-center bg-white p-5 rounded-2xl shadow-sm mb-4 border-2 ${isHealthConnectConnected ? "border-green-500" : "border-transparent"}`}
          >
            <View className="w-12 h-12 bg-blue-50 rounded-full items-center justify-center mr-4">
              <Smartphone color="#3B82F6" size={24} />
            </View>
            <View className="flex-1">
              <Text className="text-lg font-semibold text-slate-800 mb-1">
                Google Health Connect
              </Text>
              <Text className="text-sm text-slate-500">
                {isHealthConnectConnected
                  ? "Đang lấy dữ liệu tự động"
                  : "Chưa liên kết"}
              </Text>
            </View>
            {isHealthConnectConnected && (
              <CheckCircle2 color="#22C55E" size={24} />
            )}
          </TouchableOpacity>
        )}

        <View className="bg-blue-50 p-5 rounded-2xl mt-4">
          <View className="flex-row items-center mb-3">
            <Watch color="#3B82F6" size={20} />
            <Text className="text-base font-semibold text-blue-800 ml-2">
              Hướng dẫn cho máy Xiaomi
            </Text>
          </View>
          <Text className="text-sm text-blue-700 leading-5">
            1. Mở app <Text className="font-bold">Mi Fitness</Text> hoặc{" "}
            <Text className="font-bold">Zepp Life</Text> của bạn.{"\n"}
            2. Vào mục Hồ sơ {">"} Dữ liệu của bên thứ ba.{"\n"}
            3. Chọn bật đồng bộ với{" "}
            {Platform.OS === "ios"
              ? "Apple Health"
              : "Google Fit / Health Connect"}
            .{"\n"}
            4. Quay lại màn hình này và nhấn nút kết nối ở trên!
          </Text>
        </View>
      </View>
    </ScreenWrapper>
  );
}
