// src/main/hostsChecker.js
import { dialog, BrowserWindow } from 'electron';
import { exec } from 'child_process';
import log from 'electron-log/main';
import fs from 'fs';
import pathManager from './pathManager.js';

const domain = 'git.electron.vite';
let mainWindow = null;

/**
 * hosts 파일에서 특정 도메인이 있는지 확인
 * @returns {boolean} 도메인 존재 여부
 */
function checkDomainInHosts() {
	try {
		const content = fs.readFileSync(pathManager.hostsPath, 'utf-8');
		return content.includes(domain);
	} catch (err) {
		log.error('hosts 파일 읽기 오류:', err);
		return false;
	}
}

/**
 * bat 파일 실행하여 hosts 파일 수정
 * @returns {Promise<boolean>} 실행 성공 여부
 */
function runBatFile() {
	log.debug('batFilePath:', pathManager.batFilePath);
	return new Promise((resolve, reject) => {
		exec(pathManager.batFilePath, (error, stdout, stderr) => {
			if (error) {
				log.error('bat 파일 실행 오류:', error);
				reject(error);
			} else {
				log.log('bat 파일 실행 결과:', stdout);
				resolve(true);
			}
		});
	});
}

/**
 * hosts 파일 체크 및 업데이트 실행 로직
 * @param {Function} updateFunc - 업데이트를 실행할 콜백 함수
 * @returns {Promise<boolean>} 업데이트 진행 여부
 */
async function hostsCheckAndUpdate(updateFunc) {
	// hosts 파일에 도메인이 있는지 확인
	if (checkDomainInHosts()) {
		log.log('도메인 존재: 업데이트 실행');
		updateFunc();
		return true;
	} else {
		log.log('도메인 없음: hosts 수정 여부 확인');

		const focusedWindow = BrowserWindow.getFocusedWindow();
		if (focusedWindow) {
			mainWindow = focusedWindow;
		} else {
			mainWindow = BrowserWindow.getAllWindows()[0];
		}

		// 사용자에게 hosts 파일 수정 여부 확인
		const result = await dialog.showMessageBox(mainWindow, {
			type: 'question',
			buttons: ['예', '취소'],
			defaultId: 0,
			cancelId: 1,
			title: 'hosts 파일 수정',
			message: `hosts 파일에 도메인 ${domain}이(가) 없습니다. 수정하시겠습니까?`,
			detail: '업데이트 서버에 접속하기 위해 hosts 파일 수정이 필요합니다.',
		});

		if (result.response === 0) {
			log.log('hosts 수정 실행');
			try {
				await runBatFile();
				log.log('hosts 수정 성공: 업데이트 실행');
				updateFunc();
				return true;
			} catch (error) {
				log.error('hosts 수정 실패:', error);
				return false; // 수정 실패 시 업데이트 스킵
			}
		} else {
			log.log('사용자 취소: 업데이트 스킵');
			return false;
		}
	}
}

export { hostsCheckAndUpdate };
