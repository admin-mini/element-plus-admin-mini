/**
 * 工具类集合
 */
const tool = {}

// localStorage
tool.data = {
	set(table, settings) {
		const _set = JSON.stringify(settings)
		const NUOCAOSTRING = table.slice(0, 6) === 'NUOCAO_' && table !== 'NUOCAO_SYS_BASE_CONFIG'
		if (NUOCAOSTRING) {
			let localSetting = JSON.parse(localStorage.getItem('NUOCAO_SETTING')) || {}
			let newSetting = {}
			newSetting[table] = _set
			return localStorage.setItem('NUOCAO_SETTING', JSON.stringify(Object.assign(localSetting, newSetting)))
		} else return localStorage.setItem(table, _set)
	},
	get(table) {
		const NUOCAOSTRING = table.slice(0, 6) === 'NUOCAO_' && table !== 'NUOCAO_SYS_BASE_CONFIG'
		const NUOCAO_SETTING = JSON.parse(localStorage.getItem('NUOCAO_SETTING')) || {}
		let data = NUOCAOSTRING ? NUOCAO_SETTING[table] : localStorage.getItem(table)
		try {
			data = JSON.parse(data)
		} catch (err) {
			return null
		}
		return data
	},
	remove(table) {
		return localStorage.removeItem(table)
	},

	clear() {
		return localStorage.clear()
	}
}


export default tool;