<!-- src/renderer/src/popup.vue -->
<template>
	<div class="popup-container" style="width: 100%; height: 100%; margin: 0; padding: 0; overflow: hidden">
		<webview id="popupWebview" :src="currentUrl" style="width: 100%; height: 100%" webpreferences="nativeWindowOpen=true" allowpopups @dom-ready="fnOnloadPopup"></webview>
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
			currentUrl: 'about:blank',
		};
	},
	computed: {},
	watch: {},
	mounted() {
		const urlParams = new URLSearchParams(window.location.search);
		this.currentUrl = urlParams.get('url') || 'about:blank';

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
			if (webview.getURL() === 'about:blank') {
				webview.src = this.currentUrl;
			}
		},
	},
};
</script>
