// src/main/config.js
import { app } from 'electron';
import { is } from '@electron-toolkit/utils';
import { join } from 'path';
import log from 'electron-log/main';
import fs from 'fs';
import os from 'os';

const logFormat = `[{processType}:{logId}:{scope}][{level}][{h}:{i}:{s}]]{text}`; // 로그 포맷 설정
// log.transports.file.file = logPath; // 로그 파일 경로 설정
log.transports.console.level = 'debug'; // 콘솔 로그 레벨 설정
log.transports.console.format = logFormat; // 콘솔 로그 포맷 설정
// log.transports.file.level = isDev ? 'debug' : 'info'; // 로그 레벨 설정
// log.transports.file.format = logFormat; // 파일 로그 포맷 설정

export const isMac = process.platform === 'darwin'; // macOS 체크
export const isDev = process.argv.includes('dev') || process.env.NODE_ENV === 'development' || is.dev; // 개발 모드 체크

const configPath = join(isDev ? app.getAppPath() : os.homedir(), '.electron-vite.json'); // 설정 파일 경로

// 기본 설정
export const defaultConfig = {
	bookmarks: [],
	settings: {
		homePage: 'about:blank',
		startupAction: 'newTab',
		showBookmarkBar: true,
		theme: 'light',
	},
};

// 설정 로드
export function loadConfig() {
	try {
		if (fs.existsSync(configPath)) {
			const data = fs.readFileSync(configPath, 'utf8');
			try {
				const parsed = JSON.parse(data);
				log.info('Config loaded successfully');
				return parsed;
			} catch (parseError) {
				log.error('JSON 파싱 오류:', parseError.message);
				//dialog.showErrorBox('설정 파일 오류', 'JSON 형식이 잘못되었습니다.');
			}
		}
	} catch (error) {
		log.error('설정 파일 읽기 오류:', error);
	}
	log.info('기본 설정 사용');
	return { ...defaultConfig };
}

// 설정 저장
export function saveConfig(config) {
	try {
		fs.writeFileSync(configPath, JSON.stringify(config, null, 2), 'utf8');
		return true;
	} catch (error) {
		log.error('설정 파일 저장 오류:', error);
		return false;
	}
}

// 특정 설정 섹션 가져오기
export function getConfigSection(section) {
	const config = loadConfig();
	return config[section] || (defaultConfig[section] ? { ...defaultConfig[section] } : {});
}

// 특정 설정 섹션 저장하기
export function saveConfigSection(section, data) {
	const config = loadConfig();
	config[section] = data;
	return saveConfig(config);
}

// 특정 설정값 가져오기
export function getConfigValue(section, key) {
	const sectionData = getConfigSection(section);
	return sectionData[key];
}

// 특정 설정값 저장하기
export function setConfigValue(section, key, value) {
	const config = loadConfig();
	if (!config[section]) {
		config[section] = {};
	}
	config[section][key] = value;
	return saveConfig(config);
}
