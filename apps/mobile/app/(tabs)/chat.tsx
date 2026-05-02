import * as ImagePicker from "expo-image-picker";
import { useRef, useState } from "react";
import { Alert, Image, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { Button, Card, FieldInput, Muted, Screen, Title, colors } from "@/components/ui";
import { GENERAL_LIFE_ASSISTANT_PROMPT, LIFE_RECORD_CHAT_PROMPT } from "@/prompts/chatPrompts";
import { imageToBase64 } from "@/services/internAI";
import { buildVisionUserMessage, callSelectedModel, ModelMessage } from "@/services/modelClient";
import { loadLifeItems } from "@/storage/lifeItemsStorage";
import { getLists } from "@/storage/listsStorage";
import { ChatMessage } from "@/types/life";
import { createId } from "@/utils/json";
import { buildLifeContextForChat } from "@/utils/lifeContext";

type ChatMode = "records" | "assistant";

export default function ChatScreen() {
  const scrollRef = useRef<ScrollView>(null);
  const [mode, setMode] = useState<ChatMode>("records");
  const [input, setInput] = useState("");
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [imageMimeType, setImageMimeType] = useState<string | undefined>();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);

  async function pickImage(camera: boolean) {
    const permission = camera ? await ImagePicker.requestCameraPermissionsAsync() : await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert("权限不足", camera ? "请允许使用相机。" : "请允许读取相册。");
      return;
    }
    const picker = camera ? ImagePicker.launchCameraAsync : ImagePicker.launchImageLibraryAsync;
    const selected = await picker({ mediaTypes: ImagePicker.MediaTypeOptions.Images, quality: 0.8 });
    if (!selected.canceled) {
      setImageUri(selected.assets[0].uri);
      setImageMimeType(selected.assets[0].mimeType);
    }
  }

  async function send() {
    const text = input.trim();
    if (!text && !imageUri) {
      Alert.alert("请输入内容", "可以输入问题，也可以在生活助手模式下选择图片后提问。");
      return;
    }
    if (mode === "records" && imageUri) {
      Alert.alert("当前模式不发送图片", "基于记录模式只会发送本地记录摘要。需要拍照提问时，请切换到生活助手模式。");
      return;
    }

    const userMessage: ChatMessage = {
      id: createId("chat-user"),
      role: "user",
      content: text || "请分析这张图片。",
      imageUri,
      createdAt: new Date().toISOString()
    };
    setMessages((current) => [...current, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const modelMessages = await buildModelMessages(mode, [...messages, userMessage], userMessage, imageMimeType);
      const answer = await callSelectedModel({
        messages: modelMessages,
        requireVision: mode === "assistant" && Boolean(imageUri)
      });
      setMessages((current) => [...current, {
        id: createId("chat-assistant"),
        role: "assistant",
        content: answer,
        createdAt: new Date().toISOString()
      }]);
      setImageUri(null);
      setImageMimeType(undefined);
      setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 50);
    } catch (error) {
      Alert.alert("发送失败", error instanceof Error ? error.message : "未知错误");
    } finally {
      setLoading(false);
    }
  }

  function clearChat() {
    setMessages([]);
    setImageUri(null);
    setImageMimeType(undefined);
  }

  return (
    <Screen>
      <View style={styles.container}>
        <Card>
          <Title>AI 对话</Title>
          <View style={styles.segment}>
            <ModeButton active={mode === "records"} label="基于记录" onPress={() => setMode("records")} />
            <ModeButton active={mode === "assistant"} label="生活助手" onPress={() => setMode("assistant")} />
          </View>
          <Muted>
            {mode === "records"
              ? "只发送经过摘要的生活卡片和清单，不会发送图片或完整原文。"
              : "你主动发送的文字和图片会发到当前默认模型接口，请避免上传身份证、银行卡、完整合同等高敏感信息。"}
          </Muted>
        </Card>

        <ScrollView ref={scrollRef} contentContainerStyle={styles.messages}>
          {messages.length === 0 ? (
            <Card>
              <Muted>{mode === "records" ? "可以问：我这个月餐饮花了多少钱？最近有哪些待处理事项？" : "可以问生活规划，也可以拍照让模型分析小票、账单、食材或旅行信息。"}</Muted>
            </Card>
          ) : messages.map((message) => (
            <View key={message.id} style={[styles.bubble, message.role === "user" ? styles.userBubble : styles.assistantBubble]}>
              {message.imageUri ? <Image source={{ uri: message.imageUri }} style={styles.messageImage} /> : null}
              <Text style={message.role === "user" ? styles.userText : styles.assistantText}>{message.content}</Text>
            </View>
          ))}
          {loading ? <Text style={styles.loading}>模型正在思考...</Text> : null}
        </ScrollView>

        <Card>
          {imageUri ? (
            <View style={styles.imagePreviewRow}>
              <Image source={{ uri: imageUri }} style={styles.preview} />
              <Button label="移除图片" variant="secondary" onPress={() => setImageUri(null)} />
            </View>
          ) : null}
          <FieldInput label="输入问题" value={input} onChangeText={setInput} multiline placeholder="例如：帮我总结最近消费，或这张账单是什么意思？" />
          <View style={styles.actions}>
            <Button label="选图" variant="secondary" onPress={() => pickImage(false)} />
            <Button label="拍照" variant="secondary" onPress={() => pickImage(true)} />
            <Button label="清空" variant="secondary" onPress={clearChat} />
          </View>
          <Button label="发送" loading={loading} onPress={send} />
        </Card>
      </View>
    </Screen>
  );
}

