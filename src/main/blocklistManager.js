// src/main/blocklistManager.js
import { getConfigSection, saveConfigSection } from './config.js';

let blockedUrlsCache = [];

export function loadBlockedUrls() {
	const config = getConfigSection('blockedUrls');
	if (Array.isArray(config)) {
		blockedUrlsCache = config;
	} else {
		blockedUrlsCache = [];
	}
	return blockedUrlsCache;
}

export function getBlockedUrls() {
	return blockedUrlsCache;
}

export function saveBlockedUrls(urls) {
	if (!Array.isArray(urls)) return false;
	blockedUrlsCache = urls;
	return saveConfigSection('blockedUrls', urls);
}
