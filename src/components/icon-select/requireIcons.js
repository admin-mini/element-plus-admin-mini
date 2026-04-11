let icons = []
const modules = import.meta.glob('@/assets/svg-icon/*.svg')
for (const path in modules) {
  const p = path.split('svg-icon/')[1].split('.svg')[0]
  icons.push(p)
}
export default icons