async function buildModelMessages(
  mode: ChatMode,
  history: ChatMessage[],
  current: ChatMessage,
  imageMimeType?: string
): Promise<ModelMessage[]> {
  if (mode === "records") {
    const [items, lists] = await Promise.all([loadLifeItems(), getLists()]);
    const context = buildLifeContextForChat(items, lists);
    return [
      { role: "system", content: LIFE_RECORD_CHAT_PROMPT },
      { role: "user", content: `${context}\n\n用户问题：${current.content}` }
    ];
  }

  const trimmedHistory = history.slice(-8).map<ModelMessage>((message) => ({
    role: message.role === "system" ? "system" : message.role,
    content: message.content
  }));

  if (current.imageUri) {
    const image = await imageToBase64(current.imageUri, imageMimeType);
    trimmedHistory.pop();
    return [
      { role: "system", content: GENERAL_LIFE_ASSISTANT_PROMPT },
      ...trimmedHistory,
      buildVisionUserMessage(current.content, image.base64, image.mimeType)
    ];
  }

  return [
    { role: "system", content: GENERAL_LIFE_ASSISTANT_PROMPT },
    ...trimmedHistory
  ];
}

function ModeButton({ active, label, onPress }: { active: boolean; label: string; onPress: () => void }) {
  return (
    <Pressable style={[styles.modeButton, active && styles.modeButtonActive]} onPress={onPress}>
      <Text style={[styles.modeText, active && styles.modeTextActive]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, gap: 10 },
  segment: { flexDirection: "row", gap: 8 },
  modeButton: {
    flex: 1,
    minHeight: 38,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fffdf9"
  },
  modeButtonActive: { backgroundColor: colors.soft, borderColor: "#b7d9d0" },
  modeText: { color: colors.muted, fontWeight: "700" },
  modeTextActive: { color: colors.primary },
  messages: { gap: 10, paddingBottom: 10 },
  bubble: { maxWidth: "86%", borderRadius: 16, padding: 12, gap: 8 },
  userBubble: { alignSelf: "flex-end", backgroundColor: colors.primary },
  assistantBubble: { alignSelf: "flex-start", backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border },
  userText: { color: "#fff", lineHeight: 20 },
  assistantText: { color: colors.text, lineHeight: 20 },
  loading: { color: colors.muted, textAlign: "center" },
  actions: { flexDirection: "row", gap: 8 },
  imagePreviewRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  preview: { width: 72, height: 72, borderRadius: 12, backgroundColor: colors.border },
  messageImage: { width: 160, height: 120, borderRadius: 12, backgroundColor: colors.border }
});
