import { App, PluginSettingTab } from 'obsidian';

export default class LibreTranslateSettingTab extends PluginSettingTab {
  plugin: LibreTranslatePlugin;

  constructor(app: App, plugin: LibreTranslatePlugin) {
    super(app, plugin);
    this.plugin = plugin;
  }

  display(): void {
    const { containerEl } = this;

    containerEl.empty();

    containerEl.createEl('h2', { text: 'LibreTranslate Settings' });

    // API URL 설정
    new Setting(containerEl)
      .setName('API URL')
      .setDesc('Your LibreTranslate server URL')
      .addText(text => text.setValue('https://libretranslate.com'))
      .setPlaceholder('https://libretranslate.com')
      .onChange(async (value) => {
        this.plugin.config.apiUrl = value;
        await this.plugin.saveSettings();
      });

    // API Key 설정 (선택적)
    new Setting(containerEl)
      .setName('API Key')
      .setDesc('Optional: Leave empty for public server')
      .addText(text => text.setPlaceholder('Optional'))
      .onChange(async (value) => {
        this.plugin.config.apiKey = value;
        await this.plugin.saveSettings();
      });

    // 출발 언어
    new Setting(containerEl)
      .setName('Source Language')
      .setDesc('Language to translate from')
      .addDropdown(dropdown => dropdown
        .addOptions([
          { value: 'auto', label: 'Auto-detect' },
          { value: 'en', label: 'English' },
          { value: 'ko', label: 'Korean' },
          { value: 'ja', label: 'Japanese' },
          { value: 'zh', label: 'Chinese' },
        ])
        .setValue(this.plugin.config.sourceLang || 'auto')
        .onChange(async (value) => {
          this.plugin.config.sourceLang = value;
          await this.plugin.saveSettings();
        }));

    // 도착 언어
    new Setting(containerEl)
      .setName('Target Language')
      .setDesc('Language to translate to')
      .addDropdown(dropdown => dropdown
        .addOptions([
          { value: 'en', label: 'English' },
          { value: 'ko', label: 'Korean' },
          { value: 'ja', label: 'Japanese' },
          { value: 'zh', label: 'Chinese' },
          { value: 'es', label: 'Spanish' },
          { value: 'fr', label: 'French' },
          { value: 'de', label: 'German' },
        ])
        .setValue(this.plugin.config.targetLang || 'en')
        .onChange(async (value) => {
          this.plugin.config.targetLang = value;
          await this.plugin.saveSettings();
        }));
  }
}
