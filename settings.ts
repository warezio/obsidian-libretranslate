import { App, PluginSettingTab, Setting } from "obsidian";
import LibreTranslatePlugin from "./main";

export default class LibreTranslateSettingTab extends PluginSettingTab {
    plugin: LibreTranslatePlugin;

    constructor(app: App, plugin: LibreTranslatePlugin) {
        super(app, plugin);
        this.plugin = plugin;
    }

    display(): void {
        const { containerEl } = this;

        containerEl.empty();

        containerEl.createEl("h2", { text: "LibreTranslate Settings" });

        // API URL Setting
        new Setting(containerEl)
            .setName("API URL")
            .setDesc("Your LibreTranslate server URL")
            .addText((text) =>
                text
                    .setValue(this.plugin.config.apiUrl)
                    .setPlaceholder("https://libretranslate.com")
                    .onChange(async (value) => {
                        this.plugin.config.apiUrl = value;
                        await this.plugin.saveSettings();
                    }),
            );

        // API Key Setting (Optional)
        new Setting(containerEl)
            .setName("API Key")
            .setDesc("Optional: Leave empty for public server")
            .addText((text) =>
                text
                    .setValue(this.plugin.config.apiKey || "")
                    .setPlaceholder("Optional")
                    .onChange(async (value) => {
                        this.plugin.config.apiKey = value || undefined;
                        await this.plugin.saveSettings();
                    }),
            );

        // Source Language
        new Setting(containerEl)
            .setName("Source Language")
            .setDesc("Language to translate from")
            .addDropdown((dropdown) =>
                dropdown
                    .addOptions({
                        auto: "Auto-detect",
                        en: "English",
                        ko: "Korean",
                        ja: "Japanese",
                        zh: "Chinese",
                    })
                    .setValue(this.plugin.config.sourceLang || "auto")
                    .onChange(async (value) => {
                        this.plugin.config.sourceLang = value;
                        await this.plugin.saveSettings();
                    }),
            );

        // Target Language
        new Setting(containerEl)
            .setName("Target Language")
            .setDesc("Language to translate to")
            .addDropdown((dropdown) =>
                dropdown
                    .addOptions({
                        en: "English",
                        ko: "Korean",
                        ja: "Japanese",
                        zh: "Chinese",
                        es: "Spanish",
                        fr: "French",
                        de: "German",
                    })
                    .setValue(this.plugin.config.targetLang || "en")
                    .onChange(async (value) => {
                        this.plugin.config.targetLang = value;
                        await this.plugin.saveSettings();
                    }),
            );
    }
}
