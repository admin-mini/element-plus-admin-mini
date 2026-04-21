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

/**
 * 深拷贝
 */
tool.cloneDeep = (obj) => {
    // 1. 如果支持原生 structuredClone (iOS 15.4+, Android 105+)
    if (typeof structuredClone === 'function') {
        try {
            return structuredClone(obj)
        } catch (e) {
            // 防止包含无法克隆的对象（如函数）时报错，回退到普通逻辑
        }
    }

    // 2. 处理简单类型
    if (obj === null || typeof obj !== 'object') return obj

    // 3. 处理 Date 和 RegExp
    if (obj instanceof Date) return new Date(obj.getTime())
    if (obj instanceof RegExp) return new RegExp(obj.source, obj.flags)

    // 4. 处理数组和对象
    const res = Array.isArray(obj) ? [] : {}
    Object.keys(obj).forEach(key => {
        res[key] = tool.cloneDeep(obj[key])
    })
    
    return res
}


export default tool;