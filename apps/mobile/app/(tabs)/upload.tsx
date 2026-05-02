import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Alert, Image, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { getLifeItemTypeMeta } from "@/constants/lifeItemMeta";
import { Button, Card, EmptyState, FieldInput, Muted, Screen, Title, colors } from "@/components/ui";
import { recognizeImage, recognizeText } from "@/services/internAI";
import { upsertLifeItem, upsertLifeItems } from "@/storage/lifeItemsStorage";
import { LifeItem } from "@/types/life";

export default function UploadScreen() {
  const router = useRouter();
  const [text, setText] = useState("");
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [imageMimeType, setImageMimeType] = useState<string | undefined>();
  const [imageTimeAnchor, setImageTimeAnchor] = useState<string | undefined>();
  const [results, setResults] = useState<LifeItem[]>([]);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);

  async function pickImage(camera: boolean) {
    const permission = camera ? await ImagePicker.requestCameraPermissionsAsync() : await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert("权限不足", camera ? "请允许使用相机。" : "请允许读取相册。");
      return;
    }
    const picker = camera ? ImagePicker.launchCameraAsync : ImagePicker.launchImageLibraryAsync;
    const selected = await picker({ mediaTypes: ImagePicker.MediaTypeOptions.Images, quality: 0.8, exif: true });
    if (!selected.canceled) {
      const asset = selected.assets[0];
      setImageUri(asset.uri);
      setImageMimeType(asset.mimeType);
      setImageTimeAnchor(readImagePickerTimeAnchor(asset));
      resetResults();
    }
  }

  async function recognize() {
    if (!imageUri && !text.trim()) {
      Alert.alert("缺少内容", "请先选择图片、拍照或粘贴一段文字。");
      return;
    }
    setLoading(true);
    try {
      const items = imageUri ? await recognizeImage(null, imageUri, text, imageMimeType, imageTimeAnchor) : await recognizeText(null, text);
      setResults(items);
      setExpandedIds(new Set(items.length === 1 ? [items[0].id] : []));
      setSavedIds(new Set());
    } catch (error) {
      Alert.alert("识别失败", error instanceof Error ? error.message : "未知错误");
    } finally {
      setLoading(false);
    }
  }

  async function saveOne(item: LifeItem) {
    await upsertLifeItem(item);
    setSavedIds((current) => new Set(current).add(item.id));
    Alert.alert("已保存", "生活卡片已保存到本地。", [{ text: "查看", onPress: () => router.push(`/items/${item.id}`) }]);
  }

  async function saveAll() {
    const pending = results.filter((item) => !savedIds.has(item.id));
    if (pending.length === 0) return;
    await upsertLifeItems(pending);
    setSavedIds(new Set(results.map((item) => item.id)));
    Alert.alert("已保存", `已保存 ${pending.length} 张生活卡片。`);
  }

  function removeResult(id: string) {
    setResults((current) => current.filter((item) => item.id !== id));
    setExpandedIds((current) => {
      const next = new Set(current);
      next.delete(id);
      return next;
    });
  }

  function toggleExpanded(id: string) {
    setExpandedIds((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function clearInput() {
    setText("");
    setImageUri(null);
    setImageMimeType(undefined);
    setImageTimeAnchor(undefined);
    resetResults();
  }

  function resetResults() {
    setResults([]);
    setExpandedIds(new Set());
    setSavedIds(new Set());
  }

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Card>
          <Title>上传 / 识别</Title>
          <Muted>使用你在设置页填写的 Token 调用书生模型。长截图、小票或账单中有多条独立记录时，App 会尽量生成多张生活卡片。</Muted>
          <View style={styles.drop}>
            <Text style={styles.dropTitle}>{imageUri ? "已选择图片" : "截图收纳箱"}</Text>
            <Text style={styles.dropText}>小票、账单、预约、购物截图、旅行信息和普通待办都可以从这里识别。</Text>
          </View>
          <View style={styles.actions}>
            <Button label="选择图片" variant="secondary" onPress={() => pickImage(false)} />
            <Button label="拍照" variant="secondary" onPress={() => pickImage(true)} />
            <Button label="清除" variant="secondary" onPress={clearInput} />
          </View>
          {imageUri ? <Image source={{ uri: imageUri }} style={styles.preview} /> : null}
          <FieldInput label="粘贴文本或补充说明" multiline value={text} onChangeText={setText} placeholder="例如：5 月房租 4200 元，5 月 5 日前转给房东..." />
          <Button label="开始识别" loading={loading} onPress={recognize} />
        </Card>

        {results.length > 0 ? (
          <Card>
            <View style={styles.resultHead}>
              <Title>{results.length === 1 ? "识别结果" : `识别到 ${results.length} 条生活卡片`}</Title>
              {results.length > 1 ? <Button label="保存全部" onPress={saveAll} /> : null}
            </View>
            {results.map((item) => (
              <ResultCard
                key={item.id}
                item={item}
                expanded={expandedIds.has(item.id)}
                saved={savedIds.has(item.id)}
                onToggle={() => toggleExpanded(item.id)}
                onSave={() => saveOne(item)}
                onRemove={() => removeResult(item.id)}
              />
            ))}
          </Card>
        ) : (
          <EmptyState title="等待识别" description="识别成功后会预览类型、标题、金额、日期、商家和分类；多条记录可单独保存或一键保存全部。" />
        )}
      </ScrollView>
    </Screen>
  );
}

function ResultCard({
  item,
  expanded,
  saved,
  onToggle,
  onSave,
  onRemove
}: {
  item: LifeItem;
  expanded: boolean;
  saved: boolean;
  onToggle: () => void;
  onSave: () => void;
  onRemove: () => void;
}) {
  const meta = getLifeItemTypeMeta(item.type);
  return (
    <View style={styles.resultCard}>
      <Pressable style={styles.resultTitleRow} onPress={onToggle}>
        <Text style={[styles.type, { color: meta.color }]}>{meta.label}</Text>
        <Text style={styles.confidence}>置信度 {item.confidence ?? "-"}</Text>
      </Pressable>
      <Text style={styles.resultTitle}>{item.title}</Text>
      <Muted>{item.summary}</Muted>
      {expanded ? (
        <View style={styles.fields}>
          <Meta label="金额" value={item.amount != null ? `${item.currency || "CNY"} ${item.amount}` : "-"} />
          <Meta label="日期" value={item.date || item.dueDate || item.eventDateTime || "-"} />
          <Meta label="商家" value={item.merchant || "-"} />
          <Meta label="分类" value={item.category || "其他"} />
          <Meta label="地点" value={item.location || "-"} />
          <Meta label="提醒" value={item.remindAt || "-"} />
        </View>
      ) : null}
      <View style={styles.resultActions}>
        <Button label={saved ? "已保存" : "保存这张"} variant="secondary" onPress={saved ? undefined : onSave} />
        <Button label="不需要" variant="secondary" onPress={onRemove} />
      </View>
    </View>
  );
}

function readImagePickerTimeAnchor(asset: ImagePicker.ImagePickerAsset) {
  const exif = asset.exif as Record<string, unknown> | null | undefined;
  const candidates = [
    exif?.DateTimeOriginal,
    exif?.DateTimeDigitized,
    exif?.DateTime,
    exif?.CreationDate,
    exif?.ModifyDate
  ];
  for (const value of candidates) {
    const date = parseImageTimestamp(value);
    if (date) return date.toISOString();
  }
  return undefined;
}

function parseImageTimestamp(value: unknown) {
  if (typeof value !== "string" && typeof value !== "number") return null;
  if (typeof value === "number") {
    const date = new Date(value > 10_000_000_000 ? value : value * 1000);
    return Number.isNaN(date.getTime()) ? null : date;
  }
  const normalized = value.trim().replace(/^(\d{4}):(\d{2}):(\d{2})/, "$1-$2-$3").replace(" ", "T");
  const date = new Date(normalized);
  return Number.isNaN(date.getTime()) ? null : date;
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
  resultHead: { gap: 8 },
  resultCard: { borderTopWidth: 1, borderTopColor: colors.border, paddingTop: 12, gap: 8 },
  resultTitleRow: { flexDirection: "row", justifyContent: "space-between", gap: 12 },
  type: { fontWeight: "800" },
  confidence: { color: colors.muted, fontSize: 12 },
  resultTitle: { color: colors.text, fontSize: 18, fontWeight: "800" },
  fields: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  meta: { width: "48%", backgroundColor: "#f8fafc", borderRadius: 12, padding: 10, borderWidth: 1, borderColor: colors.border },
  metaLabel: { color: colors.muted, fontSize: 12 },
  metaValue: { color: colors.text, fontWeight: "700", marginTop: 3 },
  resultActions: { flexDirection: "row", gap: 8 }
});
