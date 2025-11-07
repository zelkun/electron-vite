<!-- src/renderer/src/popup.vue -->
<template>
	<div class="popup-container" style="width: 100%; height: 100%; margin: 0; padding: 0; overflow: hidden">
		<!-- SearchInPage 컴포넌트 추가 -->
		<SearchInPage
			ref="searchComponent"
			:visible="showSearch"
			:searchText="searchText"
			:searchResults="searchResults"
			@update:searchText="(v) => (searchText = v)"
			@find="findInPage"
			@find-next="findNext"
			@find-previous="findPrevious"
			@close="closeSearch"
		/>

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
import SearchInPage from './components/common/SearchInPage.vue';

export default {
	name: 'Popup',
	components: { SearchInPage },
	props: {},
	emits: [],
	setup() {},
	data() {
		return {
			blankUrl: 'about:blank',
			currentUrl: this.blankUrl,
			// 검색 관련 상태 추가
			showSearch: false,
			searchText: '',
			searchResults: { activeMatchOrdinal: 0, matches: 0 },
			foundInPageListener: null,
		};
	},
	computed: {},
	watch: {},
	mounted() {
		const urlParams = new URLSearchParams(window.location.search);
		this.currentUrl = urlParams.get('url') || this.blankUrl;

		// IPC 이벤트 수신 처리
		if (window.popupAPI) {
			window.popupAPI.on('show-page-search', this.showPageSearch);
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

		// 검색 관련 메서드 추가
		showPageSearch() {
			this.showSearch = true;
			this.$nextTick(() => {
				if (this.$refs.searchComponent?.$refs.searchInput) {
					this.$refs.searchComponent.$refs.searchInput.focus();
				}
			});
		},

		closeSearch() {
			this.showSearch = false;
			this.searchText = '';
			this.searchResults = { activeMatchOrdinal: 0, matches: 0 };

			const webview = document.querySelector('#popupWebview');
			if (webview) {
				webview.stopFindInPage('clearSelection');
				if (this.foundInPageListener) {
					webview.removeEventListener('found-in-page', this.foundInPageListener);
					this.foundInPageListener = null;
				}
			}
		},

		findInPage() {
			if (!this.searchText) return;
			const webview = document.querySelector('#popupWebview');
			if (webview) {
				if (this.foundInPageListener) {
					webview.removeEventListener('found-in-page', this.foundInPageListener);
				}

				this.foundInPageListener = (e) => {
					this.searchResults = {
						activeMatchOrdinal: e.result.activeMatchOrdinal,
						matches: e.result.matches,
					};
				};
				webview.addEventListener('found-in-page', this.foundInPageListener);
				webview.findInPage(this.searchText);
			}
		},

		findNext() {
			if (!this.searchText) return;
			const webview = document.querySelector('#popupWebview');
			if (webview) {
				webview.findInPage(this.searchText, { forward: true, findNext: true });
			}
		},

		findPrevious() {
			if (!this.searchText) return;
			const webview = document.querySelector('#popupWebview');
			if (webview) {
				webview.findInPage(this.searchText, { forward: false, findNext: true });
			}
		},
	},
};
</script>
<style scoped>
.search-bar {
	top: 0px;
}
</style>
