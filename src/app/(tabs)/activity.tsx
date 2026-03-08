import { Award, Footprints, Target } from "lucide-react-native";
import React, { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Platform, Text, View } from "react-native";
import ScreenWrapper from "../../components/ScreenWrapper";
import { useHealthStore } from "../../store/healthStore";

export default function ActivityScreen() {
  const { dailySteps, isPedometerAvailable, initializePedometer } =
    useHealthStore();
  const { t } = useTranslation();

  const DAILY_GOAL = 10000;

  useEffect(() => {
    initializePedometer();
  }, []);

  const totalSteps = dailySteps;
  const progressPercentage = Math.min((totalSteps / DAILY_GOAL) * 100, 100);

  return (
    <ScreenWrapper className="flex-1 bg-slate-50">
      <View className="flex-1 p-6 pt-10">
        <View className="mb-8">
          <Text className="text-3xl font-bold text-slate-800">
            {t("activity.title")}
          </Text>
          <Text className="text-base text-slate-500 mt-1">
            {t("activity.subtitle")}
          </Text>
        </View>

        <View className="bg-white rounded-3xl p-8 items-center shadow-sm shadow-slate-200">
          <View className="w-16 h-16 rounded-full bg-blue-100 justify-center items-center mb-4">
            <Footprints color="#3B82F6" size={32} />
          </View>

          <Text className="text-6xl font-bold text-slate-800">
            {totalSteps.toLocaleString()}
          </Text>
          <Text className="text-lg text-slate-500 mb-8 font-medium">
            {t("activity.steps_today")}
          </Text>

          {/* Progress Bar Container */}
          <View className="w-full mb-4">
            <View className="h-3 bg-slate-200 rounded-full overflow-hidden mb-2">
              <View
                className="h-full bg-blue-500 rounded-full"
                style={{ width: `${progressPercentage}%` }}
              />
            </View>

            <View className="flex-row justify-between items-center">
              <Text className="text-sm text-slate-500 font-medium">0</Text>
              <View className="flex-row items-center">
                <Target color="#64748B" size={14} />
                <Text className="text-sm text-slate-500 font-semibold ml-1">
                  {DAILY_GOAL.toLocaleString()}
                </Text>
              </View>
            </View>
          </View>

          {totalSteps >= DAILY_GOAL && (
            <View className="flex-row items-center bg-amber-100 px-4 py-2 rounded-full mt-4">
              <Award color="#F59E0B" size={20} />
              <Text className="text-amber-700 font-bold text-sm ml-2">
                {t("activity.goal_achieved")}
              </Text>
            </View>
          )}
        </View>

        <View className="mt-6 items-center">
          <Text className="text-sm text-slate-400 font-medium">
            {t("activity.sensor_status")}
            {isPedometerAvailable === "checking"
              ? t("activity.sensor_checking")
              : isPedometerAvailable === "true"
                ? t("activity.sensor_active")
                : isPedometerAvailable === "false"
                  ? t("activity.sensor_not_available")
                  : isPedometerAvailable === "Permission Denied"
                    ? t("activity.permission_denied")
                    : isPedometerAvailable === "Error"
                      ? t("activity.sensor_error")
                      : isPedometerAvailable}
          </Text>
          {Platform.OS === "ios" && (
            <Text className="text-xs text-slate-300 mt-2 text-center">
              {t("activity.note")}
            </Text>
          )}
        </View>
      </View>
    </ScreenWrapper>
  );
}
