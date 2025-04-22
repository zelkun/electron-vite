import { app } from 'electron';
import log from 'electron-log/main';

/**
 * Electron 애플리케이션의 명령줄 인수를 설정합니다.
 */
export function setupCommandLine() {
	process.env['ELECTRON_DISABLE_SECURITY_WARNINGS'] = 'true';
	process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'; // 인증서 오류 무시 (개발용)
	app.commandLine.appendSwitch('no-sandbox'); // 샌드박스 비활성화 (개발용)
	app.commandLine.appendSwitch('v', '1'); // 로깅 레벨 설정 (개발용)
	app.commandLine.appendSwitch('ignore-certificate-errors'); // 인증서 오류 무시 (개발용)
	app.commandLine.appendSwitch('enable-logging'); // 로깅 활성화 (개발용)
	app.commandLine.appendSwitch('disable-web-security'); // 웹 보안 비활성화 (개발용)
	app.commandLine.appendSwitch('disable-http-cache'); // HTTP 캐시 비활성화 (개발용)
	app.commandLine.appendSwitch('disable-features', 'SameSiteByDefaultCookies'); // SameSite 쿠키 비활성화 (개발용)
	app.commandLine.appendSwitch('disable-features', 'OutOfBlinkCors'); // CORS 비활성화 (개발용)
	app.commandLine.appendSwitch('disable-features', 'IsolateOrigins,site-per-process'); // 사이트 격리 비활성화 (개발용)
	app.commandLine.appendSwitch('disable-features', 'CrossSiteDocumentBlockingIfIsolating'); // 크로스 사이트 문서 차단 비활성화 (개발용)
	app.commandLine.appendSwitch('disable-features', 'CrossSiteDocumentBlockingAlways'); // 크로스 사이트 문서 차단 비활성화 (개발용)
	app.commandLine.appendSwitch('disable-features', 'CookiesWithoutSameSiteMustBeSecure'); // SameSite 쿠키 비활성화 (개발용)
	app.commandLine.appendSwitch('disable-features', 'AllowInsecureLocalhost'); // 로컬호스트에 대한 보안 예외 허용 (개발용)
	app.commandLine.appendSwitch('allow-insecure-localhost'); // 로컬호스트에 대한 보안 예외 허용 (개발용)

	// 인증서 오류 발생 시 무시 (개발용)
	app.on('certificate-error', (evt, webContents, url, err, cert, callback, isMainFrame) => {
		evt.preventDefault();
		callback(true);
	});

	log.info(`Command line switches have been configured`);
}

/**
 * 명령줄 인수를 파싱하는 함수
 * @returns {Object} 파싱된 명령줄 인수 객체
 */
export function parseCommandLineArgs() {
	const args = process.argv.slice(2);
	const parsedArgs = {};

	args.forEach((arg) => {
		if (arg.startsWith('--')) {
			const [key, value] = arg.split('=');
			parsedArgs[key.replace('--', '')] = value || true;
		} else if (arg.startsWith('-')) {
			const key = arg.replace('-', '');
			parsedArgs[key] = true;
		}
	});

	return parsedArgs;
}

/**
 * 특정 명령줄 스위치가 있는지 확인
 * @param {string} switchName - 확인할 스위치 이름
 * @returns {boolean} 스위치 존재 여부
 */
export function hasSwitch(switchName) {
	return app.commandLine.hasSwitch(switchName);
}

/**
 * 특정 명령줄 스위치의 값을 가져옴
 * @param {string} switchName - 값을 가져올 스위치 이름
 * @returns {string} 스위치 값
 */
export function getSwitchValue(switchName) {
	return app.commandLine.getSwitchValue(switchName);
}
