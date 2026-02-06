class LibreTranslatePlugin {
    constructor() {
        this.app = null;
        this.config = {
            apiUrl: "https://libretranslate.com",
            apiKey: "",
            sourceLang: "auto",
            targetLang: "en",
        };
    }

    init(app, manifest) {
        this.app = app;
        this.manifest = manifest;

        // Commands
        app.addCommand({
            id: "translate-current-note",
            name: "LibreTranslate: Translate current note",
            callback: () => this.translateCurrentNote(),
        });

        app.addCommand({
            id: "translate-selection",
            name: "LibreTranslate: Translate selection",
            callback: () => this.translateSelection(),
        });

        // Ribbon Icon
        app.addRibbonIcon("translate", "Translate");
    }

    async translateCurrentNote() {
        const activeView = this.app.workspace.getActiveViewOfType("markdown");
        if (!activeView) {
            new obsidian.Notice("No active markdown view");
            return;
        }

        const content = activeView.editor.getValue();
        if (!content) {
            new obsidian.Notice("Note is empty");
            return;
        }

        await this.translateContent(content);
    }

    async translateSelection() {
        const activeView = this.app.workspace.getActiveViewOfType("markdown");
        if (!activeView) return;

        const selection = activeView.editor.getSelection();
        if (!selection) {
            new obsidian.Notice("No text selected");
            return;
        }

        await this.translateContent(selection);
    }

    async translateContent(text) {
        try {
            new obsidian.Notice("Translating...");

            const translated = await this.callLibreTranslate(text);

            const activeView =
                this.app.workspace.getActiveViewOfType("markdown");
            if (activeView) {
                activeView.editor.replaceSelection(
                    `\n\n[Translated]\n${translated}\n\n`,
                );
            }

            new obsidian.Notice("Translation complete!");
        } catch (error) {
            console.error("Translation error:", error);
            new obsidian.Notice(`Translation failed: ${error.message}`);
        }
    }

    async callLibreTranslate(text) {
        const response = await obsidian.requestUrl({
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
}

// Plugin Main
const plugin = new LibreTranslatePlugin();
window.addEventListener("DOMContentLoaded", () => {
    plugin.init(obsidian.app, obsidian.manifest);
});
