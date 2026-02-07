import { ItemView, WorkspaceLeaf, MarkdownRenderer } from "obsidian";

export const VIEW_TYPE_TRANSLATOR = "translator-view";

export class TranslationView extends ItemView {
    content: string = "";
    loadingEl: HTMLElement | null = null;
    contentElWrapper: HTMLElement | null = null;

    constructor(leaf: WorkspaceLeaf) {
        super(leaf);
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
        
        // Create a dedicated content wrapper
        this.contentElWrapper = container.createDiv({ cls: "translator-content" });
    }

    async onClose() {
        // Nothing to clean up
    }

    showLoading(isLoading: boolean) {
        const container = this.contentEl;
        
        if (isLoading) {
            if (!this.loadingEl) {
                this.loadingEl = container.createDiv({ cls: "translator-loading" });
                this.loadingEl.setText("Translating... ");
                
                // Add a simple spinner CSS if not available
                const spinner = this.loadingEl.createDiv({ cls: "spinner" });
                spinner.style.display = "inline-block";
                spinner.style.width = "10px";
                spinner.style.height = "10px";
                spinner.style.border = "2px solid currentColor";
                spinner.style.borderRightColor = "transparent";
                spinner.style.borderRadius = "50%";
                spinner.style.animation = "spin 1s linear infinite";
                spinner.style.marginLeft = "10px";
                
                // Styles for loading container
                this.loadingEl.style.display = "flex";
                this.loadingEl.style.alignItems = "center";
                this.loadingEl.style.padding = "10px";
                this.loadingEl.style.fontStyle = "italic";
                this.loadingEl.style.color = "var(--text-muted)";

                 // Add keyframes for spinner if needed
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

    async update(content: string) {
        this.content = content;
        
        if (!this.contentElWrapper) {
             const container = this.contentEl;
             this.contentElWrapper = container.createDiv({ cls: "translator-content" });
        }

        this.contentElWrapper.empty();
        
        // Render Markdown
        await MarkdownRenderer.render(
            this.app,
            content,
            this.contentElWrapper,
            "/",
            this
        );
    }
}
