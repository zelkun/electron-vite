# electron-vite

An Electron application with Vue

perplexity.ai 가 만드는 웹브라우져 프로젝트

## AI 지시사항

```
지시사항 학습하고 대답해

명확한 금지사항 지시

다음 사항들은 절대 하지 마세요:
- 사실이 아닌 내용 생성
- 근거 없는 추측
- 질문 회피
- 같은 내용 반복

필수 행동 지시
답변 시 반드시:
- 확실한 사실만 답변
- 모르는 것은 '모른다'고 명시
- 추측인경우 '추측' 이라고 명시
- 질문에 직접 답변
- 새로운 정보만 제시
- 질문에는 항상 최신정보로 확인할것
- 최신정보가 없는경우, 참고자료 명시하고 안내할것

모든 답변은 한국어로 답변해
알겠지?
```

## Project Tree

```
electron-vite
├─ .editorconfig
├─ .prettierignore
├─ .prettierrc.yaml
├─ README.md
├─ build
│  ├─ entitlements.mac.plist
│  ├─ icon.icns
│  ├─ icon.ico
│  └─ icon.png
├─ dev-app-update.yml
├─ electron-builder.yml
├─ electron.vite.config.mjs
├─ eslint.config.mjs
├─ kill_electron.bat
├─ package-lock.json
├─ package.json
├─ resources
│  ├─ icon.ico
│  ├─ icon.png
│  └─ icon.png.org
├─ src
│  ├─ main
│  │  ├─ config.js
│  │  ├─ index.js
│  │  ├─ menu.js
│  │  ├─ tray.js
│  │  └─ updater.js
│  ├─ preload
│  │  ├─ index.js
│  │  └─ webviewPreload.js
│  └─ renderer
│     ├─ index.html
│     └─ src
│        ├─ App.vue
│        ├─ assets
│        │  └─ css
│        │     └─ styles.css
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

- [https://tinydew4.github.io/electron-ko/][2]
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

## Electron

### 문서

1. [공식][doc_en]
2. [한글][doc_ko]

### [ipcMain][ipc_en] [한글][ipc_ko]

#### [Exam][ipc_exam]

##### [Optional_chaining(?.)][Optional_chaining]

```JAVASCRIPT
// MAin Process
ipcMain.handle('my-invokable-ipc', async (event, ...args) => {
	const result = await somePromise(...args)
	return result
})

// Renderer Process
async () => {
	const result = await ipcRenderer.invoke('my-invokable-ipc', arg1, arg2)
	// ...
}

```

```JAVASCRIPT
// main.js
import { ipcMain } from 'electron'

// # IPC 핸들러 샘플
function listener(evt, ...args) {
	console.log(evt) // ipcMainEvent
	console.log(args) // ...args: any[]

	evt.type // 이벤트 타입
	evt.processId // 원격 웹컨텐츠의 프로세스 ID
	evt.frameId // 원격 웹컨텐츠의 프레임
	evt.returnValue // 응답 값
	evt.returnValue = 'pong' // 동기 응답 (any), 비권장
	evt.sender // 원격 웹컨텐츠, WebContents
	evt.senderFrame // 원격 웹컨텐츠의 프레임, WebFrameMain
	evt.ports // 원격 웹컨텐츠의 포트, MessagePortMain[]
	evt.reply('channel', args) // 비동기 응답

	// 원격 웹컨텐츠 정보(공식문서에 없음)
	evt.senderType // 원격 웹컨텐츠의 타입
	evt.senderId // 원격 웹컨텐츠의 식별자
	evt.sourceId // 원격 웹컨텐츠의 식별자
	evt.defaultPrevented // 이벤트가 기본 동작을 막았는지 여부
	evt.preventDefault() // 기본 동작을 막음
	evt.stopPropagation() // 이벤트 전파 중지
	evt.stopImmediatePropagation() // 이벤트 전파 즉시 중지
}

// channel: 이벤트 이름, String
// listener: 이벤트 핸들러, Function
ipcMain.on('channel', listener) // 이벤트 핸들러 등록
ipcMain.off('channel', listener) // 이벤트 리스너 제거
ipcMain.once('channel', listener) // 이벤트 핸들러 제거
// ipcMain.addListener('channel', listener) // ipcMain.on
// ipcMain.removeListener('channel', listener) // ipcMain.off
ipcMain.removeAllListeners() // 모든 이벤트 핸들러 제거 channel(optional)

function handleListener(evt, ...args) {
	console.log(evt) // IpcMainInvokeEvent
	console.log(args) // ...args: any[]

	evt.type // 이벤트 타입
	evt.processId // 원격 웹컨텐츠의 프로세스 ID
	evt.frameId // 원격 웹컨텐츠의 프레임
	evt.sender // 원격 웹컨텐츠, WebContents
	evt.senderFrame // 원격 웹컨텐츠의 프레임, WebFrameMain (Readonly)
}
// channel: 이벤트 이름, String
// listener: 이벤트 핸들러, Function
ipcMain.handle(channel, handleListener)
ipcMain.handleOnce(channel, handleListener)
ipcMain.removeHandler(channel)

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

[doc_git_en]: https://github.com/mdn/content/tree/main/files/en-us/web/javascript
[doc_git_ko]: https://github.com/mdn/translated-content/tree/main/files/ko/web/javascript
[doc_en]: https://www.electronjs.org/docs/latest/
[doc_ko]: https://tinydew4.github.io/electron-ko/docs/
[ipc_en]: https://www.electronjs.org/docs/latest/api/ipc-main/
[ipc_ko]: https://tinydew4.github.io/electron-ko/docs/api/ipc-main/
[ipc_exam]: https://www.electronjs.org/docs/latest/tutorial/ipc
[Optional_chaining]: https://developer.mozilla.org/ko/docs/Web/JavaScript/Reference/Operators/Optional_chaining
