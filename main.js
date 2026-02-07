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
  default: () => SplitTranslatorPlugin
});
module.exports = __toCommonJS(main_exports);
var import_obsidian3 = require("obsidian");

// settings.ts
var import_obsidian = require("obsidian");
var TranslatorSettingTab = class extends import_obsidian.PluginSettingTab {
  constructor(app, plugin) {
    super(app, plugin);
    this.plugin = plugin;
  }
  display() {
    const { containerEl } = this;
    containerEl.empty();
    containerEl.createEl("h2", { text: "Translator Settings" });
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

// view.ts
var import_obsidian2 = require("obsidian");
var VIEW_TYPE_TRANSLATOR = "translator-view";
var TranslationView = class extends import_obsidian2.ItemView {
  constructor(leaf) {
    super(leaf);
    this.content = "";
    this.loadingEl = null;
    this.contentElWrapper = null;
  }
  getViewType() {
    return VIEW_TYPE_TRANSLATOR;
  }
  getDisplayText() {
    return "Translation";
  }
  getIcon() {
    return "languages";
  }
  async onOpen() {
    const container = this.contentEl;
    container.empty();
    container.createEl("h4", { text: "Translation" });
    this.contentElWrapper = container.createDiv({ cls: "translator-content" });
  }
  async onClose() {
  }
  showLoading(isLoading) {
    const container = this.contentEl;
    if (isLoading) {
      if (!this.loadingEl) {
        this.loadingEl = container.createDiv({ cls: "translator-loading" });
        this.loadingEl.setText("Translating... ");
        const spinner = this.loadingEl.createDiv({ cls: "spinner" });
        spinner.style.display = "inline-block";
        spinner.style.width = "10px";
        spinner.style.height = "10px";
        spinner.style.border = "2px solid currentColor";
        spinner.style.borderRightColor = "transparent";
        spinner.style.borderRadius = "50%";
        spinner.style.animation = "spin 1s linear infinite";
        spinner.style.marginLeft = "10px";
        this.loadingEl.style.display = "flex";
        this.loadingEl.style.alignItems = "center";
        this.loadingEl.style.padding = "10px";
        this.loadingEl.style.fontStyle = "italic";
        this.loadingEl.style.color = "var(--text-muted)";
        if (!document.getElementById("translator-spinner-style")) {
          const style = document.createElement("style");
          style.id = "translator-spinner-style";
          style.innerHTML = `
                        @keyframes spin {
                            from { transform: rotate(0deg); }
                            to { transform: rotate(360deg); }
                        }
                    `;
          document.head.appendChild(style);
        }
      }
    } else {
      if (this.loadingEl) {
        this.loadingEl.detach();
        this.loadingEl = null;
      }
    }
  }
  async update(content) {
    this.content = content;
    if (!this.contentElWrapper) {
      const container = this.contentEl;
      this.contentElWrapper = container.createDiv({ cls: "translator-content" });
    }
    this.contentElWrapper.empty();
    await import_obsidian2.MarkdownRenderer.render(
      this.app,
      content,
      this.contentElWrapper,
      "/",
      this
    );
  }
};

// main.ts
var SplitTranslatorPlugin = class extends import_obsidian3.Plugin {
  constructor() {
    super(...arguments);
    this.config = {
      sourceLang: "auto",
      targetLang: "en"
    };
  }
  async onload() {
    console.log("Translator Plugin loaded");
    await this.loadSettings();
    this.addSettingTab(new TranslatorSettingTab(this.app, this));
    this.registerView(
      VIEW_TYPE_TRANSLATOR,
      (leaf) => new TranslationView(leaf)
    );
    this.addCommand({
      id: "translate-current-note",
      name: "Translate current note",
      checkCallback: (checking) => {
        if (checking) return this.isEditorActive();
        console.log("Command: Translate current note triggered");
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
    this.app.workspace.onLayoutReady(() => {
      this.app.workspace.iterateAllLeaves((leaf) => {
        if (leaf.view instanceof import_obsidian3.MarkdownView) {
          this.addHeaderButton(leaf.view);
        }
      });
    });
    this.registerEvent(
      this.app.workspace.on("active-leaf-change", (leaf) => {
        if (leaf && leaf.view instanceof import_obsidian3.MarkdownView) {
          this.addHeaderButton(leaf.view);
        }
      })
    );
  }
  addHeaderButton(view) {
    if (view.containerEl.querySelector(".translator-header-button")) return;
    const button = view.addAction("languages", "Translate current note", () => {
      this.translateCurrentNote();
    });
    button.addClass("translator-header-button");
  }
  async translateCurrentNote() {
    const activeView = this.app.workspace.getActiveViewOfType(import_obsidian3.MarkdownView);
    if (!activeView) {
      new import_obsidian3.Notice("No active markdown view");
      return;
    }
    const content = activeView.editor.getValue();
    if (!content) {
      new import_obsidian3.Notice("Note is empty");
      return;
    }
    await this.translateContent(content);
  }
  async translateSelection() {
    const activeView = this.app.workspace.getActiveViewOfType(import_obsidian3.MarkdownView);
    if (!activeView) return;
    const selection = activeView.editor.getSelection();
    if (!selection) {
      new import_obsidian3.Notice("No text selected");
      return;
    }
    await this.translateContent(selection);
  }
  async translateContent(text) {
    console.log("translateContent started, length:", text.length);
    try {
      const view = await this.openTranslationView("");
      if (!view) return;
      await this.streamTranslation(text, view);
      new import_obsidian3.Notice("Translation complete!");
    } catch (error) {
      console.error("Translation error:", error);
      new import_obsidian3.Notice(`Translation failed: ${error.message}`);
    }
  }
  async streamTranslation(text, view) {
    const CHUNK_SIZE = 5e3;
    const masker = new MarkdownMasker();
    const maskedText = masker.mask(text);
    const paragraphs = maskedText.split("\n\n");
    const chunks = [];
    let currentChunk = "";
    for (const paragraph of paragraphs) {
      if (currentChunk.length + paragraph.length > CHUNK_SIZE && currentChunk.length > 0) {
        chunks.push(currentChunk);
        currentChunk = "";
      }
      if (currentChunk.length > 0) {
        currentChunk += "\n\n";
      }
      currentChunk += paragraph;
    }
    if (currentChunk.length > 0) {
      chunks.push(currentChunk);
    }
    console.log(`Starting streaming translation of ${chunks.length} chunks`);
    view.showLoading(true);
    let accumulatedTranslation = "";
    try {
      for (let i = 0; i < chunks.length; i++) {
        console.log(`Processing chunk ${i + 1}/${chunks.length}`);
        let chunkResult = await this.callGoogleTranslate(chunks[i]);
        chunkResult = masker.unmask(chunkResult);
        if (accumulatedTranslation.length > 0) accumulatedTranslation += "\n\n";
        accumulatedTranslation += chunkResult;
        view.update(accumulatedTranslation);
      }
    } finally {
      view.showLoading(false);
    }
    console.log("All chunks translated and streamed");
  }
  async openTranslationView(content) {
    const { workspace } = this.app;
    let leaf = null;
    const leaves = workspace.getLeavesOfType(VIEW_TYPE_TRANSLATOR);
    if (leaves.length > 0) {
      leaf = leaves[0];
    } else {
      leaf = workspace.getLeaf("split", "vertical");
      await leaf.setViewState({
        type: VIEW_TYPE_TRANSLATOR,
        active: true
      });
    }
    if (leaf && leaf.view instanceof TranslationView) {
      workspace.revealLeaf(leaf);
      leaf.view.update(content);
      this.syncScroll(leaf.view);
      return leaf.view;
    }
    return null;
  }
  syncScroll(targetView) {
    const activeView = this.app.workspace.getActiveViewOfType(import_obsidian3.MarkdownView);
    if (!activeView) return;
    const editorScrollDom = activeView.contentEl.querySelector(".cm-scroller");
    const targetScrollDom = targetView.contentEl;
    if (editorScrollDom && targetScrollDom) {
      const handleScroll = () => {
        const percentage = editorScrollDom.scrollTop / (editorScrollDom.scrollHeight - editorScrollDom.clientHeight);
        if (isFinite(percentage)) {
          targetScrollDom.scrollTop = percentage * (targetScrollDom.scrollHeight - targetScrollDom.clientHeight);
        }
      };
      editorScrollDom.addEventListener("scroll", handleScroll);
    }
  }
  async callGoogleTranslate(text) {
    console.log("Calling Google API with text length:", text.length);
    const encodedText = encodeURIComponent(text);
    const source = this.config.sourceLang;
    const target = this.config.targetLang;
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${source}&tl=${target}&dt=t&q=${encodedText}`;
    try {
      const response = await (0, import_obsidian3.requestUrl)({
        url,
        method: "GET",
        // Google uses GET
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
        }
      });
      if (response.status !== 200) {
        throw new Error(`Google API returned status ${response.status}`);
      }
      const data = response.json;
      if (Array.isArray(data) && Array.isArray(data[0])) {
        return data[0].map((item) => item[0]).join("");
      }
      throw new Error("Invalid response format from Google");
    } catch (error) {
      console.error("Google Translate error:", error);
      throw error;
    }
  }
  isEditorActive() {
    const activeView = this.app.workspace.getActiveViewOfType(import_obsidian3.MarkdownView);
    return !!activeView;
  }
  hasSelection() {
    const activeView = this.app.workspace.getActiveViewOfType(import_obsidian3.MarkdownView);
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
    console.log("Translator Plugin unloaded");
  }
};
var MarkdownMasker = class {
  constructor() {
    this.replacements = [];
  }
  mask(text) {
    this.replacements = [];
    text = text.replace(/```[\s\S]*?```/g, (match) => {
      const placeholder = `__CODE_BLOCK_${this.replacements.length}__`;
      this.replacements.push(match);
      return placeholder;
    });
    text = text.replace(/`[^`]+`/g, (match) => {
      const placeholder = `__INLINE_CODE_${this.replacements.length}__`;
      this.replacements.push(match);
      return placeholder;
    });
    return text;
  }
  unmask(text) {
    return text.replace(/__(CODE_BLOCK|INLINE_CODE)_(\d+)__/g, (match, type, index) => {
      const idx = parseInt(index);
      if (idx >= 0 && idx < this.replacements.length) {
        return this.replacements[idx];
      }
      return match;
    });
  }
};
