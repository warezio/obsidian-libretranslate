# Obsidian LibreTranslate Plugin

옵시디언에서 LibreTranslate API를 사용해 실시간 번역 기능을 제공합니다.

## 기능

- ✅ 현재 노트 전체 번역
- ✅ 선택 텍스트 번역
- ✅ 자체 LibreTranslate 서버 지원
- ✅ 무료 API 사용 (셀프호스팅)

## 설치 방법

### 1. 플러그인 빌드

```bash
# 의존성 설치
npm install obsidian typescript

# 빌드
npm run build
```

### 2. 옵시디언에 복사

빌드된 `main.js`와 `manifest.json`를 옵시디언 플러그인 폴더에 복사:

```
/Users/warezio/Library/Application Support/obsidian/plugins/obsidian-libretranslate/
├── main.js
├── manifest.json
└── styles.css
```

### 3. 옵시디언에서 활성화

`설정 > 커뮤니티 플러그인 > LibreTranslate for Obsidian` 활성화

## 사용법

### 방법 1: 현재 노트 번역
```
Cmd/Ctrl + P → "LibreTranslate: Translate current note"
```

### 방법 2: 선택 텍스트 번역
```
텍스트 선택 → Cmd/Ctrl + P → "LibreTranslate: Translate selection"
```

## 설정

| 설정 | 설명 | 기본값 |
|------|--------|--------|
| API URL | LibreTranslate 서버 주소 | https://libretranslate.com |
| API Key | 선택적 API 토큰 | 비어있음 (공개 서버) |
| Source Language | 번역할 언어 | auto |
| Target Language | 번역될 언어 | English |

## 셀프호스팅 방법

### 옵션 1: Docker

```bash
docker run -d -p 5000:5000 libretranslate/libretranslate
```

### 옵션 2: 로컬 설치

```bash
pip install libretranslate
libretranslate --load-only argos --port 5000
```

설정에서 API URL을 `http://localhost:5000`로 변경하세요.

## API 응답 예시

```json
{
  "translatedText": "번역된 텍스트",
  "detectedLanguage": {
    "confidence": 0.99,
    "language": "ko"
  }
}
```

## 개발

```bash
# 개발 모드
npm run dev

# 빌드
npm run build
```

## 라이선스

MIT License

## 참고

- [LibreTranslate API Docs](https://libretranslate.com/docs)
- [Obsidian Plugin Docs](https://docs.obsidian.md/Plugins/Getting+started/Build+a+plugin)
