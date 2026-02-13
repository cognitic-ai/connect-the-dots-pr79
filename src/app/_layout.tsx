import { ThemeProvider } from "@/components/theme-provider";
import Stack from "expo-router/stack";
import * as AC from "@bacons/apple-colors";
import { isLiquidGlassAvailable } from "expo-glass-effect";
import { NativeStackNavigationOptions } from "@react-navigation/native-stack";

const AppleStackPreset: NativeStackNavigationOptions =
  process.env.EXPO_OS !== "ios"
    ? {}
    : isLiquidGlassAvailable()
    ? {
        headerTransparent: true,
        headerShadowVisible: false,
        headerLargeTitleShadowVisible: false,
        headerLargeStyle: { backgroundColor: "transparent" },
        headerTitleStyle: { color: AC.label as any },
        headerBlurEffect: "none",
        headerBackButtonDisplayMode: "minimal",
      }
    : {
        headerTransparent: true,
        headerShadowVisible: true,
        headerLargeTitleShadowVisible: false,
        headerLargeStyle: { backgroundColor: "transparent" },
        headerBlurEffect: "systemChromeMaterial",
        headerBackButtonDisplayMode: "default",
      };

export default function Layout() {
  return (
    <ThemeProvider>
      <Stack screenOptions={AppleStackPreset}>
        <Stack.Screen name="index" options={{ title: "Dots & Boxes" }} />
      </Stack>
    </ThemeProvider>
  );
}
