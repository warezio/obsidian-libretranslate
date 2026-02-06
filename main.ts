import { Plugin, Notice, requestUrl, MarkdownView } from "obsidian";
import LibreTranslateSettingTab from "./settings";

interface LibreTranslateConfig {
    apiUrl: string;
    apiKey?: string;
    sourceLang: string;
    targetLang: string;
}

export default class LibreTranslatePlugin extends Plugin {
    config: LibreTranslateConfig = {
        apiUrl: "https://libretranslate.com",
        apiKey: undefined,
        sourceLang: "auto",
        targetLang: "en",
    };

    async onload() {
        console.log("LibreTranslate Plugin loaded");
        await this.loadSettings();
        this.addSettingTab(new LibreTranslateSettingTab(this.app, this));

        // Register command: Translate current note
        this.addCommand({
            id: "translate-current-note",
            name: "Translate current note",
            checkCallback: (checking) => {
                if (checking) return this.isEditorActive();
                this.translateCurrentNote();
                return true;
            },
        });

        // Register command: Translate selection
        this.addCommand({
            id: "translate-selection",
            name: "Translate selection",
            checkCallback: (checking) => {
                if (checking)
                    return this.isEditorActive() && this.hasSelection();
                this.translateSelection();
                return true;
            },
        });

        // Add ribbon icon
        this.addRibbonIcon("languages", "Translate current note", () => {
            this.translateCurrentNote();
        });
    }

    async translateCurrentNote() {
        const activeView = this.app.workspace.getActiveViewOfType(MarkdownView);
        if (!activeView) {
            new Notice("No active markdown view");
            return;
        }

        const content = activeView.editor.getValue();
        if (!content) {
            new Notice("Note is empty");
            return;
        }

        await this.translateContent(content);
    }

    async translateSelection() {
        const activeView = this.app.workspace.getActiveViewOfType(MarkdownView);
        if (!activeView) return;

        const selection = activeView.editor.getSelection();
        if (!selection) {
            new Notice("No text selected");
            return;
        }

        await this.translateContent(selection);
    }

    async translateContent(text: string) {
        try {
            new Notice("Translating...");

            const translated = await this.callLibreTranslate(text);

            // Add translation result after current caret
            const activeView =
                this.app.workspace.getActiveViewOfType(MarkdownView);
            if (activeView) {
                activeView.editor.replaceSelection(
                    `\n\n[Translated]\n${translated}\n\n`,
                );
            }

            new Notice("Translation complete!");
        } catch (error) {
            console.error("Translation error:", error);
            new Notice(`Translation failed: ${error.message}`);
        }
    }

    async callLibreTranslate(text: string): Promise<string> {
        const response = await requestUrl({
            url: `${this.config.apiUrl}/translate`,
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                ...(this.config.apiKey
                    ? { Authorization: `Bearer ${this.config.apiKey}` }
                    : {}),
            },
            body: JSON.stringify({
                q: text,
                source: this.config.sourceLang,
                target: this.config.targetLang,
                format: "text",
            }),
        });

        if (!response.json || !response.json.translatedText) {
            throw new Error("Invalid response from LibreTranslate");
        }

        return response.json.translatedText;
    }

    isEditorActive(): boolean {
        const activeView = this.app.workspace.getActiveViewOfType(MarkdownView);
        return !!activeView;
    }

    hasSelection(): boolean {
        const activeView = this.app.workspace.getActiveViewOfType(MarkdownView);
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
}
