import { electronApp, optimizer, is } from '@electron-toolkit/utils';
import { join } from 'path';
import icon from '../../resources/icon.png?asset';

const preloadPath = join(__dirname, '../preload/index.js');
const webviewPreloadPath = join(__dirname, '../preload/webviewPreload.js');
const popPreloadPath = join(__dirname, '../preload/popPreload.js');

export const preloadPaths = {
	main: preloadPath,
	webview: webviewPreloadPath,
	pop: popPreloadPath,
};

const defualtOpt = {
	kiosk: false, // 키오스크 모드 사용 안함
	fullscreen: false, // 전체 화면 모드 사용 안함
	resizable: true, // 크기 조절 가능
	center: true, // 화면 중앙에 위치
	show: false, // 처음에 숨김
	movable: true, // 이동 가능
	alwaysOnTop: false, // 항상 위에 표시 안함
	minimizable: true, // 최소화 버튼 사용
	maximizable: true, // 최대화 버튼 사용
	closable: true, // 닫기 버튼 사용
	focusable: true, // 포커스 가능
	visibleOnAllWorkspaces: false, // 모든 작업 공간에 표시 안함
	autoHideMenuBar: true, // 메뉴 바 자동 숨김
	acceptFirstMouse: true, // 첫 번째 마우스 클릭 수락
	backgroundColor: 'white', // 배경색 흰색
	disableAutoHideCursor: false, // 커서 자동 숨김 사용 안함
	transparent: false, // 투명 배경 사용 안함
	frame: true, // 기본 프레임 사용
	webPreferences: {
		webviewTag: true, // 웹뷰 태그 활성화
		nodeIntegration: false, // 노드 통합 활성화
		contextIsolation: true, // contextBridge 사용을 위해 true로 설정
		nodeIntegrationInWorker: false, // 워커에서 노드 통합 사용 안함
		enableRemoteModule: false, // remote 모듈 사용 안함
		nodeIntegrationInSubFrames: false, // 서브프레임에서 노드 통합 사용 안함
		sandbox: false, // 웹뷰에서 sandbox 사용 안함
		javascript: true, // 자바스크립트 사용
		webSecurity: false, // 웹 보안 사용 안함
		spellcheck: false, // 맞춤법 검사 사용 안함
		textAreasAreResizable: true, // 텍스트 영역 크기 조절 가능
		plugins: true, // 플러그인 사용
		allowRunningInsecureContent: false, // 안전하지 않은 콘텐츠 실행 허용 안함
		allowDisplayingInsecureContent: false, // 안전하지 않은 콘텐츠 표시 허용 안함
	},
};

export const BrowserWinOpt = {
	width: 1200,
	height: 800,
	minWidth: 800,
	minHeight: 600,
	titleBarStyle: is.dev ? 'hiddenInset' : 'hidden',
	// ...(process.platform === 'linux' ? { icon } : {}),
	// icon: join(__dirname, '../../resources/icon.png?asset'),
	icon: icon,
	...defualtOpt,
	webPreferences: {
		preload: preloadPath,
		...defualtOpt.webPreferences,
	},
};

export const webviewOpt = {
	...defualtOpt,
	webPreferences: {
		...defualtOpt.webPreferences,
		preload: webviewPreloadPath,
	},
};

export const popWindowOpt = {
	...defualtOpt,
	webPreferences: {
		...defualtOpt.webPreferences,
		preload: popPreloadPath,
	},
};
