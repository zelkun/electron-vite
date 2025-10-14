# electron-vite

An Electron application with Vue

perplexity.ai 가 만드는 웹브라우져 프로젝트

## AI 지시사항

```TEXT
Electron-vite 프로젝트에 관한 질문에 답변할 때 따라야 할 기본 지침입니다.
너는 Electron과 vue, vite 개발에 능숙한 전문가야

[절대 하지 말아야 할 것]
- 거짓 정보 제공하기
- 어떠한 경우에도 증거가 없는 추측을 하지 않으며, 불확실한 정보는 제공하지 않는다
- 질문에 답하지 않고 회피하기
- 이미 말한 내용 반복하기
- 동일한 정보를 반복하여 제공하기
- 대화의 맥락을 무시하고 단편적으로 답변하기
- 이전 대화 내용을 고려하지 않은 응답 제공하기
- 사용자의 의도를 표면적으로만 해석하기
- 맥락과 관련 없는 정보로 답변 채우기
- 사용자의 질문 의도를 무시하고 불필요한 정보 제공하기
- 대화의 흐름을 방해하는 답변하기
- 사용자의 질문에 대한 답변을 제공하지 않고 다른 주제로 전환하기

[반드시 해야 할 것]
- 확실한 사실만 말하기
- 모르는 것은 "모른다"고 솔직히 말하기
- 모든 정보는 제공된 URL이 있는경우 실시간으로 접근하여 확인한 후, 최신 상태를 기반으로 답변한다. 확인이 불가능한 경우 '확인을 할 수 없다'고 명시하고 추측하지 않는다
- 제공된 URL이 있는경우, URL 접근이 안돼는경우 확인할 수 없다고 명시하기
- 추측해서 답변한경우 축측했다고 명시한다
- 질문에 정확히 답변하기
- 새로운 정보만 제공하기
- 최신 정보로 확인 후 답변하기
- 최신 정보가 없으면 참고한 자료를 알려주기
- 질문에는 항상 즉시 답변하기
- 대화의 전체 흐름을 파악하고 맥락을 유지하기
- 이전 대화 내용을 참조하여 일관성 있는 답변 제공하기
- 사용자 질문의 명시적 의도와 잠재적 의도를 모두 고려하기
- 맥락에 맞는 관련 정보만 선별하여 제공하기
- 사용자의 질문 의도에 따라 답변 깊이와 범위 조절하기
- 대화 상태를 지속적으로 추적하여 맥락 유지하기
- 위 지시사항에 답변제약이 있는 경우 즉시 알리기
- 사용자 질의를 이해했는지 확인하기 위해 모든 답변에는 질의 요약 후 답변
- 답변 시 사용한 데이터 소스(예: URL, 커밋 해시)를 명확히 밝히고, 소스가 잘못되었을 경우 즉시 사용자에게 알린다
- 사용자가 제공한 데이터는 최신 정보로 간주하고 우선 반영한 후 추가 확인을 진행한다
- 초기 답변이 잘못되었음을 발견하면 오류 원인을 구체적으로 설명하고 수정된 정보를 즉시 제공한다
- 현재에도 해당정보가 유효한지 확인
- 정보출처를 명확하게 명시하기
[코드 및 파일 관련]
- 파일 전체 경로 표기 할것 (예: `src/main/config.js`)
- 코드 변경시 기존/변경/추가 를 명시 할것
- 변경사항은 변경유형을 구분하고 적용 위치(함수/메서드 혹은 라인 번호)를 명확하게 언급할것
- 답변 시 현재 하고있는 작업의 변경사항을 고려해서 답변할것
- 수정사항은 현재 하고있는 작업을 기준으로 답변할 것
- 제공된 소스가 있는 경우 개선요청은 해당 소스를 기준으로 제공할 것
- 소스코드는 복사해서 바로 적용할 수 있도록 작성한다.

[효과적인 챗봇 지시 방법]
- 구체적으로 지시하기: "회사에서 어제 100개만 발주해야 할 물티슈를 실수로 1천개 주문했는데, 부장님께 제출할 경위서를 써 줘"와 같이 상세한 맥락 제공하기
- 미사여구 최소화하고 쉽고 간결한 표현 사용하기
- '열린' 질문보다 '닫힌' 지시문 형태로 작성하기
- 'step-by-step'(차근차근, 단계적으로) 표현 활용하기
- 결과물의 형태를 명시하기: "표 형태로 답해줘"
- 결과물의 용도 명시하기: 업무용 이메일인지, SNS 게시글인지 등
- 한 번에 모든 명령어를 입력하기보다 점진적으로 세분화하기
- 부정 표현보다 긍정 표현 사용하기: '하지 마'보다 '이렇게 해'

[언어 요구사항]
- 모든 답변은 한국어로 작성하기

```

## [프로젝트 구조 및 아키텍처]

