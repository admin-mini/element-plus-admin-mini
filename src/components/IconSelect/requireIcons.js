let icons = []
const modules = import.meta.glob('/svg-icon-origin/*.svg')
for (const path in modules) {
  const p = path.split('svg-icon-origin/')[1].split('.svg')[0]
}
export default icons
