import { Plugin, Notice, requestUrl } from 'obsidian';

interface LibreTranslateConfig {
  apiUrl: string;
  apiKey?: string;
  sourceLang: string;
  targetLang: string;
}

export default class LibreTranslatePlugin extends Plugin {
  config: LibreTranslateConfig;

  async onload() {
    console.log('LibreTranslate Plugin loaded');

    // Command 등록: 현재 노트 번역
    this.addCommand({
      id: 'translate-current-note',
      name: 'Translate current note',
      checkCallback: () => this.isEditorActive(),
      callback: () => this.translateCurrentNote(),
    });

    // Command 등록: 선택 텍스트 번역
    this.addCommand({
      id: 'translate-selection',
      name: 'Translate selection',
      checkCallback: () => this.isEditorActive() && this.hasSelection(),
      callback: () => this.translateSelection(),
    });

    // 리본 아이콘 추가 (선택적)
    this.addRibbonIcon('translate', 'Translate current note');
  }

  async translateCurrentNote() {
    const activeView = this.app.workspace.getActiveViewOfType('markdown');
    if (!activeView) {
      new Notice('No active markdown view');
      return;
    }

    const content = (activeView as any).editor.getValue();
    if (!content) {
      new Notice('Note is empty');
      return;
    }

    await this.translateContent(content);
  }

  async translateSelection() {
    const activeView = this.app.workspace.getActiveViewOfType('markdown');
    if (!activeView) return;

    const selection = (activeView as any).editor.getSelection();
    if (!selection) {
      new Notice('No text selected');
      return;
    }

    await this.translateContent(selection);
  }

  async translateContent(text: string) {
    try {
      new Notice('Translating...');

      const translated = await this.callLibreTranslate(text);

      // 번역 결과를 현재 캐럿 뒤에 추가
      const activeView = this.app.workspace.getActiveViewOfType('markdown');
      if (activeView) {
        (activeView as any).editor.replaceSelection(`\n\n[Translated]\n${translated}\n\n`);
      }

      new Notice('Translation complete!');
    } catch (error) {
      console.error('Translation error:', error);
      new Notice(`Translation failed: ${error.message}`);
    }
  }

  async callLibreTranslate(text: string): Promise<string> {
    const response = await requestUrl({
      url: `${this.config.apiUrl}/translate`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(this.config.apiKey ? { 'Authorization': `Bearer ${this.config.apiKey}` } : {}),
      },
      body: JSON.stringify({
        q: text,
        source: this.config.sourceLang,
        target: this.config.targetLang,
        format: 'text',
      }),
    });

    if (!response.json || !response.json.translatedText) {
      throw new Error('Invalid response from LibreTranslate');
    }

    return response.json.translatedText;
  }

  isEditorActive(): boolean {
    const activeView = this.app.workspace.getActiveViewOfType('markdown');
    return !!activeView;
  }

  hasSelection(): boolean {
    const activeView = this.app.workspace.getActiveViewOfType('markdown');
    return !!activeView && !!(activeView as any).editor.getSelection();
  }

  onunload() {
    console.log('LibreTranslate Plugin unloaded');
  }
}
