import ColorPicker, { Panel1, HueSlider } from "reanimated-color-picker";
import { captureRef } from "react-native-view-shot";
import * as MediaLibrary from "expo-media-library";
import * as ImagePicker from "expo-image-picker";
import QRCode from "react-native-qrcode-svg";
import { useRef, useState } from "react";
import * as Sharing from "expo-sharing";
import {
  View,
  Modal,
  Alert,
  Animated,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import {
  Button,
  useTheme,
  TextInput,
  IconButton,
  Switch as PaperSwitch,
} from "react-native-paper";

export default function AdvancedQRGenerator({
  mainButtonText,
  mainButtonStyle,
  defaultLogo = null,
  defaultLogoSize = 30,
  mainButtonLabelStyle,
  allowCustomization = true,
  defaultQRColor = "#000000",
  defaultBGColor = "#ffffff",
  defaultContent = "https://ejemplo.com",
  defaultLogoBackgroundColor = "transparent",
}) {
  // Tema de react-native-paper
  const theme = useTheme();

  // Estados para la personalización y control de modales
  const [modalVisible, setModalVisible] = useState(false);
  const [content, setContent] = useState(defaultContent);
  const [qrColor, setQRColor] = useState(defaultQRColor);
  const [bgColor, setBGColor] = useState(defaultBGColor);
  const [includeLogo, setIncludeLogo] = useState(!!defaultLogo);
  const [logo, setLogo] = useState(defaultLogo);
  const [processing, setProcessing] = useState(false);

  // Estados temporales para manejar los cambios de color
  const [tempQRColor, setTempQRColor] = useState(qrColor);
  const [tempBGColor, setTempBGColor] = useState(bgColor);

  // Estados para errores de validación de hex
  const [qrColorError, setQRColorError] = useState(false);
  const [bgColorError, setBGColorError] = useState(false);

  // Expresión regular para validar código hexadecimal de 6 dígitos
  const hexRegex = /^#([0-9A-Fa-f]{6})$/;
  const validateHex = (text) => hexRegex.test(text);

  // El formulario es válido si los colores son hexadecimales válidos
  const isFormValid = validateHex(qrColor) && validateHex(bgColor);

  // Control de animación del modal
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const qrRef = useRef();

  const openModal = () => {
    setModalVisible(true);
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };
  const closeModal = () => {
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start(() => setModalVisible(false));
  };

  const handlePickLogo = async () => {
    const permissionResult =
      await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      Alert.alert(
        "Permiso denegado",
        "Se requiere acceso a la galería para seleccionar un logo."
      );
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      quality: 1,
    });
    if (!result.canceled) {
      setLogo(result.assets[0].uri);
    }
  };

  const handleShare = async () => {
    if (!isFormValid) {
      Alert.alert("Error", "Por favor, corrige los errores en los campos.");
      return;
    }
    try {
      setProcessing(true);
      const uri = await captureRef(qrRef, { format: "png", quality: 1 });
      await Sharing.shareAsync(uri);
    } catch (error) {
      console.error("Error al compartir:", error);
    } finally {
      setProcessing(false);
    }
  };

  const handleSave = async () => {
    if (!isFormValid) {
      Alert.alert("Error", "Por favor, corrige los errores en los campos.");
      return;
    }
    try {
      setProcessing(true);
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status === "granted") {
        const uri = await captureRef(qrRef, { format: "png", quality: 1 });
        await MediaLibrary.saveToLibraryAsync(uri);
        Alert.alert("Guardado", "El código QR se ha guardado en tu galería.");
      } else {
        Alert.alert(
          "Permiso denegado",
          "No se concedieron permisos para la galería."
        );
      }
    } catch (error) {
      console.error("Error al guardar:", error);
    } finally {
      setProcessing(false);
    }
  };

  const openQRColorModal = () => {
    setTempQRColor(qrColor);
    setShowQRColorPicker(true);
  };
  const closeQRColorModal = () => {
    setShowQRColorPicker(false);
  };
  const confirmQRColor = () => {
    setQRColor(tempQRColor);
    setShowQRColorPicker(false);
  };

  const openBGColorModal = () => {
    setTempBGColor(bgColor);
    setShowBGColorPicker(true);
  };
  const closeBGColorModal = () => {
    setShowBGColorPicker(false);
  };
  const confirmBGColor = () => {
    setBGColor(tempBGColor);
    setShowBGColorPicker(false);
  };

  // Estados para la visibilidad de los modales de color
  const [showQRColorPicker, setShowQRColorPicker] = useState(false);
  const [showBGColorPicker, setShowBGColorPicker] = useState(false);

  return (
    <View style={styles.container}>
      <Button
        mode="contained"
        style={[styles.mainButton, mainButtonStyle]}
        labelStyle={mainButtonLabelStyle}
        onPress={openModal}
      >
        {mainButtonText
          ? mainButtonText
          : allowCustomization
          ? "Generar QR Avanzado"
          : "Ver Código QR"}
      </Button>

      <Modal
        visible={modalVisible}
        animationType="fade"
        transparent
        onRequestClose={closeModal}
      >
        <Animated.View style={[styles.modalOverlay, { opacity: fadeAnim }]}>
          <View style={styles.modalContainer}>
            <IconButton
              icon="close"
              size={24}
              onPress={closeModal}
              style={styles.closeIcon}
            />
            <ScrollView contentContainerStyle={styles.scrollContainer}>
              {/* Fila del QR */}
              <View style={[styles.row, styles.qrRow]}>
                <View collapsable={false} ref={qrRef}>
                  <QRCode
                    value={content || " "}
                    size={150}
                    color={qrColor}
                    backgroundColor={bgColor}
                    {...(includeLogo && logo
                      ? {
                          logo: { uri: logo },
                          logoSize: defaultLogoSize,
                          logoBackgroundColor: defaultLogoBackgroundColor,
                        }
                      : {})}
                  />
                </View>
              </View>
              {allowCustomization && (
                <>
                  {/* Fila del contenido */}
                  <View style={styles.row}>
                    <TextInput
                      label="Contenido"
                      mode="outlined"
                      style={styles.input}
                      value={content}
                      onChangeText={setContent}
                      autoCapitalize="none"
                    />
                  </View>
                  {/* Fila del color del QR */}
                  <View style={styles.row}>
                    <TouchableOpacity
                      style={[styles.colorCircle, { backgroundColor: qrColor }]}
                      onPress={openQRColorModal}
                    />
                    <TextInput
                      label="Color del QR (Hex)"
                      mode="outlined"
                      style={styles.inputColor}
                      value={qrColor}
                      onChangeText={(text) => {
                        setQRColor(text);
                        setQRColorError(!validateHex(text));
                      }}
                      onBlur={() => setQRColorError(!validateHex(qrColor))}
                      error={qrColorError}
                      autoCapitalize="none"
                    />
                  </View>
                  {/* Fila del color de fondo */}
                  <View style={styles.row}>
                    <TouchableOpacity
                      style={[styles.colorCircle, { backgroundColor: bgColor }]}
                      onPress={openBGColorModal}
                    />
                    <TextInput
                      label="Color del fondo (Hex)"
                      mode="outlined"
                      style={styles.inputColor}
                      value={bgColor}
                      onChangeText={(text) => {
                        setBGColor(text);
                        setBGColorError(!validateHex(text));
                      }}
                      onBlur={() => setBGColorError(!validateHex(bgColor))}
                      error={bgColorError}
                      autoCapitalize="none"
                    />
                  </View>
                  {/* Fila para elegir logo */}
                  <View style={styles.row}>
                    <PaperSwitch
                      style={{ marginRight: 10 }}
                      value={includeLogo}
                      onValueChange={setIncludeLogo}
                    />
                    <Button
                      mode="outlined"
                      onPress={handlePickLogo}
                      disabled={!includeLogo}
                      style={styles.flex1}
                      icon={logo ? "check" : undefined}
                    >
                      Elegir Logo
                    </Button>
                  </View>
                </>
              )}
              {/* Fila de botones de acción */}
              <View style={styles.row}>
                <Button
                  mode="contained"
                  onPress={handleSave}
                  style={[styles.actionButton, { backgroundColor: "#34C759" }]}
                  loading={processing}
                  disabled={processing || !isFormValid}
                >
                  Guardar
                </Button>
                <Button
                  mode="contained"
                  onPress={handleShare}
                  style={[styles.actionButton, { backgroundColor: "#6200EE" }]}
                  loading={processing}
                  disabled={processing || !isFormValid}
                >
                  Enviar
                </Button>
              </View>
            </ScrollView>
          </View>
        </Animated.View>
      </Modal>

      {allowCustomization && showQRColorPicker && (
        <Modal
          transparent
          animationType="fade"
          visible={showQRColorPicker}
          onRequestClose={closeQRColorModal}
        >
          <View style={styles.colorPickerModalOverlay}>
            <View style={styles.colorPickerModal}>
              <IconButton
                icon="close"
                size={24}
                onPress={closeQRColorModal}
                style={styles.modalCloseIcon}
              />
              <ColorPicker
                value={tempQRColor}
                onChange={({ hex }) => setTempQRColor(hex)}
                style={styles.picker}
              >
                <Panel1 style={{ flex: 1 }} />
                <HueSlider style={styles.hueSlider} />
              </ColorPicker>
              <View style={styles.colorModalActions}>
                <Button onPress={closeQRColorModal}>Cancelar</Button>
                <Button
                  mode="contained"
                  onPress={confirmQRColor}
                  style={{ marginLeft: 10 }}
                >
                  Aceptar
                </Button>
              </View>
            </View>
          </View>
        </Modal>
      )}

      {allowCustomization && showBGColorPicker && (
        <Modal
          transparent
          animationType="fade"
          visible={showBGColorPicker}
          onRequestClose={closeBGColorModal}
        >
          <View style={styles.colorPickerModalOverlay}>
            <View style={styles.colorPickerModal}>
              <IconButton
                icon="close"
                size={24}
                onPress={closeBGColorModal}
                style={styles.modalCloseIcon}
              />
              <ColorPicker
                value={tempBGColor}
                onChange={({ hex }) => setTempBGColor(hex)}
                style={styles.picker}
              >
                <Panel1 style={{ flex: 1 }} />
                <HueSlider style={styles.hueSlider} />
              </ColorPicker>
              <View style={styles.colorModalActions}>
                <Button onPress={closeBGColorModal}>Cancelar</Button>
                <Button
                  mode="contained"
                  onPress={confirmBGColor}
                  style={{ marginLeft: 10 }}
                >
                  Aceptar
                </Button>
              </View>
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
}

const commonFlex = { flex: 1 };

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
  },
  mainButton: {
    marginVertical: 10,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
  },
  modalContainer: {
    borderRadius: 12,
    marginHorizontal: 20,
    paddingHorizontal: 20,
    backgroundColor: "#fff",
  },
  closeIcon: {
    top: 10,
    right: 10,
    zIndex: 10,
    position: "absolute",
  },
  scrollContainer: {
    paddingTop: 55,
    paddingBottom: 10,
    alignItems: "center",
  },
  row: {
    marginVertical: 10,
    flexDirection: "row",
    alignItems: "center",
  },
  qrRow: {
    justifyContent: "center",
  },
  input: {
    ...commonFlex,
  },
  colorCircle: {
    width: 40,
    height: 40,
    borderWidth: 1,
    marginRight: 10,
    borderRadius: 20,
    borderColor: "#ccc",
  },
  inputColor: {
    ...commonFlex,
  },
  flex1: {
    ...commonFlex,
  },
  actionButton: {
    ...commonFlex,
    marginHorizontal: 5,
  },
  colorPickerModalOverlay: {
    flex: 1,
    padding: 20,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(0,0,0,0.4)",
  },
  colorPickerModal: {
    height: 500,
    padding: 20,
    width: "90%",
    borderRadius: 12,
    position: "relative",
    backgroundColor: "#fff",
  },
  modalCloseIcon: {
    right: 0,
    position: "absolute",
  },
  picker: {
    ...commonFlex,
    width: "100%",
    marginTop: 30,
  },
  hueSlider: {
    marginTop: 20,
  },
  colorModalActions: {
    marginTop: 20,
    flexDirection: "row",
    justifyContent: "flex-end",
  },
});
