import { join } from 'path'
import fs from 'fs'
import os from 'os'

// 설정 파일 경로
const configPath = join(os.homedir(), '.electron-vite.json')

// 기본 설정
const defaultConfig = {
	bookmarks: [],
}

// 설정 로드
export function loadConfig() {
	try {
		if (fs.existsSync(configPath)) {
			const data = fs.readFileSync(configPath, 'utf8')
			return JSON.parse(data)
		}
	} catch (error) {
		console.error('설정 파일 로드 오류:', error)
	}
	return defaultConfig
}

// 설정 저장
export function saveConfig(config) {
	try {
		fs.writeFileSync(configPath, JSON.stringify(config, null, 2), 'utf8')
		return true
	} catch (error) {
		console.error('설정 파일 저장 오류:', error)
		return false
	}
}

// 특정 설정 가져오기
export function getConfigValue(key) {
	const config = loadConfig()
	return config[key]
}

// 특정 설정 저장하기
export function setConfigValue(key, value) {
	const config = loadConfig()
	config[key] = value
	return saveConfig(config)
}
