import { useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { Alert, Linking, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { LIFE_ITEM_STATUS_META, LIFE_ITEM_TYPE_META } from "@/constants/lifeItemMeta";
import { Button, Card, FieldInput, Muted, Screen, Title, colors } from "@/components/ui";
import {
  createEmptyModelConfig,
  deleteModelConfig,
  getModelConfigs,
  saveModelConfig,
  setDefaultModelConfig,
  testConfigWithToken
} from "@/storage/modelConfigsStorage";
import { maskToken } from "@/storage/settingsStorage";
import { testModelConnection } from "@/services/modelClient";
import { LifeItemType, ModelConfig, ModelProviderType } from "@/types/life";

const tokenUrl = "https://internlm.intern-ai.org.cn/api/tokens";
const providerOptions: Array<{ value: ModelProviderType; label: string }> = [
  { value: "internlm", label: "书生模型" },
  { value: "openai_compatible", label: "OpenAI 兼容" },
  { value: "custom", label: "自定义" }
];

export default function SettingsScreen() {
  const [configs, setConfigs] = useState<ModelConfig[]>([]);
  const [tokenMasks, setTokenMasks] = useState<Record<string, string>>({});
  const [editing, setEditing] = useState<ModelConfig | null>(null);
  const [tokenInput, setTokenInput] = useState("");
  const [result, setResult] = useState("");
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [showHelp, setShowHelp] = useState(false);
  const [showTokenHelp, setShowTokenHelp] = useState(true);

  useFocusEffect(useCallback(() => {
    refresh();
  }, []));

  async function refresh() {
    const loaded = await getModelConfigs();
    setConfigs(loaded);
    const entries = await Promise.all(loaded.map(async (config) => {
      const withToken = await testConfigWithToken(config);
      return [config.id, maskToken(withToken.apiToken)] as const;
    }));
    setTokenMasks(Object.fromEntries(entries));
  }

  function startAdd() {
    setEditing({ ...createEmptyModelConfig(), isDefault: configs.length === 0 });
    setTokenInput("");
    setResult("");
  }

  function startEdit(config: ModelConfig) {
    setEditing(config);
    setTokenInput("");
    setResult("");
  }

  async function saveEditing() {
    if (!editing) return;
    if (!editing.name.trim() || !editing.endpoint.trim() || !editing.model.trim()) {
      Alert.alert("信息不完整", "请填写配置名称、Endpoint 和 Model。");
      return;
    }
    const now = new Date().toISOString();
    await saveModelConfig({ ...editing, updatedAt: now }, tokenInput);
    setEditing(null);
    setTokenInput("");
    await refresh();
    Alert.alert("已保存", "模型配置已保存。");
  }

  async function test(config: ModelConfig, apiToken?: string) {
    setLoadingId(config.id);
    try {
      const text = await testModelConnection(config, apiToken);
      setResult(text);
      if (apiToken?.trim()) {
        await saveModelConfig(config, apiToken);
        await refresh();
      }
    } catch (error) {
      Alert.alert("测试失败", error instanceof Error ? error.message : "未知错误");
    } finally {
      setLoadingId(null);
    }
  }

  function confirmDelete(config: ModelConfig) {
    Alert.alert("删除模型配置", `确定删除“${config.name}”吗？Token 也会从本地安全存储中移除。`, [
      { text: "取消", style: "cancel" },
      {
        text: "删除",
        style: "destructive",
        onPress: async () => {
          await deleteModelConfig(config.id);
          if (editing?.id === config.id) setEditing(null);
          await refresh();
        }
      }
    ]);
  }

  async function makeDefault(config: ModelConfig) {
    await setDefaultModelConfig(config.id);
    await refresh();
  }

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Card>
          <Title>当前使用模型</Title>
          {configs.find((config) => config.isDefault) ? (
            <ModelSummary config={configs.find((config) => config.isDefault)!} mask={tokenMasks[configs.find((config) => config.isDefault)!.id]} />
          ) : (
            <Muted>还没有默认模型，请添加一个模型配置。</Muted>
          )}
        </Card>

        <Card>
          <View style={styles.sectionHead}>
            <Title>模型配置</Title>
            <Button label="添加模型" variant="secondary" onPress={startAdd} />
          </View>
          {configs.map((config) => (
            <View key={config.id} style={styles.modelCard}>
              <ModelSummary config={config} mask={tokenMasks[config.id]} />
              <View style={styles.actions}>
                <Button label="测试连接" loading={loadingId === config.id} variant="secondary" onPress={() => test(config)} />
                <Button label={config.isDefault ? "默认模型" : "设为默认"} variant="secondary" onPress={config.isDefault ? undefined : () => makeDefault(config)} />
              </View>
              <View style={styles.actions}>
                <Button label="编辑" variant="secondary" onPress={() => startEdit(config)} />
                <Button label="删除" variant="danger" onPress={() => confirmDelete(config)} />
              </View>
            </View>
          ))}
        </Card>

        {editing ? (
          <Card>
            <Title>{configs.some((config) => config.id === editing.id) ? "编辑模型" : "添加模型"}</Title>
            <FieldInput label="配置名称" value={editing.name} onChangeText={(name) => setEditing({ ...editing, name })} />
            <Text style={styles.label}>Provider 类型</Text>
            <View style={styles.providerRow}>
              {providerOptions.map((option) => (
                <Pressable
                  key={option.value}
                  style={[styles.providerButton, editing.provider === option.value && styles.providerButtonActive]}
                  onPress={() => setEditing({ ...editing, provider: option.value })}
                >
                  <Text style={[styles.providerText, editing.provider === option.value && styles.providerTextActive]}>{option.label}</Text>
                </Pressable>
              ))}
            </View>
            <FieldInput label="API Endpoint" value={editing.endpoint} autoCapitalize="none" onChangeText={(endpoint) => setEditing({ ...editing, endpoint })} />
            <FieldInput label="Model" value={editing.model} autoCapitalize="none" onChangeText={(model) => setEditing({ ...editing, model })} />
            <FieldInput
              label={tokenMasks[editing.id] ? `API Token（已保存：${tokenMasks[editing.id]}）` : "API Token"}
              value={tokenInput}
              secureTextEntry
              autoCapitalize="none"
              placeholder={tokenMasks[editing.id] ? "留空继续使用已保存 Token" : "请输入 Bearer Token"}
              onChangeText={setTokenInput}
            />
            <TokenHelp show={showTokenHelp} onToggle={() => setShowTokenHelp((value) => !value)} />
            <Pressable style={styles.toggleRow} onPress={() => setEditing({ ...editing, supportsVision: !editing.supportsVision })}>
              <Text style={styles.toggleText}>支持图片识别 / 视觉输入</Text>
              <Text style={[styles.toggleBadge, editing.supportsVision && styles.toggleBadgeOn]}>{editing.supportsVision ? "已开启" : "未开启"}</Text>
            </Pressable>
            <Pressable style={styles.toggleRow} onPress={() => setEditing({ ...editing, isDefault: !editing.isDefault })}>
              <Text style={styles.toggleText}>设为默认模型</Text>
              <Text style={[styles.toggleBadge, editing.isDefault && styles.toggleBadgeOn]}>{editing.isDefault ? "是" : "否"}</Text>
            </Pressable>
            <View style={styles.actions}>
              <Button label="保存配置" onPress={saveEditing} />
              <Button label="测试当前表单" loading={loadingId === editing.id} variant="secondary" onPress={() => test(editing, tokenInput)} />
              <Button label="取消" variant="secondary" onPress={() => setEditing(null)} />
            </View>
          </Card>
        ) : null}

        {result ? (
          <Card>
            <Title>测试结果</Title>
            <Text style={styles.result}>{result}</Text>
          </Card>
        ) : null}

        <Card>
          <Pressable style={styles.helpHead} onPress={() => setShowHelp((value) => !value)}>
            <Title>使用说明</Title>
            <Text style={styles.helpToggle}>{showHelp ? "收起" : "展开"}</Text>
          </Pressable>
          {showHelp ? <HelpContent /> : <Muted>查看 API 设置、上传识别、类型、状态、清单、对话和隐私说明。</Muted>}
        </Card>

        <Card>
          <Title>隐私说明</Title>
          <Muted>Token 只保存在本机安全存储；上传识别和对话只会在你主动发送时调用当前默认模型接口。基于记录的对话只发送摘要，不会发送完整图片、完整 Token 或完整敏感原文。</Muted>
        </Card>
      </ScrollView>
    </Screen>
  );
}

function ModelSummary({ config, mask }: { config: ModelConfig; mask?: string }) {
  return (
    <View style={styles.summaryBox}>
      <Text style={styles.modelName}>{config.name}{config.isDefault ? " · 默认" : ""}</Text>
      <Text style={styles.modelLine}>Endpoint: {config.endpoint}</Text>
      <Text style={styles.modelLine}>Model: {config.model}</Text>
      <Text style={styles.modelLine}>能力：{config.supportsVision ? "文本 + 图片" : "仅文本"} · Token：{mask || "未保存"}</Text>
    </View>
  );
}

function TokenHelp({ show, onToggle }: { show: boolean; onToggle: () => void }) {
  return (
    <View style={styles.tokenHelp}>
      <Pressable style={styles.helpHead} onPress={onToggle}>
        <Text style={styles.helpTitle}>如何获取书生模型 API Token？</Text>
        <Text style={styles.helpToggle}>{show ? "收起" : "展开"}</Text>
      </Pressable>
      <Muted>还没有 API Token？请前往书生 API Token 页面注册并申请。</Muted>
      <Button label="前往申请 API Token" variant="secondary" onPress={() => Linking.openURL(tokenUrl)} />
      {show ? (
        <View style={styles.helpBody}>
          <Text style={styles.helpLine}>1. 点击“前往申请 API Token”；</Text>
          <Text style={styles.helpLine}>2. 登录或注册书生平台账号；</Text>
          <Text style={styles.helpLine}>3. 进入 API Token 页面；</Text>
          <Text style={styles.helpLine}>4. 创建或复制你的 Token；</Text>
          <Text style={styles.helpLine}>5. 回到 LifePocket 设置页粘贴 Token；</Text>
          <Text style={styles.helpLine}>6. 点击“测试连接”。Token 相当于模型访问凭证，请不要公开分享。</Text>
        </View>
      ) : null}
    </View>
  );
}

function HelpContent() {
  return (
    <View style={styles.helpBody}>
      <Text style={styles.helpTitle}>API 设置</Text>
      <Muted>可以添加多个 OpenAI Chat Completions 兼容接口，并选择一个作为默认模型。上传识别、清单生成和对话都会使用当前默认模型。</Muted>
      <Text style={styles.helpTitle}>上传识别</Text>
      <Muted>可以选择图片、拍照或粘贴文字。图片识别需要默认模型开启“支持视觉输入”。</Muted>
      <Text style={styles.helpTitle}>类型说明</Text>
      {(Object.keys(LIFE_ITEM_TYPE_META) as LifeItemType[]).map((type) => (
        <Text key={type} style={styles.helpLine}>{LIFE_ITEM_TYPE_META[type].label}：{LIFE_ITEM_TYPE_META[type].description}</Text>
      ))}
      <Text style={styles.helpTitle}>状态说明</Text>
      <Text style={styles.helpLine}>待处理：{LIFE_ITEM_STATUS_META.active.description}</Text>
      <Text style={styles.helpLine}>已完成：{LIFE_ITEM_STATUS_META.done.description}</Text>
      <Text style={styles.helpLine}>已归档：{LIFE_ITEM_STATUS_META.archived.description}</Text>
      <Text style={styles.helpTitle}>对话说明</Text>
      <Muted>“基于记录”只发送本地记录摘要；“生活助手”支持文字和图片咨询。</Muted>
    </View>
  );
}

const styles = StyleSheet.create({
  scroll: { gap: 12, paddingBottom: 24 },
  sectionHead: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", gap: 10 },
  modelCard: { borderTopWidth: 1, borderTopColor: colors.border, paddingTop: 12, gap: 10 },
  summaryBox: { gap: 4 },
  modelName: { color: colors.text, fontSize: 17, fontWeight: "800" },
  modelLine: { color: colors.muted, lineHeight: 19 },
  actions: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  providerRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  providerButton: { borderWidth: 1, borderColor: colors.border, borderRadius: 12, paddingHorizontal: 12, paddingVertical: 8 },
  providerButtonActive: { backgroundColor: colors.soft, borderColor: "#b7d9d0" },
  providerText: { color: colors.muted, fontWeight: "700" },
  providerTextActive: { color: colors.primary },
  label: { color: colors.text, fontSize: 13, fontWeight: "700" },
  toggleRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", gap: 10, paddingVertical: 8 },
  toggleText: { color: colors.text, fontWeight: "700" },
  toggleBadge: { color: colors.muted, fontWeight: "800" },
  toggleBadgeOn: { color: colors.primary },
  result: { color: colors.text, lineHeight: 22 },
  helpHead: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", gap: 12 },
  helpToggle: { color: colors.primary, fontWeight: "800" },
  helpBody: { gap: 8 },
  helpTitle: { color: colors.text, fontWeight: "800", marginTop: 4 },
  helpLine: { color: colors.muted, lineHeight: 20 },
  tokenHelp: { borderWidth: 1, borderColor: colors.border, borderRadius: 12, padding: 12, gap: 8, backgroundColor: "#fffaf2" }
});
