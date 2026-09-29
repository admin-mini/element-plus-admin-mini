/**
 * 随机密码生成工具
 * 生成包含数字、大小写字母的随机密码，默认8位，保证各类字符至少出现一次
 */
const UPPER = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
const LOWER = 'abcdefghijklmnopqrstuvwxyz'
const NUMBER = '0123456789'
const ALL = UPPER + LOWER + NUMBER

function randomIndex(set) {
  return Math.floor(Math.random() * set.length)
}

/**
 * 生成随机密码
 * @param {number} length 密码长度，默认8
 * @returns {string}
 */
export function generateRandomPassword(length = 8) {
  if (length < 3) {
    length = 3
  }
  // 先保证数字、大小写字母各至少一位
  const parts = [UPPER, LOWER, NUMBER].map((set) => set[randomIndex(set)])
  // 补齐剩余长度
  while (parts.length < length) {
    parts.push(ALL[randomIndex(ALL)])
  }
  // Fisher-Yates 洗牌打乱顺序，避免固定前缀
  for (let i = parts.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[parts[i], parts[j]] = [parts[j], parts[i]]
  }
  return parts.join('')
}

export default { generateRandomPassword }