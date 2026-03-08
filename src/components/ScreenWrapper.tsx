import { StatusBar, StatusBarStyle } from "expo-status-bar";
import React from "react";
import { View, ViewProps } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface ScreenWrapperProps extends ViewProps {
  children: React.ReactNode;
  useSafeArea?: boolean;
  statusBarStyle?: StatusBarStyle;
  statusBarColor?: string;
  statusBarTranslucent?: boolean;
  className?: string;
}

export default function ScreenWrapper({
  children,
  useSafeArea = true,
  statusBarStyle = "dark",
  statusBarColor = "transparent",
  statusBarTranslucent = true,
  className = "flex-1 bg-slate-50",
  ...rest
}: ScreenWrapperProps) {
  const Container = useSafeArea ? SafeAreaView : View;

  return (
    <Container className={className} {...rest}>
      <StatusBar
        style={statusBarStyle}
        backgroundColor={statusBarColor}
        translucent={statusBarTranslucent}
      />
      {children}
    </Container>
  );
}
