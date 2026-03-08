import { Pedometer } from "expo-sensors";
import { create } from "zustand";

export interface StepData {
  value: number;
  label: string;
  frontColor?: string;
}

interface HealthState {
  dailySteps: number;
  weeklySteps: StepData[];
  isPedometerAvailable: string;
  isInitialized: boolean;
  initializePedometer: () => Promise<void>;
  cleanup: () => void;
}

let pedometerSubscription: Pedometer.Subscription | null = null;

const DAYS_OF_WEEK = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export const useHealthStore = create<HealthState>((set, get) => ({
  dailySteps: 0,
  weeklySteps: [],
  isPedometerAvailable: "checking",
  isInitialized: false,

  initializePedometer: async () => {
    if (get().isInitialized) return;

    try {
      const isAvailable = await Pedometer.isAvailableAsync();

      if (!isAvailable) {
        set({ isPedometerAvailable: "false", isInitialized: true });
        return;
      }

      set({ isPedometerAvailable: "true" });

      const permission = await Pedometer.requestPermissionsAsync();
      if (permission.status !== "granted") {
        set({ isPedometerAvailable: "Permission Denied", isInitialized: true });
        return;
      }

      // Fetch today's steps up to now
      const startOfToday = new Date();
      startOfToday.setHours(0, 0, 0, 0);
      const now = new Date();

      let pastStepCount = 0;
      try {
        const pastStepCountResult = await Pedometer.getStepCountAsync(
          startOfToday,
          now,
        );
        if (pastStepCountResult) {
          pastStepCount = pastStepCountResult.steps;
          set({ dailySteps: pastStepCount });
        }
      } catch (error) {
        console.log("Could not get past step count:", error);
      }

      // Fetch last 7 days for the chart
      const weekData: StepData[] = [];
      const promises = [];

      for (let i = 6; i >= 0; i--) {
        const start = new Date();
        start.setHours(0, 0, 0, 0);
        start.setDate(start.getDate() - i);

        const end = new Date(start);
        end.setHours(23, 59, 59, 999);

        // Push the day label into the array, and run the promise
        const dayLabel = DAYS_OF_WEEK[start.getDay()];
        let isToday = i === 0;

        const fetchDay = async () => {
          let value = 0;
          try {
            const result = await Pedometer.getStepCountAsync(start, end);
            if (result) value = result.steps;
          } catch (e) {
            // Error happens if no data or permission
          }
          return {
            value,
            label: dayLabel,
            frontColor: isToday ? "#3B82F6" : undefined, // Highlight today
            date: start.getTime(),
          };
        };
        promises.push(fetchDay());
      }

      try {
        const resolvedData = await Promise.all(promises);
        resolvedData.sort((a, b) => a.date - b.date);

        // Remove date property before storing
        const finalWeeklyData = resolvedData.map(({ date, ...rest }) => rest);
        set({ weeklySteps: finalWeeklyData });
      } catch (e) {
        console.log("Error fetching weekly data", e);
      }

      // Cleanup existing subscription
      if (pedometerSubscription) {
        pedometerSubscription.remove();
      }

      let currentStepCount = 0;
      pedometerSubscription = Pedometer.watchStepCount((result) => {
        currentStepCount = result.steps;
        set({ dailySteps: pastStepCount + currentStepCount });
      });

      set({ isInitialized: true });
    } catch (err) {
      console.log("Pedometer error:", err);
      set({ isPedometerAvailable: "Error", isInitialized: true });
    }
  },

  cleanup: () => {
    if (pedometerSubscription) {
      pedometerSubscription.remove();
      pedometerSubscription = null;
    }
    set({ isInitialized: false });
  },
}));
