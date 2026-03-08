import * as SQLite from "expo-sqlite";
import { Activity, Flame, Footprints, Heart } from "lucide-react-native";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { BarChart } from "react-native-gifted-charts";
import { SafeAreaView } from "react-native-safe-area-context";
import { useHealthStore } from "../../store/healthStore";

export default function Dashboard() {
  const { dailySteps, weeklySteps, initializePedometer } = useHealthStore();
  const { t } = useTranslation();
  const [weight, setWeight] = useState("");
  const [height, setHeight] = useState("");
  const [bmi, setBmi] = useState<string | null>(null);
  const [bmiCategory, setBmiCategory] = useState({ text: "", color: "" });

  useEffect(() => {
    initializePedometer();
    loadProfileData();
  }, []);

  const loadProfileData = async () => {
    try {
      const db = await SQLite.openDatabaseAsync("health.db");
      await db.execAsync(
        "CREATE TABLE IF NOT EXISTS UserProfile (id INTEGER PRIMARY KEY NOT NULL, weight REAL, height REAL, bmi REAL);",
      );

      const result: any = await db.getFirstAsync(
        "SELECT * FROM UserProfile WHERE id = 1",
      );
      if (result) {
        if (result.weight) setWeight(result.weight.toString());
        if (result.height) setHeight(result.height.toString());
        if (result.bmi) {
          setBmi(result.bmi.toFixed(1));
          setBmiCategory(getBmiCategory(result.bmi));
        }
      }
    } catch (error) {
      console.log("Error loading DB", error);
    }
  };

  const getBmiCategory = (bmiValue: number) => {
    if (bmiValue < 18.5)
      return { text: t("dashboard.bmi_thin"), color: "#3B82F6" }; // Xanh lam
    if (bmiValue >= 18.5 && bmiValue < 24.9)
      return { text: t("dashboard.bmi_normal"), color: "#22C55E" }; // Xanh lá
    if (bmiValue >= 25 && bmiValue < 29.9)
      return { text: t("dashboard.bmi_overweight"), color: "#F59E0B" }; // Vàng cam
    return { text: t("dashboard.bmi_obese"), color: "#EF4444" }; // Đỏ
  };

  const calculateBMI = async () => {
    const w = parseFloat(weight);
    const h = parseFloat(height) / 100; // cm to m

    if (w > 0 && h > 0) {
      const calculatedBmi = w / (h * h);
      setBmi(calculatedBmi.toFixed(1));
      setBmiCategory(getBmiCategory(calculatedBmi));

      try {
        const db = await SQLite.openDatabaseAsync("health.db");
        const existing: any = await db.getFirstAsync(
          "SELECT id FROM UserProfile WHERE id = 1",
        );

        if (existing) {
          await db.runAsync(
            "UPDATE UserProfile SET weight = ?, height = ?, bmi = ? WHERE id = 1",
            [w, parseFloat(height), calculatedBmi],
          );
        } else {
          await db.runAsync(
            "INSERT INTO UserProfile (id, weight, height, bmi) VALUES (1, ?, ?, ?)",
            [w, parseFloat(height), calculatedBmi],
          );
        }
      } catch (error) {
        console.log("Error saving DB", error);
      }
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerClassName="p-6 pt-10"
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Header Section */}
          <View className="flex-row justify-between items-center mb-8">
            <View>
              <Text className="text-2xl font-bold text-slate-800">
                {t("dashboard.greeting")}
              </Text>
              <Text className="text-base text-slate-500 mt-1">
                {t("dashboard.subtitle")}
              </Text>
            </View>
            <TouchableOpacity className="w-12 h-12 rounded-full bg-blue-100 justify-center items-center">
              <Text className="text-blue-500 font-bold text-base">ME</Text>
            </TouchableOpacity>
          </View>

          {/* BMI Calculator Card */}
          <View className="bg-white rounded-3xl p-6 mb-6 shadow-sm">
            <View className="flex-row items-center mb-5">
              <Activity color="#6366F1" size={24} />
              <Text className="text-lg font-bold text-slate-800 ml-2">
                {t("dashboard.bmi_title")}
              </Text>
            </View>

            <View className="flex-row justify-between mb-4">
              <View className="flex-1 mx-1">
                <Text className="text-sm text-slate-500 mb-2 font-medium">
                  {t("dashboard.weight")}
                </Text>
                <TextInput
                  className="bg-slate-100 rounded-xl p-4 text-base text-slate-800 font-semibold"
                  placeholder="e.g. 68"
                  keyboardType="numeric"
                  value={weight}
                  onChangeText={setWeight}
                />
              </View>
              <View className="flex-1 mx-1">
                <Text className="text-sm text-slate-500 mb-2 font-medium">
                  {t("dashboard.height")}
                </Text>
                <TextInput
                  className="bg-slate-100 rounded-xl p-4 text-base text-slate-800 font-semibold"
                  placeholder="e.g. 175"
                  keyboardType="numeric"
                  value={height}
                  onChangeText={setHeight}
                />
              </View>
            </View>

            <TouchableOpacity
              className="bg-indigo-500 rounded-xl p-4 items-center mb-2"
              onPress={calculateBMI}
            >
              <Text className="text-white text-base font-bold">
                {t("dashboard.calculate_bmi")}
              </Text>
            </TouchableOpacity>

            {bmi && (
              <View className="flex-row mt-4 pt-4 border-t border-slate-100 items-center">
                <View className="flex-1 items-start">
                  <Text className="text-3xl font-bold text-slate-800">
                    {bmi}
                  </Text>
                  <Text className="text-sm text-slate-500">
                    {t("dashboard.bmi_score")}
                  </Text>
                </View>
                <View className="flex-1 items-end justify-center">
                  <Text
                    className="text-lg font-bold"
                    style={{ color: bmiCategory.color }}
                  >
                    {bmiCategory.text}
                  </Text>
                </View>
              </View>
            )}
          </View>

          {/* Highlight Card */}
          <View className="bg-blue-500 rounded-3xl p-6 mb-6 shadow-lg shadow-blue-500/30">
            <View className="flex-row items-center mb-4">
              <Footprints color="#FFF" size={24} />
              <Text className="text-white text-lg font-semibold ml-2">
                {t("dashboard.daily_steps")}
              </Text>
            </View>
            <Text className="text-white text-5xl font-bold mb-2">
              {dailySteps.toLocaleString()}
            </Text>
            <Text className="text-blue-100 text-base">
              {t("dashboard.goal")}
            </Text>
          </View>

          {/* Stats Grid */}
          <View className="flex-row justify-between mb-6">
            <View className="flex-1 bg-white rounded-3xl p-5 mx-1.5 items-center shadow-sm">
              <View className="w-12 h-12 rounded-full bg-red-100 justify-center items-center mb-3">
                <Heart color="#EF4444" size={24} />
              </View>
              <Text className="text-xl font-bold text-slate-800 mb-1">
                72 bpm
              </Text>
              <Text className="text-sm text-slate-500">
                {t("dashboard.heart_rate")}
              </Text>
            </View>
            <View className="flex-1 bg-white rounded-3xl p-5 mx-1.5 items-center shadow-sm">
              <View className="w-12 h-12 rounded-full bg-amber-100 justify-center items-center mb-3">
                <Flame color="#F59E0B" size={24} />
              </View>
              <Text className="text-xl font-bold text-slate-800 mb-1">
                450 kcal
              </Text>
              <Text className="text-sm text-slate-500">
                {t("dashboard.burned")}
              </Text>
            </View>
          </View>

          {/* Chart Section */}
          <View className="bg-white rounded-3xl p-6 shadow-sm mb-4">
            <Text className="text-lg font-bold text-slate-800 mb-5">
              {t("dashboard.activity_this_week")}
            </Text>
            <View className="items-center">
              <BarChart
                data={
                  weeklySteps.length > 0
                    ? weeklySteps
                    : [{ value: 0, label: "" }]
                }
                barWidth={22}
                noOfSections={4}
                barBorderRadius={4}
                frontColor="#94A3B8"
                yAxisThickness={0}
                xAxisThickness={0}
                hideRules
                isAnimated
                initialSpacing={10}
              />
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
