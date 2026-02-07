import { Plugin, Notice, requestUrl, MarkdownView, WorkspaceLeaf } from "obsidian";
import LibreTranslateSettingTab from "./settings";
import { LibreTranslateView, VIEW_TYPE_LIBRETRANSLATE } from "./view";

interface TranslatorConfig {
    sourceLang: string;
    targetLang: string;
}

export default class LibreTranslatePlugin extends Plugin {
    config: TranslatorConfig = {
        sourceLang: "auto",
        targetLang: "en",
    };

    async onload() {
        console.log("Translator Plugin loaded");
        await this.loadSettings();
        this.addSettingTab(new LibreTranslateSettingTab(this.app, this));

        this.registerView(
            VIEW_TYPE_LIBRETRANSLATE,
            (leaf) => new LibreTranslateView(leaf)
        );

        // Register command: Translate current note
        this.addCommand({
            id: "translate-current-note",
            name: "Translate current note",
            checkCallback: (checking) => {
                if (checking) return this.isEditorActive();
                console.log("Command: Translate current note triggered");
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
        console.log("translateContent started, length:", text.length);
        try {
            // 1. Open view immediately with loading state
            const view = await this.openTranslationView(""); 
            if (!view) return;

            // 2. Start streaming translation (with masking)
            await this.streamTranslation(text, view);

            new Notice("Translation complete!");
        } catch (error) {
            console.error("Translation error:", error);
            new Notice(`Translation failed: ${error.message}`);
        }
    }

    async streamTranslation(text: string, view: LibreTranslateView) {
        const CHUNK_SIZE = 5000;
        
        // 1. Mask code blocks before splitting
        const masker = new MarkdownMasker();
        const maskedText = masker.mask(text);

        const paragraphs = maskedText.split("\n\n");
        const chunks: string[] = [];
        let currentChunk = "";

        // Group paragraphs
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
        
        // Show initial loading state
        view.showLoading(true);
        let accumulatedTranslation = "";

        try {
            for (let i = 0; i < chunks.length; i++) {
                console.log(`Processing chunk ${i + 1}/${chunks.length}`);
                
                // Translate chunk
                let chunkResult = await this.callGoogleTranslate(chunks[i]);
                
                // Unmask the chunk immediately for display
                // Note: This might be risky if a mask placeholder is split across chunks, 
                // but since we mask *before* splitting by paragraph, and placeholders are small tokens,
                // and we split by \n\n, it is unlikely a placeholder __CODE_BLOCK_X__ gets split 
                // unless a paragraph is huge and forced split (which we don't do, we just append).
                // Actually we assume placeholders stay intact.
                
                chunkResult = masker.unmask(chunkResult);

                // Update total content
                if (accumulatedTranslation.length > 0) accumulatedTranslation += "\n\n";
                accumulatedTranslation += chunkResult;

                // Update view immediately
                view.update(accumulatedTranslation);
            }
        } finally {
            view.showLoading(false);
        }

        console.log("All chunks translated and streamed");
    }



    async openTranslationView(content: string): Promise<LibreTranslateView | null> {
        const { workspace } = this.app;
        
        let leaf: WorkspaceLeaf | null = null;
        const leaves = workspace.getLeavesOfType(VIEW_TYPE_LIBRETRANSLATE);
        
        if (leaves.length > 0) {
            leaf = leaves[0];
        } else {
            leaf = workspace.getLeaf('split', 'vertical');
            await leaf.setViewState({
                type: VIEW_TYPE_LIBRETRANSLATE,
                active: true,
            });
        }
        
        if (leaf && leaf.view instanceof LibreTranslateView) {
            workspace.revealLeaf(leaf);
            leaf.view.update(content);
            this.syncScroll(leaf.view);
            return leaf.view;
        }
        return null;
    }

    syncScroll(targetView: LibreTranslateView) {
        const activeView = this.app.workspace.getActiveViewOfType(MarkdownView);
        if (!activeView) return;

        // Simple percentage-based scroll sync
        // Note: This relies on the internal 'scroller' element structure which might vary
        // But for standard MarkdownView it's usually reliable to hook into the editor's scroll
        
        // @ts-ignore - access internal cm editor
        const editorScrollDom = activeView.contentEl.querySelector(".cm-scroller") as HTMLElement; 
        const targetScrollDom = targetView.containerEl.children[1] as HTMLElement;

        if (editorScrollDom && targetScrollDom) {
            const handleScroll = () => {
                const percentage = editorScrollDom.scrollTop / (editorScrollDom.scrollHeight - editorScrollDom.clientHeight);
                if (isFinite(percentage)) {
                   targetScrollDom.scrollTop = percentage * (targetScrollDom.scrollHeight - targetScrollDom.clientHeight);
                }
            };

            // Remove old listener if exists (tricky without reference, but verify logic handles repeated calls)
            // Ideally we store the reference or start fresh. 
            // For now, we just add it. In a robust app, we should manage event cleanup.
            editorScrollDom.addEventListener("scroll", handleScroll);
            
            // Cleanup on view close? 
            // targetView.registerDomEvent(editorScrollDom, "scroll", handleScroll); // This is better if supported
        }
    }

    async callGoogleTranslate(text: string): Promise<string> {
        console.log("Calling Google API with text length:", text.length);
        const encodedText = encodeURIComponent(text);
        const source = this.config.sourceLang;
        const target = this.config.targetLang;
        
        // Google Translate Unofficial API
        // https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=ko&dt=t&q=text
        const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${source}&tl=${target}&dt=t&q=${encodedText}`;

        try {
            const response = await requestUrl({
                url: url,
                method: "GET", // Google uses GET
                headers: {
                    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
                }
            });

            if (response.status !== 200) {
                 throw new Error(`Google API returned status ${response.status}`);
            }

            const data = response.json;
            // Google returns: [[["Translated text","Original text",...],...],...]
            if (Array.isArray(data) && Array.isArray(data[0])) {
                return data[0].map((item: any) => item[0]).join("");
            }
            
            throw new Error("Invalid response format from Google");

        } catch (error) {
           console.error("Google Translate error:", error);
           throw error;
        }
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
        console.log("Translator Plugin unloaded");
    }
}

class MarkdownMasker {
    private replacements: string[] = [];

    mask(text: string): string {
        this.replacements = [];
        
        // 1. Mask code blocks (```...```)
        text = text.replace(/```[\s\S]*?```/g, (match) => {
            const placeholder = `__CODE_BLOCK_${this.replacements.length}__`;
            this.replacements.push(match);
            return placeholder;
        });

        // 2. Mask inline code (`...`)
        text = text.replace(/`[^`]+`/g, (match) => {
            const placeholder = `__INLINE_CODE_${this.replacements.length}__`;
            this.replacements.push(match);
            return placeholder;
        });
        
        // 3. Mask Obsidian wikilinks [[...]] ??
        // Maybe later. Google Translate usually handles [[ ]] okay-ish, but safer to mask if requested.
        // For now, focusing on code compliance.

        return text;
    }

    unmask(text: string): string {
        // We need to support unmasking in any order because translation might move things slightly (though unlikely for these tokens)
        // But mainly we just look for our tokens
        return text.replace(/__(CODE_BLOCK|INLINE_CODE)_(\d+)__/g, (match, type, index) => {
            const idx = parseInt(index);
            if (idx >= 0 && idx < this.replacements.length) {
                return this.replacements[idx];
            }
            return match;
        });
    }
}
