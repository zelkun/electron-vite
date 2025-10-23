<!-- src/renderer/src/popup.vue -->
<template>
	<div class="popup-container" style="width: 100%; height: 100%; margin: 0; padding: 0; overflow: hidden">
		<webview
			id="popupWebview"
			:src="currentUrl"
			style="width: 100%; height: 100%"
			webpreferences="nativeWindowOpen=true"
			allowpopups
			@dom-ready="fnOnloadPopup"
			@page-title-updated="onPageTitleUpdated"
		></webview>
	</div>
</template>

<script>
export default {
	name: 'Popup',
	components: {},
	props: {},
	emits: [],
	setup() {},
	data() {
		return {
			blankUrl: 'about:blank',
			currentUrl: this.blankUrl,
		};
	},
	computed: {},
	watch: {},
	mounted() {
		const urlParams = new URLSearchParams(window.location.search);
		this.currentUrl = urlParams.get('url') || this.blankUrl;

		// IPC 이벤트 수신 처리
		if (window.popupAPI) {
			window.popupAPI.on('show-page-search', () => {
				// 페이지 내 검색 UI 구현 권장 부분, 현재는 기본 알림창 사용
				alert('페이지 내 검색 기능을 구현하세요.');
			});
		}
	},
	unmounted() {},
	methods: {
		fnOnloadPopup(event) {
			const webview = event.target;
			console.log('Popup webview loaded:', webview?.getURL(), this.currentUrl);
			if (webview.getURL() === this.blankUrl && this.currentUrl !== this.blankUrl) {
				webview.src = this.currentUrl;
			}

			if (this.currentUrl !== this.blankUrl) {
				const script = `
				if(!window._close) window._close = window.close;
				window.close = () => {
					window.popupAPI?.send('popup-closed');
				};`;
				webview.executeJavaScript(script).then((rst) => {
					// 스크립트 실행 후 처리할 내용이 있으면 여기에 작성
					console.log('Close override script injected into popup webview.', rst);
				});
			}
		},
		onPageTitleUpdated(evt) {
			const newTitle = evt.title;
			console.log(`Popup page title updated: ${newTitle} ${evt.srcElement.src}`, evt);

			// 윈도우 타이틀 변경: document.title 수정
			// document.title = newTitle;
			document.title = this.currentUrl;
		},
	},
};
</script>
