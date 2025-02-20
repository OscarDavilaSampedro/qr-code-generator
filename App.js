import AdvancedQRGenerator from "./src/components/AdvancedQRGenerator";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { Provider as PaperProvider } from "react-native-paper";
import { SafeAreaView, StyleSheet } from "react-native";
import React from "react";

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <PaperProvider>
        <SafeAreaView style={styles.container}>
          <AdvancedQRGenerator
            allowCustomization={true}
            mainButtonText="Abrir QR"
            defaultLink="https://ejemplo.com"
            mainButtonLabelStyle={{ color: "white" }}
            mainButtonStyle={{ backgroundColor: "#6200EE" }}
          />
        </SafeAreaView>
      </PaperProvider>
    </GestureHandlerRootView>
  );
}

// Estilos básicos para la pantalla principal
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    backgroundColor: "#eef2f5",
  },
});
