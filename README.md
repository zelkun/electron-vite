# electron-vite

An Electron application with Vue

## Project Tree

```
electron-vite/
├─ .editorconfig
├─ .prettierignore
├─ .prettierrc.yaml
├─ build/
│  ├─ entitlements.mac.plist
│  ├─ icon.icns
│  ├─ icon.ico
│  └─ icon.png
├─ dev-app-update.yml
├─ electron-builder.yml
├─ electron.vite.config.mjs
├─ eslint.config.mjs
├─ package.json
├─ README.md
├─ resources/
│  └─ icon.png
├─ src
│  ├─ main/
│  │  ├─ index.js
│  │  ├─ menu.js
│  │  ├─ tray.js
│  │  └─ updater.js
│  ├─ preload/
│  │  └─ index.js
│  └─ renderer/
│     ├─ index.html
│     └─ src/
│        ├─ App.vue
│        ├─ assets/
│        ├─ components/
│        └─ main.js
└─ tools
   ├─ nsis-3.0.4.1.7z
   ├─ nsis-resources-3.4.1.7z
   └─ winCodeSign-2.6.0.7z
```

## Recommended IDE Setup

- [VSCode](https://code.visualstudio.com/) + [ESLint](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint) + [Prettier](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode) + [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar)

## Project Setup

### Install

```bash
$ npm install
```

### Development

```bash
$ npm run dev
```

### Build

```bash
# For windows
$ npm run build:win

# For macOS
$ npm run build:mac

# For Linux
$ npm run build:linux
```

# REF

- https://tinydew4.github.io/electron-ko/
- https://github.com/alex8088/quick-start/tree/master/packages/create-electron

# TLS Error

```BAT
npm config set strict-ssl false -g
set NODE_TLS_REJECT_UNAUTHORIZED=0
set npm_config_strict_ssl=false
yarn config set strict-ssl false
git config --global http.sslVerify false
```

# ELECRON BUILD

빌드경로, 빌드시 필요프로그램 위치

```TEXT
"builder-install-path": "%USERPROFILE%/AppData/Local/Programs/electron-auto",
"electron-v31.3.1-win32-x64-path": "%USERPROFILE%/AppData/Local/electron/Cache/electron-v31.3.1-win32-x64.zip",

"electron-v33.0.1-win32-x64.zip": "https://github.com/electron/electron/releases/download/v33.0.1/electron-v33.0.1-win32-x64.zip",
"electron-v33.2.0-win32-x64.zip": "https://github.com/electron/electron/releases/download/v33.0.1/electron-v33.2.0-win32-x64.zip",

"nsis-path": "%USERPROFILE%/AppData/Local/electron-builder/Cache/nsis/nsis-3.0.4.1.7z",
"nsis-3.0.4.1.7z": "https://github.com/electron-userland/electron-builder-binaries/releases/download/nsis-3.0.4.1/nsis-3.0.4.1.7z",

"nsis-resources-path": "%USERPROFILE%/AppData/Local/electron-builder/Cache/nsis/nsis-resources-3.4.1.7z",
"nsis-resources-3.4.1.7z": "https://github.com/electron-userland/electron-builder-binaries/releases/download/nsis-resources-3.4.1/nsis-resources-3.4.1.7z",
"winCodeSign": "%USERPROFILE%/AppData/Local/electron-builder/Cache/winCodeSign/winCodeSign-2.6.0.7z"
```

# JAVASCRIPT

```
querySelector/querySelectorAll 메서드 사용

기본 선택자
javascript
document.querySelector("*")         // 모든 요소
document.querySelector(".class")    // 클래스
document.querySelector("#id")       // ID
document.querySelector("div")       // 태그

복합 선택자
javascript
document.querySelector("div.user-panel.main")    // 다중 클래스
document.querySelector("div input[name='login']") // 자식 요소
document.querySelector("div:not(.main)")         // 부정 선택자

jQuery 선택자
기본 필터 선택자2
:even - 짝수 행 선택
:odd - 홀수 행 선택
:first - 첫 번째 요소
:last - 마지막 요소
:eq() - 특정 인덱스 요소
:gt() - 큰 인덱스 요소들
:lt() - 작은 인덱스 요소들
:not() - 제외 선택자

폼 필터 선택자4
:text - text 입력 요소
:password - password 입력 요소
:checkbox - checkbox 요소
:radio - radio 요소
:submit - submit 버튼
:button - 버튼 요소
:file - 파일 입력 요소
:disabled - 비활성화된 요소
:enabled - 활성화된 요소
:checked - 체크된 요소
:selected - 선택된 요소
:focus - 포커스된 요소
```

