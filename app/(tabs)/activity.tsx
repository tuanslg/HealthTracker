import { Pedometer } from "expo-sensors";
import { Award, Footprints, Target } from "lucide-react-native";
import React, { useEffect, useState } from "react";
import { Platform, SafeAreaView, Text, View } from "react-native";

export default function ActivityScreen() {
  const [isPedometerAvailable, setIsPedometerAvailable] = useState("checking");
  const [pastStepCount, setPastStepCount] = useState(0);
  const [currentStepCount, setCurrentStepCount] = useState(0);

  const DAILY_GOAL = 10000;

  useEffect(() => {
    let subscription: Pedometer.Subscription | null = null;

    const subscribe = async () => {
      try {
        const isAvailable = await Pedometer.isAvailableAsync();
        setIsPedometerAvailable(String(isAvailable));

        if (isAvailable) {
          const permission = await Pedometer.requestPermissionsAsync();
          if (permission.status === "granted") {
            const end = new Date();
            const start = new Date();
            start.setHours(0, 0, 0, 0);

            try {
              const pastStepCountResult = await Pedometer.getStepCountAsync(
                start,
                end,
              );
              if (pastStepCountResult) {
                setPastStepCount(pastStepCountResult.steps);
              }
            } catch (error) {
              console.log("Could not get past step count:", error);
            }

            subscription = Pedometer.watchStepCount((result) => {
              setCurrentStepCount(result.steps);
            });
          } else {
            setIsPedometerAvailable("Permission Denied");
          }
        }
      } catch (err) {
        console.log("Pedometer error:", err);
        setIsPedometerAvailable("Error");
      }
    };

    subscribe();

    return () => {
      if (subscription && subscription.remove) {
        subscription.remove();
      }
    };
  }, []);

  const totalSteps = pastStepCount + currentStepCount;
  const progressPercentage = Math.min((totalSteps / DAILY_GOAL) * 100, 100);

  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      <View className="flex-1 p-6 pt-10">
        <View className="mb-8">
          <Text className="text-3xl font-bold text-slate-800">
            Daily Activity
          </Text>
          <Text className="text-base text-slate-500 mt-1">
            Track your daily movement
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
            Steps Today
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
                Daily Goal Achieved!
              </Text>
            </View>
          )}
        </View>

        <View className="mt-6 items-center">
          <Text className="text-sm text-slate-400 font-medium">
            Sensor Status:{" "}
            {isPedometerAvailable === "checking"
              ? "Checking availability..."
              : isPedometerAvailable === "true"
                ? "Active - Sensor Working"
                : isPedometerAvailable === "false"
                  ? "Not Available on this device"
                  : isPedometerAvailable}
          </Text>
          {Platform.OS === "ios" && (
            <Text className="text-xs text-slate-300 mt-2 text-center">
              (Note: Physical movement may be required to trigger updates)
            </Text>
          )}
        </View>
      </View>
    </SafeAreaView>
  );
}
