import { app } from 'electron';
import { join, resolve, normalize, isAbsolute } from 'path';
import log from 'electron-log/main';
import { isDev } from './config';
import fs from 'fs';

/**
 * 프로젝트 루트 경로 (main 프로세스 기준)
 */
const getRootPath = () => {
	return app.getAppPath();
};

/**
 * 주요 디렉토리 경로
 */
const dirPaths = {
	src: join(getRootPath(), 'src'),
	main: join(getRootPath(), 'src/main'),
	renderer: join(getRootPath(), 'src/renderer'),
	preload: join(getRootPath(), 'src/preload'),
	resources: join(getRootPath(), 'resources'),
	build: join(getRootPath(), 'build'),
	out: join(getRootPath(), 'out'),
};

/**
 * 주요 파일 경로
 */
const filePaths = {
	mainWindow: join(dirPaths.main, 'index.js'),
	trayIcon: join(dirPaths.resources, 'icon.png'),
	packageJson: join(getRootPath(), 'package.json'),
	electronConfig: join(getRootPath(), 'electron.vite.config.mjs'),
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

module.exports = {
	// 기본 경로
	root: getRootPath,
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
