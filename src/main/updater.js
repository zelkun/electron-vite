// src/main/updater.js
import { autoUpdater } from 'electron-updater';
import { dialog, BrowserWindow } from 'electron';
import log from 'electron-log/main';
import ProgressBar from 'electron-progressbar';
import { hostsCheckAndUpdate } from './hostsChecker.js';

let progressBar = null;

export function setupUpdater() {
	// 로깅 설정
	log.transports.file.level = 'info';
	autoUpdater.logger = log;

	const mainWindow = BrowserWindow.getFocusedWindow() || BrowserWindow.getAllWindows()[0];

	// 업데이트 이벤트 처리
	autoUpdater.on('checking-for-update', () => {
		log.info('업데이트 확인 중...');
	});

	autoUpdater.on('update-available', (info) => {
		log.info('업데이트 가능:', info);
		dialog
			.showMessageBox(mainWindow, {
				type: 'info',
				title: '업데이트 발견',
				message: '새 버전이 발견되었습니다. 지금 다운로드하시겠습니까?',
				buttons: ['예', '아니오'],
			})
			.then((result) => {
				if (result.response === 0) {
					autoUpdater.downloadUpdate();

					// 진행 상태 표시
					progressBar = new ProgressBar({
						indeterminate: false,
						text: '업데이트 다운로드 중...',
						detail: '잠시만 기다려주세요...',
					});
				}
			});
	});

	autoUpdater.on('update-not-available', () => {
		log.info('최신 버전입니다.');
		dialog.showMessageBox(mainWindow, {
			type: 'info',
			title: '업데이트 없음',
			message: '현재 최신 버전을 사용 중입니다.',
		});
	});

	autoUpdater.on('download-progress', (progressObj) => {
		let logMessage = `다운로드 속도: ${progressObj.bytesPerSecond} - 다운로드: ${progressObj.percent}% (${progressObj.transferred}/${progressObj.total})`;
		log.info(logMessage);

		if (progressBar) {
			progressBar.value = progressObj.percent;
			progressBar.detail = logMessage;
		}
	});

	autoUpdater.on('update-downloaded', () => {
		log.info('업데이트 다운로드 완료');
		if (progressBar) {
			progressBar.close();
		}

		dialog
			.showMessageBox(mainWindow, {
				type: 'info',
				title: '업데이트 준비 완료',
				message: '업데이트가 다운로드되었습니다. 지금 설치하시겠습니까?',
				buttons: ['지금 설치', '나중에'],
			})
			.then((result) => {
				if (result.response === 0) {
					autoUpdater.quitAndInstall(false, true);
				}
			});
	});

	autoUpdater.on('error', (err) => {
		log.error('업데이트 오류:', err);
		if (progressBar) {
			progressBar.close();
		}

		dialog.showErrorBox('업데이트 오류', '업데이트 중 오류가 발생했습니다: ' + err);
	});

	// 업데이트 확인 함수
	const checkForUpdates = () => {
		autoUpdater.checkForUpdates();
	};

	// 자동 업데이트 확인 설정 (앱 시작 후 10초 후)
	setTimeout(() => {
		// hosts 파일 체크 후 업데이트 진행
		hostsCheckAndUpdate(checkForUpdates).catch((err) => {
			log.error('hosts 체크 중 오류:', err);
		});
	}, 10000);
}
