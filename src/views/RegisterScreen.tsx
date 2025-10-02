import React, { useState, memo } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Dimensions,
  Image,
  ScrollView,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { createUserWithEmailAndPassword, sendEmailVerification } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { auth, db } from "../services/firebase";

const { height, width } = Dimensions.get("window");

const COLORS = {
  DARK_BG: "#102D15",
  MEDIUM_GREEN: "#3B6528",
  LIGHT_ACCENT: "#C0FFC0",
  PRIMARY_FILL: "#86F97A",
  PRIMARY_TEXT: "#102D15",
  CARD_BG: "#FFFFFF",
  FORM_TEXT_DARK: "#333333",
  ICON_COLOR: "#888",
};

interface RegisterData {
  displayName: string;
  email: string;
  password: string;
  phone: string;
}

// 🔹 Muevo CustomInput fuera del componente principal y lo memoizo
const CustomInput = memo(
  ({
    iconName,
    placeholder,
    value,
    onChangeText,
    secureTextEntry = false,
    keyboardType = "default",
    autoCapitalize = "sentences",
    isPasswordVisible,
    togglePasswordVisibility,
    name,
  }: {
    iconName: string;
    placeholder: string;
    value: string;
    onChangeText: (text: string) => void;
    secureTextEntry?: boolean;
    keyboardType?: string;
    autoCapitalize?: "none" | "sentences" | "words" | "characters";
    isPasswordVisible?: boolean;
    togglePasswordVisibility?: () => void;
    name: string;
  }) => {
    const isPassword = name === "password";

    return (
      <View style={styles.inputWrapper}>
        <Ionicons name={iconName as any} size={22} color={COLORS.ICON_COLOR} style={styles.icon} />
        <TextInput
          style={styles.inputField}
          placeholder={placeholder}
          placeholderTextColor="#888"
          value={value}
          onChangeText={onChangeText}
          keyboardType={keyboardType as any}
          autoCapitalize={autoCapitalize}
          secureTextEntry={isPassword ? !isPasswordVisible : secureTextEntry}
        />
        {isPassword && togglePasswordVisibility && (
          <TouchableOpacity style={styles.passwordToggle} onPress={togglePasswordVisibility}>
            <Ionicons
              name={isPasswordVisible ? "eye-off-outline" : "eye-outline"}
              size={22}
              color={COLORS.ICON_COLOR}
            />
          </TouchableOpacity>
        )}
      </View>
    );
  }
);

