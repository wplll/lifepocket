import { useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { Alert, ScrollView, StyleSheet, Text } from "react-native";
import { Button, Card, FieldInput, Muted, Screen, Title, colors } from "@/components/ui";
import { testInternAI } from "@/services/internAI";
import { clearApiToken, defaultSettings, loadSettings, maskToken, saveSettings } from "@/storage/settingsStorage";
import { InternAISettings } from "@/types/life";

export default function SettingsScreen() {
  const [settings, setSettings] = useState<InternAISettings>(defaultSettings);
  const [savedMask, setSavedMask] = useState("");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);

  useFocusEffect(useCallback(() => {
    loadSettings().then((loaded) => {
      setSettings({ ...loaded, apiToken: "" });
      setSavedMask(maskToken(loaded.apiToken));
    });
  }, []));

  async function save() {
    await saveSettings(settings);
    const loaded = await loadSettings();
    setSavedMask(maskToken(loaded.apiToken));
    setSettings({ ...loaded, apiToken: "" });
    Alert.alert("已保存", "Endpoint、Model 和 Token 已保存。");
  }

  async function test() {
    setLoading(true);
    try {
      const loaded = await loadSettings();
      const merged = { ...settings, apiToken: settings.apiToken.trim() || loaded.apiToken };
      const text = await testInternAI(merged);
      setResult(text);
      if (settings.apiToken.trim()) {
        await saveSettings(settings);
        setSavedMask(maskToken(settings.apiToken));
        setSettings({ ...settings, apiToken: "" });
      }
    } catch (error) {
      Alert.alert("测试失败", error instanceof Error ? error.message : "未知错误");
    } finally {
      setLoading(false);
    }
  }

  async function clearToken() {
    await clearApiToken();
    setSavedMask("");
    setSettings((current) => ({ ...current, apiToken: "" }));
    Alert.alert("已清除", "本地 API Token 已清除。");
  }

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Card>
          <Title>模型设置</Title>
          <Muted>Token 只保存在本机 SecureStore，不会硬编码在代码里。</Muted>
          <FieldInput label="API Endpoint" value={settings.endpoint} autoCapitalize="none" onChangeText={(endpoint) => setSettings({ ...settings, endpoint })} />
          <FieldInput label="Model" value={settings.model} autoCapitalize="none" onChangeText={(model) => setSettings({ ...settings, model })} />
          <FieldInput label={savedMask ? `API Token（已保存：${savedMask}）` : "API Token"} value={settings.apiToken} secureTextEntry autoCapitalize="none" placeholder={savedMask ? "留空则继续使用已保存 Token" : "请输入 Bearer Token"} onChangeText={(apiToken) => setSettings({ ...settings, apiToken })} />
          <Button label="保存设置" onPress={save} />
          <Button label="测试连接" loading={loading} variant="secondary" onPress={test} />
          <Button label="清除 Token" variant="danger" onPress={clearToken} />
        </Card>
        {result ? (
          <Card>
            <Title>测试结果</Title>
            <Text style={styles.result}>{result}</Text>
          </Card>
        ) : null}
        <Card>
          <Title>隐私说明</Title>
          <Muted>Token 只保存在本机；图片和文本只有在你点击识别时才会发送到当前配置的模型接口。不要把身份证、银行卡、真实密钥等敏感信息提交给不可信接口。</Muted>
        </Card>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  scroll: { gap: 12, paddingBottom: 24 },
  result: { color: colors.text, lineHeight: 22 }
});
