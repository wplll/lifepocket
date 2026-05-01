import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Alert, Image, ScrollView, StyleSheet, Text, View } from "react-native";
import { Button, Card, EmptyState, FieldInput, Muted, Screen, Title, colors } from "@/components/ui";
import { recognizeImage, recognizeText } from "@/services/internAI";
import { loadSettings } from "@/storage/settingsStorage";
import { upsertLifeItem } from "@/storage/lifeItemsStorage";
import { LifeItem, typeLabels } from "@/types/life";

export default function UploadScreen() {
  const router = useRouter();
  const [text, setText] = useState("");
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [result, setResult] = useState<LifeItem | null>(null);
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
    }
  }

  async function recognize() {
    if (!imageUri && !text.trim()) {
      Alert.alert("缺少内容", "请先选择图片、拍照或粘贴一段文字。");
      return;
    }
    setLoading(true);
    try {
      const settings = await loadSettings();
      const item = imageUri ? await recognizeImage(settings, imageUri, text) : await recognizeText(settings, text);
      setResult(item);
    } catch (error) {
      Alert.alert("识别失败", error instanceof Error ? error.message : "未知错误");
    } finally {
      setLoading(false);
    }
  }

  async function save() {
    if (!result) return;
    await upsertLifeItem(result);
    Alert.alert("已保存", "生活卡片已保存到本地。", [{ text: "查看", onPress: () => router.push(`/items/${result.id}`) }]);
  }

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Card>
          <Title>上传 / 识别</Title>
          <Muted>使用你在设置页填写的 Token 调用书生模型。图片只从本机读取并随请求发送给模型。</Muted>
          <View style={styles.drop}>
            <Text style={styles.dropTitle}>{imageUri ? "已选择图片" : "截图收纳箱"}</Text>
            <Text style={styles.dropText}>小票、账单、预约、购物截图和旅行信息都可以从这里进入。</Text>
          </View>
          <View style={styles.actions}>
            <Button label="选择图片" variant="secondary" onPress={() => pickImage(false)} />
            <Button label="拍照" variant="secondary" onPress={() => pickImage(true)} />
          </View>
          {imageUri ? <Image source={{ uri: imageUri }} style={styles.preview} /> : null}
          <FieldInput label="粘贴文本或补充说明" multiline value={text} onChangeText={setText} placeholder="例如：5月房租 4200 元，5月5日前转给房东..." />
          <Button label="开始识别" loading={loading} onPress={recognize} />
        </Card>

        {result ? (
          <Card>
            <Title>识别结果</Title>
            <View style={styles.resultHead}>
              <Text style={styles.type}>{typeLabels[result.type]}</Text>
              <Text style={styles.confidence}>置信度 {result.confidence ?? "-"}</Text>
            </View>
            <Text style={styles.resultTitle}>{result.title}</Text>
            <Muted>{result.summary}</Muted>
            <View style={styles.fields}>
              <Meta label="金额" value={result.amount ? `${result.currency || "CNY"} ${result.amount}` : "-"} />
              <Meta label="日期" value={result.date || "-"} />
              <Meta label="商家" value={result.merchant || "-"} />
              <Meta label="分类" value={result.category || "-"} />
            </View>
            <Button label="保存卡片" onPress={save} />
          </Card>
        ) : (
          <EmptyState title="等待识别" description="识别成功后会预览类型、标题、金额、日期、商家和分类。" />
        )}
      </ScrollView>
    </Screen>
  );
}

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.meta}>
      <Text style={styles.metaLabel}>{label}</Text>
      <Text style={styles.metaValue} numberOfLines={1}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  scroll: { gap: 12, paddingBottom: 24 },
  drop: { borderWidth: 1, borderStyle: "dashed", borderColor: colors.border, backgroundColor: "#fffaf2", borderRadius: 16, padding: 16, gap: 4 },
  dropTitle: { color: colors.text, fontSize: 16, fontWeight: "800" },
  dropText: { color: colors.muted, lineHeight: 20 },
  actions: { flexDirection: "row", gap: 8 },
  preview: { width: "100%", height: 190, borderRadius: 12, backgroundColor: colors.border },
  resultHead: { flexDirection: "row", justifyContent: "space-between" },
  type: { color: colors.primary, fontWeight: "800" },
  confidence: { color: colors.muted, fontSize: 12 },
  resultTitle: { color: colors.text, fontSize: 18, fontWeight: "800" },
  fields: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  meta: { width: "48%", backgroundColor: "#f8fafc", borderRadius: 12, padding: 10, borderWidth: 1, borderColor: colors.border },
  metaLabel: { color: colors.muted, fontSize: 12 },
  metaValue: { color: colors.text, fontWeight: "700", marginTop: 3 }
});
