<!-- src/renderer/src/components/common/SearchInPage.vue -->
<template>
	<div v-if="visible" class="search-bar">
		<div class="search-input-container">
			<input
				id="search-input"
				ref="searchInput"
				type="text"
				:placeholder="placeholder"
				class="search-input"
				:value="searchText"
				@input="$emit('update:searchText', $event.target.value)"
				@keyup.enter="$emit('find')"
				@keyup.esc="$emit('close')"
			/>
			<div v-if="searchResults && searchResults.matches > 0" class="search-counter">{{ searchResults.activeMatchOrdinal }}/{{ searchResults.matches }}</div>
		</div>
		<div class="search-buttons">
			<button class="search-btn" title="이전" @click="$emit('find-previous')">
				<span class="nav-icon">▲</span>
			</button>
			<button class="search-btn" title="다음" @click="$emit('find-next')">
				<span class="nav-icon">▼</span>
			</button>
			<button class="search-btn close-btn" title="닫기" @click="$emit('close')">
				<span>×</span>
			</button>
		</div>
	</div>
</template>

<script>
export default {
	name: 'SearchInPage',
	props: {
		visible: { type: Boolean, default: false },
		searchText: { type: String, default: '' },
		searchResults: { type: Object, default: () => ({ activeMatchOrdinal: 0, matches: 0 }) },
		placeholder: { type: String, default: '페이지 내 검색' },
	},
	emits: ['update:searchText', 'find', 'find-next', 'find-previous', 'close'],
};
</script>
