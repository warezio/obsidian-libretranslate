import { App, PluginSettingTab, Setting } from "obsidian";
import SplitTranslatorPlugin from "./main";

export default class TranslatorSettingTab extends PluginSettingTab {
    plugin: SplitTranslatorPlugin;

    constructor(app: App, plugin: SplitTranslatorPlugin) {
        super(app, plugin);
        this.plugin = plugin;
    }

    display(): void {
        const { containerEl } = this;

        containerEl.empty();

        containerEl.createEl("h2", { text: "Translator Settings" });

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
