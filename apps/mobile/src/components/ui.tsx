import { ReactNode } from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, TextInput, TextInputProps, View } from "react-native";

export function Screen({ children }: { children: ReactNode }) {
  return <View style={styles.screen}>{children}</View>;
}

export function Card({ children }: { children: ReactNode }) {
  return <View style={styles.card}>{children}</View>;
}

export function EmptyState({ title, description }: { title: string; description: string }) {
  return (
    <View style={styles.empty}>
      <Text style={styles.emptyIcon}>LP</Text>
      <Text style={styles.emptyTitle}>{title}</Text>
      <Text style={styles.emptyText}>{description}</Text>
    </View>
  );
}

export function Title({ children }: { children: ReactNode }) {
  return <Text style={styles.title}>{children}</Text>;
}

export function Muted({ children }: { children: ReactNode }) {
  return <Text style={styles.muted}>{children}</Text>;
}

export function Button({
  label,
  onPress,
  variant = "primary",
  loading
}: {
  label: string;
  onPress?: () => void;
  variant?: "primary" | "secondary" | "danger";
  loading?: boolean;
}) {
  return (
    <Pressable
      disabled={loading}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        variant === "secondary" && styles.secondaryButton,
        variant === "danger" && styles.dangerButton,
        pressed && styles.pressed
      ]}
    >
      {loading ? <ActivityIndicator color="#fff" /> : <Text style={[styles.buttonText, variant === "secondary" && styles.secondaryButtonText]}>{label}</Text>}
    </Pressable>
  );
}

export function FieldInput(props: TextInputProps & { label: string }) {
  return (
    <View style={styles.fieldWrap}>
      <Text style={styles.label}>{props.label}</Text>
      <TextInput placeholderTextColor="#94a3b8" {...props} style={[styles.input, props.multiline && styles.multiline, props.style]} />
    </View>
  );
}

export const colors = {
  bg: "#f8f3ea",
  card: "#ffffff",
  text: "#16212a",
  muted: "#66747f",
  primary: "#237e6f",
  accent: "#f28c4b",
  border: "#e7dcca",
  soft: "#e9f5f1",
  danger: "#dc2626"
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.bg,
    padding: 14,
    gap: 12
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 14,
    gap: 10,
    shadowColor: "#0f172a",
    shadowOpacity: 0.06,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 8 },
    elevation: 2
  },
  title: {
    color: colors.text,
    fontSize: 20,
    fontWeight: "700"
  },
  muted: {
    color: colors.muted,
    lineHeight: 20
  },
  button: {
    minHeight: 46,
    borderRadius: 12,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 16
  },
  secondaryButton: {
    backgroundColor: colors.soft,
    borderWidth: 1,
    borderColor: "#b7d9d0"
  },
  dangerButton: {
    backgroundColor: colors.danger
  },
  buttonText: {
    color: "#fff",
    fontWeight: "700"
  },
  secondaryButtonText: {
    color: colors.primary
  },
  pressed: {
    opacity: 0.82
  },
  fieldWrap: {
    gap: 6
  },
  label: {
    color: colors.text,
    fontSize: 13,
    fontWeight: "700"
  },
  input: {
    minHeight: 44,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: "#fffdf9",
    paddingHorizontal: 12,
    color: colors.text
  },
  multiline: {
    minHeight: 110,
    paddingTop: 10,
    textAlignVertical: "top"
  },
  empty: {
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: colors.border,
    backgroundColor: "#fffaf2",
    borderRadius: 16,
    padding: 18,
    alignItems: "center",
    gap: 8
  },
  emptyIcon: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: colors.soft,
    color: colors.primary,
    textAlign: "center",
    lineHeight: 42,
    fontWeight: "800"
  },
  emptyTitle: {
    color: colors.text,
    fontWeight: "800"
  },
  emptyText: {
    color: colors.muted,
    textAlign: "center",
    lineHeight: 20
  }
});