const RegisterScreen = () => {
  const navigation = useNavigation();
  const [formData, setFormData] = useState<RegisterData>({
    displayName: "",
    email: "",
    password: "",
    phone: "",
  });
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  const handleInputChange = (name: keyof RegisterData, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleRegister = async () => {
    const { displayName, email, password, phone } = formData;
    setErrorMessage("");

    if (!displayName || !email || !password) {
      setErrorMessage("Por favor, complete todos los campos.");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setErrorMessage("Ingrese un correo electrónico válido.");
      return;
    }

    const passwordRegex = /^(?=.*[A-Z])(?=.*\d).{8,}$/;
    if (!passwordRegex.test(password)) {
      setErrorMessage(
        "La contraseña debe tener mínimo 8 caracteres, una mayúscula y un número."
      );
      return;
    }

    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      await setDoc(doc(db, "users", userCredential.user.uid), {
        displayName,
        email,
        phone,
        createdAt: new Date(),
      });
      await sendEmailVerification(userCredential.user);
      navigation.navigate("Login" as never);
    } catch (error: any) {
      setErrorMessage(error.message || "Error al crear la cuenta");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.background}>
      <View style={[styles.abstractShape, styles.fluidWave]} />
      <View style={[styles.abstractShape, styles.litSphere]} />
      <View style={[styles.abstractShape, styles.bottomAccent]} />

      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <Text style={styles.backButtonText}>{"< Back"}</Text>
      </TouchableOpacity>

      <Image source={require("../../assets/images/logo.png")} style={styles.logoCircle} resizeMode="contain" />

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={Platform.OS === "ios" ? 60 : 0}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.cardContainer}>
            <Text style={styles.title}>¡Empieza!</Text>
            <Text style={styles.description}>Crea tu nueva cuenta en segundos.</Text>

            <CustomInput
              iconName="person-outline"
              placeholder="Nombre Completo"
              value={formData.displayName}
              onChangeText={(text) => handleInputChange("displayName", text)}
              name="displayName"
            />
            <CustomInput
              iconName="call-outline"
              placeholder="Teléfono"
              value={formData.phone}
              onChangeText={(text) => handleInputChange("phone", text)}
              keyboardType="phone-pad"
              name="phone"
            />
            <CustomInput
              iconName="mail-outline"
              placeholder="Email"
              value={formData.email}
              onChangeText={(text) => handleInputChange("email", text)}
              keyboardType="email-address"
              autoCapitalize="none"
              name="email"
            />
            <CustomInput
              iconName="lock-closed-outline"
              placeholder="Contraseña"
              value={formData.password}
              onChangeText={(text) => handleInputChange("password", text)}
              secureTextEntry={true}
              isPasswordVisible={isPasswordVisible}
              togglePasswordVisibility={() => setIsPasswordVisible(!isPasswordVisible)}
              name="password"
            />

            {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}

            <TouchableOpacity style={styles.buttonPrimary} onPress={handleRegister} disabled={loading}>
              {loading ? <ActivityIndicator color={COLORS.CARD_BG} /> : <Text style={styles.buttonText}>Crear Cuenta</Text>}
            </TouchableOpacity>

            <TouchableOpacity onPress={() => navigation.navigate("Login" as never)}>
              <Text style={styles.linkText}>¿Ya tienes cuenta? Inicia sesión</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  background: { flex: 1, backgroundColor: COLORS.DARK_BG },
  scrollContent: { flexGrow: 1, justifyContent: "flex-end", alignItems: "center" },
  abstractShape: { position: "absolute", borderRadius: 9999 },
  fluidWave: { width: width * 1.5, height: height * 1.5, top: -height * 0.5, left: -width * 0.5, backgroundColor: COLORS.MEDIUM_GREEN, opacity: 0.7 },
  litSphere: { width: 140, height: 140, top: height * 0.1, right: 40, backgroundColor: COLORS.LIGHT_ACCENT, opacity: 0.9, shadowColor: COLORS.LIGHT_ACCENT, shadowOffset: { width: 0, height: 0 }, shadowOpacity: 1, shadowRadius: 15, elevation: 20 },
  bottomAccent: { width: width * 0.7, height: height * 0.5, bottom: height * 0.1, left: -width * 0.2, backgroundColor: COLORS.MEDIUM_GREEN, opacity: 0.4 },
  logoCircle: { position: "absolute", top: height * 0.15 - 25, alignSelf: "center", width: 150, height: 150, borderRadius: 75, backgroundColor: COLORS.MEDIUM_GREEN, zIndex: 10, borderWidth: 5, borderColor: COLORS.CARD_BG, elevation: 15, shadowColor: COLORS.LIGHT_ACCENT, shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.7, shadowRadius: 10 },
  backButton: { position: "absolute", top: 50, left: 20, zIndex: 10, padding: 10 },
  backButtonText: { color: COLORS.LIGHT_ACCENT, fontSize: 16, fontWeight: "600" },
  cardContainer: { width: "100%", backgroundColor: COLORS.CARD_BG, borderTopLeftRadius: 40, borderTopRightRadius: 40, paddingHorizontal: 30, paddingTop: 85, paddingBottom: 40, alignItems: "center", elevation: 10, shadowColor: "#000", shadowOffset: { width: 0, height: -5 }, shadowOpacity: 0.1, shadowRadius: 5 },
  title: { fontSize: 32, fontWeight: "bold", color: COLORS.FORM_TEXT_DARK, marginBottom: 10 },
  description: { fontSize: 16, color: COLORS.FORM_TEXT_DARK, textAlign: "center", marginBottom: 40, opacity: 0.6 },
  inputWrapper: { flexDirection: "row", alignItems: "center", backgroundColor: "#F5F5F5", borderRadius: 12, marginBottom: 15, borderWidth: 1, borderColor: "#E0E0E0", paddingHorizontal: 15, height: 55 },
  icon: { marginRight: 10 },
  inputField: { flex: 1, fontSize: 16, color: COLORS.FORM_TEXT_DARK, height: "100%" },
  passwordToggle: { paddingLeft: 10, paddingVertical: 5 },
  errorText: { color: "red", marginBottom: 15, fontSize: 14, textAlign: "center" },
  buttonPrimary: { backgroundColor: COLORS.PRIMARY_FILL, paddingHorizontal: 50, paddingVertical: 15, borderRadius: 15, marginBottom: 20, width: "100%", alignItems: "center", elevation: 8, shadowColor: COLORS.PRIMARY_FILL, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.5, shadowRadius: 5 },
  buttonText: { color: COLORS.PRIMARY_TEXT, fontSize: 18, fontWeight: "bold" },
  linkText: { color: COLORS.MEDIUM_GREEN, fontSize: 16, marginTop: 10, textDecorationLine: "underline" },
});

export default RegisterScreen;
