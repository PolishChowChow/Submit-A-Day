
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useColorScheme } from "react-native";

import {
  TamaguiProvider,
} from "tamagui";

import {
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";

import React from "react";

// Create the query client once.
// Later, move this into a dedicated provider file if needed.
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      retry: 1,
    },
  },
});

export default function RootLayout() {
  const colorScheme = useColorScheme() ?? "light";

  return (
    <TamaguiProvider
      defaultTheme={colorScheme}
    >
      <QueryClientProvider client={queryClient}>
        <StatusBar
          style={colorScheme === "dark" ? "light" : "dark"}
        />

        <Stack
          screenOptions={{
            headerShown: false,
            animation: "slide_from_right",
          }}
        />
      </QueryClientProvider>
    </TamaguiProvider>
  );
}
