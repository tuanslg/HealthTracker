export const getBmiCategory = (bmiValue: number, t: any) => {
  if (bmiValue < 18.5)
    return { text: t("dashboard.bmi_thin"), color: "#3B82F6" };
  if (bmiValue >= 18.5 && bmiValue < 24.9)
    return { text: t("dashboard.bmi_normal"), color: "#22C55E" };
  if (bmiValue >= 25 && bmiValue < 29.9)
    return { text: t("dashboard.bmi_overweight"), color: "#F59E0B" };
  return { text: t("dashboard.bmi_obese"), color: "#EF4444" };
};
