import * as SQLite from "expo-sqlite";
import { Activity, Flame, Footprints, Heart } from "lucide-react-native";
import React, { useEffect, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { BarChart } from "react-native-gifted-charts";

export default function Dashboard() {
  const [weight, setWeight] = useState("");
  const [height, setHeight] = useState("");
  const [bmi, setBmi] = useState<string | null>(null);
  const [bmiCategory, setBmiCategory] = useState({ text: "", color: "" });

  const stepData = [
    { value: 4500, label: "Mon" },
    { value: 6000, label: "Tue" },
    { value: 8000, label: "Wed", frontColor: "#4ADE80" },
    { value: 5000, label: "Thu" },
    { value: 7500, label: "Fri" },
    { value: 9000, label: "Sat", frontColor: "#4ADE80" },
    { value: 6500, label: "Sun" },
  ];

  useEffect(() => {
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
      return { text: "Thin / Underweight", color: "#3B82F6" }; // Xanh lam
    if (bmiValue >= 18.5 && bmiValue < 24.9)
      return { text: "Normal", color: "#22C55E" }; // Xanh lá
    if (bmiValue >= 25 && bmiValue < 29.9)
      return { text: "Overweight", color: "#F59E0B" }; // Vàng cam
    return { text: "Obese", color: "#EF4444" }; // Đỏ
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
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header Section */}
          <View style={styles.header}>
            <View>
              <Text style={styles.greeting}>Good Morning!</Text>
              <Text style={styles.subtitle}>Let's check your health today</Text>
            </View>
            <TouchableOpacity style={styles.profileAvatar}>
              <Text style={styles.avatarText}>ME</Text>
            </TouchableOpacity>
          </View>

          {/* BMI Calculator Card */}
          <View style={styles.bmiCard}>
            <View style={styles.bmiHeader}>
              <Activity color="#6366F1" size={24} />
              <Text style={styles.bmiTitle}>Body Mass Index (BMI)</Text>
            </View>

            <View style={styles.inputRow}>
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Weight (kg)</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g. 68"
                  keyboardType="numeric"
                  value={weight}
                  onChangeText={setWeight}
                />
              </View>
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Height (cm)</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g. 175"
                  keyboardType="numeric"
                  value={height}
                  onChangeText={setHeight}
                />
              </View>
            </View>

            <TouchableOpacity
              style={styles.calculateBtn}
              onPress={calculateBMI}
            >
              <Text style={styles.calculateBtnText}>Calculate & Save BMI</Text>
            </TouchableOpacity>

            {bmi && (
              <View style={styles.bmiResultContainer}>
                <View style={styles.bmiNumberBox}>
                  <Text style={styles.bmiValue}>{bmi}</Text>
                  <Text style={styles.bmiLabel}>BMI Score</Text>
                </View>
                <View style={styles.bmiStatusBox}>
                  <Text
                    style={[styles.bmiStatusText, { color: bmiCategory.color }]}
                  >
                    {bmiCategory.text}
                  </Text>
                </View>
              </View>
            )}
          </View>

          {/* Highlight Card */}
          <View style={styles.highlightCard}>
            <View style={styles.highlightHeader}>
              <Footprints color="#FFF" size={24} />
              <Text style={styles.highlightTitle}>Daily Steps</Text>
            </View>
            <Text style={styles.highlightValue}>8,245</Text>
            <Text style={styles.highlightSubtitle}>Goal: 10,000 steps</Text>
          </View>

          {/* Stats Grid */}
          <View style={styles.statsRow}>
            <View style={styles.statCard}>
              <View
                style={[styles.iconContainer, { backgroundColor: "#FEE2E2" }]}
              >
                <Heart color="#EF4444" size={24} />
              </View>
              <Text style={styles.statValue}>72 bpm</Text>
              <Text style={styles.statLabel}>Heart Rate</Text>
            </View>
            <View style={styles.statCard}>
              <View
                style={[styles.iconContainer, { backgroundColor: "#FEF3C7" }]}
              >
                <Flame color="#F59E0B" size={24} />
              </View>
              <Text style={styles.statValue}>450 kcal</Text>
              <Text style={styles.statLabel}>Burned</Text>
            </View>
          </View>

          {/* Chart Section */}
          <View style={styles.chartContainer}>
            <Text style={styles.sectionTitle}>Activity This Week</Text>
            <View style={styles.chartWrapper}>
              <BarChart
                data={stepData}
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  scrollContent: {
    padding: 24,
    paddingTop: 40,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 32,
  },
  greeting: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1E293B",
  },
  subtitle: {
    fontSize: 16,
    color: "#64748B",
    marginTop: 4,
  },
  profileAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#DBEAFE",
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: {
    color: "#3B82F6",
    fontWeight: "bold",
    fontSize: 16,
  },

  // BMI Styles
  bmiCard: {
    backgroundColor: "#FFF",
    borderRadius: 24,
    padding: 24,
    marginBottom: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  bmiHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  bmiTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1E293B",
    marginLeft: 8,
  },
  inputRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  inputContainer: {
    flex: 1,
    marginHorizontal: 4,
  },
  inputLabel: {
    fontSize: 14,
    color: "#64748B",
    marginBottom: 8,
    fontWeight: "500",
  },
  input: {
    backgroundColor: "#F1F5F9",
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: "#1E293B",
    fontWeight: "600",
  },
  calculateBtn: {
    backgroundColor: "#6366F1",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    marginBottom: 8,
  },
  calculateBtnText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "bold",
  },
  bmiResultContainer: {
    flexDirection: "row",
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#F1F5F9",
    alignItems: "center",
  },
  bmiNumberBox: {
    flex: 1,
    alignItems: "flex-start",
  },
  bmiValue: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#1E293B",
  },
  bmiLabel: {
    fontSize: 14,
    color: "#64748B",
  },
  bmiStatusBox: {
    flex: 1,
    alignItems: "flex-end",
    justifyContent: "center",
  },
  bmiStatusText: {
    fontSize: 18,
    fontWeight: "bold",
  },

  highlightCard: {
    backgroundColor: "#3B82F6",
    borderRadius: 24,
    padding: 24,
    marginBottom: 24,
    shadowColor: "#3B82F6",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 8,
  },
  highlightHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  highlightTitle: {
    color: "#FFF",
    fontSize: 18,
    fontWeight: "600",
    marginLeft: 8,
  },
  highlightValue: {
    color: "#FFF",
    fontSize: 48,
    fontWeight: "bold",
    marginBottom: 8,
  },
  highlightSubtitle: {
    color: "#DBEAFE",
    fontSize: 16,
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    backgroundColor: "#FFF",
    borderRadius: 20,
    padding: 20,
    marginHorizontal: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    alignItems: "center",
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  statValue: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1E293B",
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: "#64748B",
  },
  chartContainer: {
    backgroundColor: "#FFF",
    borderRadius: 24,
    padding: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1E293B",
    marginBottom: 20,
  },
  chartWrapper: {
    alignItems: "center",
  },
});