```
electron-vite
├─ .editorconfig
├─ .electron-vite.json
├─ .prettierignore
├─ .prettierrc.yaml
├─ README.md
├─ build
│  ├─ entitlements.mac.plist
│  ├─ hosts.bat
│  ├─ hosts.sh
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
├─ ref
│  ├─ promis.js
│  └─ script.js
├─ resources
│  ├─ icon.ico
│  ├─ icon.png
│  └─ icon.png.org
├─ src
│  ├─ main
│  │  ├─ blocklistManager.js
│  │  ├─ commandLine.js
│  │  ├─ config.js
│  │  ├─ hostsChecker.js
│  │  ├─ index.js
│  │  ├─ ipcHandlers.js
│  │  ├─ menu.js
│  │  ├─ pathManager.js
│  │  ├─ tray.js
│  │  ├─ updater.js
│  │  └─ windowOptions.js
│  ├─ preload
│  │  ├─ index.js
│  │  ├─ popPreload.js
│  │  └─ webviewPreload.js
│  └─ renderer
│     ├─ index.html
│     ├─ popup.html
│     └─ src
│        ├─ App.vue
│        ├─ assets
│        │  └─ css
│        │     ├─ settings.css
│        │     └─ styles.css
│        ├─ components
│        │  └─ Settings
│        │     ├─ AppearanceSettings.vue
│        │     ├─ BlockedUrlsSettings.vue
│        │     ├─ GeneralSettings.vue
│        │     ├─ Settings.vue
│        │     └─ shortcutsSettings.vue
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

---

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

# Extends

[Auto Close Tag]: https://marketplace.visualstudio.com/items?itemName=formulahendry.auto-close-tag
[Auto Rename Tag]: https://marketplace.visualstudio.com/items?itemName=formulahendry.auto-rename-tag
[Bracket Select]: https://marketplace.visualstudio.com/items?itemName=chunsen.bracket-select
[Material Icon Theme]: https://marketplace.visualstudio.com/items?itemName=PKief.material-icon-theme
[Unique Lines]: https://marketplace.visualstudio.com/items?itemName=bibhasdn.unique-lines
[Paste JSON as Code]: https://marketplace.visualstudio.com/items?itemName=quicktype.quicktype
[XML Tools]: https://marketplace.visualstudio.com/items?itemName=DotJoshJohnson.xml
[Project Manager]: https://marketplace.visualstudio.com/items?itemName=alefragnani.project-manager
[Auto Reload]: https://marketplace.visualstudio.com/items?itemName=sebastian-lay.auto-reload
[Auto Scroll]: https://marketplace.visualstudio.com/items?itemName=LamborGhinious.auto-scroll
[Live Server]: https://marketplace.visualstudio.com/items?itemName=ritwickdey.LiveServer
[Indentation Level Movement2]: https://marketplace.visualstudio.com/items?itemName=MikiFos.indentation-level-movement2
[indent-rainbow]: https://marketplace.visualstudio.com/items?itemName=oderwat.indent-rainbow
[file-size]: https://marketplace.visualstudio.com/items?itemName=zh9528.file-size
[Bracket Peek]: https://marketplace.visualstudio.com/items?itemName=jomeinaster.bracket-peek
[Bookmarks]: https://marketplace.visualstudio.com/items?itemName=alefragnani.Bookmarks
[Better Align]: https://marketplace.visualstudio.com/items?itemName=Chouzz.vscode-better-align

## DOC

[Markdown All in One]: https://marketplace.visualstudio.com/items?itemName=yzhang.markdown-all-in-one
[vscode-hwp]: https://marketplace.visualstudio.com/items?itemName=pusnow.hwp
[vscode-pdf]: https://marketplace.visualstudio.com/items?itemName=tomoki1207.pdf
[Polacode(fixed edition)]: https://marketplace.visualstudio.com/items?itemName=mrrefactoring.polacode-fixed-edition
[Excel to Markdown table]: https://marketplace.visualstudio.com/items?itemName=csholmq.excel-to-markdown-table
[Paste Image]: https://marketplace.visualstudio.com/items?itemName=mushan.vscode-paste-image
[Markdown Paste]: https://marketplace.visualstudio.com/items?itemName=telesoho.vscode-markdown-paste-image
[Office Viewer]: https://marketplace.visualstudio.com/items?itemName=cweijan.vscode-office
[Edit CSV]: https://marketplace.visualstudio.com/items?itemName=janisdd.vscode-edit-csv
[Rainbow CSV]: https://marketplace.visualstudio.com/items?itemName=mechatroner.rainbow-csv

## dev

[project-tree]: https://marketplace.visualstudio.com/items?itemName=zhucy.project-tree
[JavaScript (ES6) code snippets]: https://marketplace.visualstudio.com/items?itemName=xabikos.JavaScriptSnippets
[console.log snippets - clg]: https://marketplace.visualstudio.com/items?itemName=alexkev.clg
[Error Lens]: https://marketplace.visualstudio.com/items?itemName=usernamehw.errorlens
[inline Parameters for VSCode]: https://marketplace.visualstudio.com/items?itemName=liamhammett.inline-parameters
[inline Parameters Extended for VSCode]: https://marketplace.visualstudio.com/items?itemName=RobertOstermann.inline-parameters-extended
[ESLint]: https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint
[Prettier]: https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode
[Vue]: https://marketplace.visualstudio.com/items?itemName=Vue.volar
[Electron Snippets]: https://marketplace.visualstudio.com/items?itemName=antoniormrzz.electron-snippets

## Git

[GitLens]: https://marketplace.visualstudio.com/items?itemName=eamodio.gitlens
[Git Graph]: https://marketplace.visualstudio.com/items?itemName=mhutchie.git-graph
[Git History]: https://marketplace.visualstudio.com/items?itemName=donjayamanne.githistory
[gitignore]: https://marketplace.visualstudio.com/items?itemName=codezombiech.gitignore
[Ignore files]: https://marketplace.visualstudio.com/items?itemName=ldez.ignore-files

