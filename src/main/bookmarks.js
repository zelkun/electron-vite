// src/main/bookmarks.js
import fs from 'fs'
import os from 'os'
import path from 'path'

export const bookmarksFile = path.join(os.homedir(), '.electron-vite.json')

export function loadBookmarks() {
	try {
		const data = fs.readFileSync(bookmarksFile, 'utf8')
		return JSON.parse(data)
	} catch (err) {
		return []
	}
}

export function saveBookmarks(bookmarks) {
	fs.writeFileSync(bookmarksFile, JSON.stringify(bookmarks, null, 2))
}
