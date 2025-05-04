// src/main/pathManager.js
import { app } from 'electron';
import { join, resolve, normalize, isAbsolute } from 'path';
import log from 'electron-log/main';
import fs from 'fs';
import { isDev, isMac } from './config.js'; // isDev 변수를 가져옵니다.

/**
 * 프로젝트 루트 경로 (main 프로세스 기준)
 */
const appRootPath = () => {
	return app.getAppPath();
};

const systemPath = process.env.SYSTEMROOT || '/';
// hosts 파일 경로 (Windows 기준, linux/macOS 추가)
const hostsPath = !isMac ? join(systemPath, 'System32', 'drivers', 'etc', 'hosts') : join(systemPath, 'etc', 'hosts');
const batFilePath = join(appRootPath(), isDev ? 'build' : 'resources', !isMac ? 'hosts.bat' : 'hosts.sh');

/**
 * 주요 디렉토리 경로
 */
const dirPaths = {
	src: join(appRootPath(), 'src'),
	main: join(appRootPath(), 'src/main'),
	renderer: join(appRootPath(), 'src/renderer'),
	preload: join(appRootPath(), 'src/preload'),
	resources: join(appRootPath(), 'resources'),
	build: join(appRootPath(), 'build'),
	out: join(appRootPath(), 'out'),
};

/**
 * 주요 파일 경로
 */
const filePaths = {
	mainWindow: join(dirPaths.main, 'index.js'),
	trayIcon: join(dirPaths.resources, 'icon.png'),
	packageJson: join(appRootPath(), 'package.json'),
	electronConfig: join(appRootPath(), 'electron.vite.config.mjs'),
};

/**
 * 동적 경로 생성 함수
 */
const dynamicPaths = {
	getPreloadPath: (scriptName) => join(dirPaths.preload, `${scriptName}.js`),
	getWebviewPath: (webviewId) => join(dirPaths.renderer, 'webviews', `${webviewId}.html`),
	getAssetPath: (...segments) => join(dirPaths.renderer, 'assets', ...segments),
};

/**
 * 환경별 경로
 */
const envPaths = {
	dev: {
		rendererUrl: process.env['ELECTRON_RENDERER_URL'],
		preloadEntry: join(dirPaths.preload, 'index.js'),
	},
	prod: {
		rendererEntry: join(dirPaths.renderer, 'index.html'),
		preloadEntry: join(dirPaths.out, 'preload/index.js'),
	},
};

export default {
	systemPath,
	batFilePath,
	hostsPath,

	// 기본 경로
	appRootPath: appRootPath(),
	dirs: dirPaths,
	files: filePaths,
	dynamic: dynamicPaths,
	env: envPaths,

	// 유틸리티 함수
	join: join,
	resolve: resolve,
	normalize: normalize,
	isAbsolute: isAbsolute,

	// 개발 환경 여부
	isDevelopment: () => isDev,

	// 경로 유효성 검사
	validatePath: (targetPath) => {
		try {
			return fs.existsSync(targetPath);
		} catch (err) {
			log.error('Path validation error:', err);
			return false;
		}
	},
};
