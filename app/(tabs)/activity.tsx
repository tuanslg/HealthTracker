import { Pedometer } from "expo-sensors";
import { Award, Footprints, Target } from "lucide-react-native";
import React, { useEffect, useState } from "react";
import { Platform, SafeAreaView, StyleSheet, Text, View } from "react-native";

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
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Daily Activity</Text>
          <Text style={styles.subtitle}>Track your daily movement</Text>
        </View>

        <View style={styles.card}>
          <View style={styles.iconWrapper}>
            <Footprints color="#3B82F6" size={32} />
          </View>

          <Text style={styles.stepsText}>{totalSteps.toLocaleString()}</Text>
          <Text style={styles.stepsLabel}>Steps Today</Text>

          {/* Progress Bar Container */}
          <View style={styles.progressContainer}>
            <View style={styles.progressBarBackground}>
              <View
                style={[
                  styles.progressBarFill,
                  { width: `${progressPercentage}%` },
                ]}
              />
            </View>

            <View style={styles.progressLabels}>
              <Text style={styles.progressText}>0</Text>
              <View style={styles.goalWrapper}>
                <Target color="#64748B" size={14} />
                <Text style={styles.goalText}>
                  {DAILY_GOAL.toLocaleString()}
                </Text>
              </View>
            </View>
          </View>

          {totalSteps >= DAILY_GOAL && (
            <View style={styles.achievementBadge}>
              <Award color="#F59E0B" size={20} />
              <Text style={styles.achievementText}>Daily Goal Achieved!</Text>
            </View>
          )}
        </View>

        <View style={styles.statusContainer}>
          <Text style={styles.statusText}>
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
            <Text style={styles.platformNotice}>
              (Note: Physical movement may be required to trigger updates)
            </Text>
          )}
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
  header: {
    marginBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#1E293B",
  },
  subtitle: {
    fontSize: 16,
    color: "#64748B",
    marginTop: 4,
  },
  card: {
    backgroundColor: "#FFF",
    borderRadius: 24,
    padding: 32,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 4,
  },
  iconWrapper: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#DBEAFE",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  stepsText: {
    fontSize: 56,
    fontWeight: "bold",
    color: "#1E293B",
  },
  stepsLabel: {
    fontSize: 18,
    color: "#64748B",
    marginBottom: 32,
    fontWeight: "500",
  },
  progressContainer: {
    width: "100%",
    marginBottom: 16,
  },
  progressBarBackground: {
    height: 12,
    backgroundColor: "#E2E8F0",
    borderRadius: 6,
    overflow: "hidden",
    marginBottom: 8,
  },
  progressBarFill: {
    height: "100%",
    backgroundColor: "#3B82F6",
    borderRadius: 6,
  },
  progressLabels: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  progressText: {
    fontSize: 14,
    color: "#64748B",
    fontWeight: "500",
  },
  goalWrapper: {
    flexDirection: "row",
    alignItems: "center",
  },
  goalText: {
    fontSize: 14,
    color: "#64748B",
    fontWeight: "600",
    marginLeft: 4,
  },
  achievementBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FEF3C7",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginTop: 16,
  },
  achievementText: {
    color: "#B45309",
    fontWeight: "bold",
    fontSize: 14,
    marginLeft: 8,
  },
  statusContainer: {
    marginTop: 24,
    alignItems: "center",
  },
  statusText: {
    fontSize: 14,
    color: "#94A3B8",
    fontWeight: "500",
  },
  platformNotice: {
    fontSize: 12,
    color: "#CBD5E1",
    marginTop: 8,
    textAlign: "center",
  },
});
