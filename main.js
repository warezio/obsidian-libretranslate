var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// main.ts
var main_exports = {};
__export(main_exports, {
  default: () => LibreTranslatePlugin
});
module.exports = __toCommonJS(main_exports);
var import_obsidian2 = require("obsidian");

// settings.ts
var import_obsidian = require("obsidian");
var LibreTranslateSettingTab = class extends import_obsidian.PluginSettingTab {
  constructor(app, plugin) {
    super(app, plugin);
    this.plugin = plugin;
  }
  display() {
    const { containerEl } = this;
    containerEl.empty();
    containerEl.createEl("h2", { text: "LibreTranslate Settings" });
    new import_obsidian.Setting(containerEl).setName("API URL").setDesc("Your LibreTranslate server URL").addText(
      (text) => text.setValue(this.plugin.config.apiUrl).setPlaceholder("https://libretranslate.com").onChange(async (value) => {
        this.plugin.config.apiUrl = value;
        await this.plugin.saveSettings();
      })
    );
    new import_obsidian.Setting(containerEl).setName("API Key").setDesc("Optional: Leave empty for public server").addText(
      (text) => text.setValue(this.plugin.config.apiKey || "").setPlaceholder("Optional").onChange(async (value) => {
        this.plugin.config.apiKey = value || void 0;
        await this.plugin.saveSettings();
      })
    );
    new import_obsidian.Setting(containerEl).setName("Source Language").setDesc("Language to translate from").addDropdown(
      (dropdown) => dropdown.addOptions({
        auto: "Auto-detect",
        en: "English",
        ko: "Korean",
        ja: "Japanese",
        zh: "Chinese"
      }).setValue(this.plugin.config.sourceLang || "auto").onChange(async (value) => {
        this.plugin.config.sourceLang = value;
        await this.plugin.saveSettings();
      })
    );
    new import_obsidian.Setting(containerEl).setName("Target Language").setDesc("Language to translate to").addDropdown(
      (dropdown) => dropdown.addOptions({
        en: "English",
        ko: "Korean",
        ja: "Japanese",
        zh: "Chinese",
        es: "Spanish",
        fr: "French",
        de: "German"
      }).setValue(this.plugin.config.targetLang || "en").onChange(async (value) => {
        this.plugin.config.targetLang = value;
        await this.plugin.saveSettings();
      })
    );
  }
};

// main.ts
var LibreTranslatePlugin = class extends import_obsidian2.Plugin {
  constructor() {
    super(...arguments);
    this.config = {
      apiUrl: "https://libretranslate.com",
      apiKey: void 0,
      sourceLang: "auto",
      targetLang: "en"
    };
  }
  async onload() {
    console.log("LibreTranslate Plugin loaded");
    await this.loadSettings();
    this.addSettingTab(new LibreTranslateSettingTab(this.app, this));
    this.addCommand({
      id: "translate-current-note",
      name: "Translate current note",
      checkCallback: (checking) => {
        if (checking) return this.isEditorActive();
        this.translateCurrentNote();
        return true;
      }
    });
    this.addCommand({
      id: "translate-selection",
      name: "Translate selection",
      checkCallback: (checking) => {
        if (checking)
          return this.isEditorActive() && this.hasSelection();
        this.translateSelection();
        return true;
      }
    });
    this.addRibbonIcon("languages", "Translate current note", () => {
      this.translateCurrentNote();
    });
  }
  async translateCurrentNote() {
    const activeView = this.app.workspace.getActiveViewOfType(import_obsidian2.MarkdownView);
    if (!activeView) {
      new import_obsidian2.Notice("No active markdown view");
      return;
    }
    const content = activeView.editor.getValue();
    if (!content) {
      new import_obsidian2.Notice("Note is empty");
      return;
    }
    await this.translateContent(content);
  }
  async translateSelection() {
    const activeView = this.app.workspace.getActiveViewOfType(import_obsidian2.MarkdownView);
    if (!activeView) return;
    const selection = activeView.editor.getSelection();
    if (!selection) {
      new import_obsidian2.Notice("No text selected");
      return;
    }
    await this.translateContent(selection);
  }
  async translateContent(text) {
    try {
      new import_obsidian2.Notice("Translating...");
      const translated = await this.callLibreTranslate(text);
      const activeView = this.app.workspace.getActiveViewOfType(import_obsidian2.MarkdownView);
      if (activeView) {
        activeView.editor.replaceSelection(
          `

[Translated]
${translated}

`
        );
      }
      new import_obsidian2.Notice("Translation complete!");
    } catch (error) {
      console.error("Translation error:", error);
      new import_obsidian2.Notice(`Translation failed: ${error.message}`);
    }
  }
  async callLibreTranslate(text) {
    const response = await (0, import_obsidian2.requestUrl)({
      url: `${this.config.apiUrl}/translate`,
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...this.config.apiKey ? { Authorization: `Bearer ${this.config.apiKey}` } : {}
      },
      body: JSON.stringify({
        q: text,
        source: this.config.sourceLang,
        target: this.config.targetLang,
        format: "text"
      })
    });
    if (!response.json || !response.json.translatedText) {
      throw new Error("Invalid response from LibreTranslate");
    }
    return response.json.translatedText;
  }
  isEditorActive() {
    const activeView = this.app.workspace.getActiveViewOfType(import_obsidian2.MarkdownView);
    return !!activeView;
  }
  hasSelection() {
    const activeView = this.app.workspace.getActiveViewOfType(import_obsidian2.MarkdownView);
    return !!activeView && !!activeView.editor.getSelection();
  }
  async loadSettings() {
    const data = await this.loadData();
    if (data) {
      this.config = Object.assign(this.config, data);
    }
  }
  async saveSettings() {
    await this.saveData(this.config);
  }
  onunload() {
    console.log("LibreTranslate Plugin unloaded");
  }
};
