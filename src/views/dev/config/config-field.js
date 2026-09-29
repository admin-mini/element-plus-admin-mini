/**
 * 配置项字段定义表
 *
 * 集中描述「每个 configKey 用什么控件维护、需要哪些校验」，form.vue 直接引用本文件渲染，新增配置项时只改这里即可。
 * 未在此声明的 configKey 会走 form.vue 内置的自动推断（密码/开关/json 等）。
 *
 * 支持的 type：
 *  input     单行文本（默认）
 *  textarea  多行文本
 *  json      多行文本，保存前校验 JSON 格式
 *  password  密码框（可切换明文）
 *  number    数字输入框，可配 min/max/step/tip
 *  switch    开关，值存为 'true' / 'false'
 *  radio     单选（options: [{ label, value }]）
 *  select    下拉单选（options）
 *  checkbox  多选（options，值存为逗号分隔字符串）
 *  date      日期（YYYY-MM-DD）
 *  datetime  日期时间（YYYY-MM-DD HH:mm:ss）
 *  upload    上传文件，值存上传接口返回的文件 url
 *
 * 其他可用属性：
 *  label        显示名称（不填则用后端的 remark，再兜底为 configKey）
 *  tip          输入说明（展示在输入框下方）
 *  placeholder  占位提示
 *  rules        校验规则数组，用下方 fieldRules 生成，如 [fieldRules.required('请输入 xx')]
 */

import commonRules from '@/utils/rules'

/**
 * 校验规则生成器，统一维护常用规则，供配置项 rules 引用
 * 正则部分复用项目已有的 @/utils/rules，避免两处维护
 *
 * 可用规则：
 *  required(message?, trigger?)  必填
 *  email(message?, trigger?)     邮箱
 *  phone(message?, trigger?)     手机号
 *  url(message?, trigger?)       网址（允许省略 http(s):// 前缀）
 *  json(message?, trigger?)      合法 JSON
 *  ip(type?)                     IP 地址，type 可传 '子网掩码' 等提示语
 *  mac()                         MAC 地址
 *  int({ min, max }?)            整数，可限定范围
 *  decimal({ min, max }?)        小数，min/max 为小数位数
 *  length({ min, max }?)         长度限制
 *
 * trigger: 输入类控件用 blur，选择类控件（radio/select/checkbox）用 change
 */
export const fieldRules = {
  /** 必填 */
  required: (message = '不能为空', trigger = 'blur') => ({
    ...commonRules.required,
    message,
    trigger
  }),
  /** 邮箱 */
  email: (message, trigger = 'blur') => ({
    ...commonRules.email,
    message: message || commonRules.email.message,
    trigger
  }),
  /** 手机号 */
  phone: (message, trigger = 'blur') => ({
    ...commonRules.phone,
    message: message || commonRules.phone.message,
    trigger
  }),
  /** 网址，允许省略 http(s):// 前缀 */
  url: (message = '请输入正确的网址', trigger = 'blur') => ({
    pattern: /^(https?:\/\/)?[\w-]+(\.[\w-]+)+(:\d+)?(\/\S*)?$/,
    message,
    trigger
  }),
  /** IP 地址 */
  ip: (type = 'ip') => ({ ...commonRules.ip(type), trigger: 'blur' }),
  /** MAC 地址 */
  mac: () => ({ ...commonRules.mac(), trigger: 'blur' }),
  /** 整数，可限定范围 */
  int: option => commonRules.int(option),
  /** 小数，min/max 为小数位数 */
  decimal: option => commonRules.decimal(option),
  /** 长度限制 */
  length: (option = {}) => commonRules.length(option),
  /** 合法 JSON */
  json: (message = '不是合法的 JSON', trigger = 'blur') => ({
    validator: (rule, value, callback) => {
      if (!value) return callback()
      try {
        JSON.parse(value)
        callback()
      } catch {
        callback(new Error(message))
      }
    },
    trigger
  })
}

/** 文件存储引擎选项，取自后端 DevFileEngineTypeEnum */
export const FILE_ENGINE_OPTIONS = [
  { label: '本地', value: 'local' },
  { label: '阿里云', value: 'aliyun' },
  { label: '腾讯云', value: 'tencent' },
  { label: 'MinIO', value: 'minio' }
]

/** 短信通道选项，取自后端 SmsChannelEnum */
export const SMS_CHANNEL_OPTIONS = [
  { label: '阿里云', value: 'aliyun' },
  { label: '腾讯云', value: 'tencent' }
]

const CONFIG_FIELDS = {
  /* ---------------- 系统配置 sys_config ---------------- */
  sys_title: {
    type: 'input',
    label: '系统标题',
    rules: [fieldRules.required('系统标题不能为空')]
  },
   sys_tel: {
    type: 'input',
    label: '客服电话',
    rules: [fieldRules.required('客服电话不能为空'),fieldRules.phone('请输入正确的客服电话')]
  },
  sys_email: {
    type: 'input',
    label: '联系邮箱',
    rules: [fieldRules.required('联系邮箱不能为空'),fieldRules.email()]
  },
  //  DevFileApiProvider.sys_default_file_engine
  sys_default_file_engine: {
    type: 'radio',
    label: '默认文件存储引擎',
    options: FILE_ENGINE_OPTIONS,
    rules: [fieldRules.required('请选择默认文件存储引擎', 'change')]
  },
  //  SmsConstants.sys_default_sms_channel_code
  sys_default_sms_channel_code: {
    type: 'radio',
    label: '默认短信通道',
    options: SMS_CHANNEL_OPTIONS,
    rules: [fieldRules.required('请选择默认短信通道', 'change')]
  },
  // 后端 SmsConstants.SYS_SMS_CHANNEL_LANG_KEY，取值为 {"zh_CN":"aliyun"} 形式的映射
  sys_sms_channel_lang: {
    type: 'json',
    label: '短信通道与语言对应关系',
    tip: 'JSON 格式，形如 {"zh_CN":"aliyun","en_US":"tencent"}，每个通道只能对应一种语言',
    rules: [fieldRules.json('短信通道与语言对应关系不是合法的 JSON')]
  },
  // 登录配置
  auth_login_captcha_open: {
    type: 'switch',
    label: '登录图片验证码'
  },

  /* ---------------- 密码配置 password_config ---------------- */
  auth_login_pwd_error_count_limit: {
    type: 'number',
    label: '密码错误次数上限',
    min: 1,
    tip: '单位：次',
    rules: [fieldRules.required('请输入密码错误次数上限')]
  },
  auth_login_pwd_error_count_duration: {
    type: 'number',
    label: '密码错误统计时间间隔',
    min: 1,
    tip: '单位：分钟',
    rules: [fieldRules.required('请输入密码错误统计时间间隔')]
  },
  auth_login_pwd_error_disable_time: {
    type: 'number',
    label: '密码错误后禁用时间',
    min: 1,
    tip: '单位：分钟',
    rules: [fieldRules.required('请输入密码错误后禁用时间')]
  },

  /* ---------------- 文件-本地 file_lcoal ---------------- */
  file_local_folder: {
    type: 'input',
    label: '本地文件存储目录',
    placeholder: '如 D:/upload 或 /data/upload',
    rules: [fieldRules.required('请输入本地文件存储目录')]
  },

  /* ---------------- 文件-阿里云 file_aliyun ---------------- */
  file_aliyun_access_key_id: {
    type: 'input',
    label: 'AccessKeyId',
    rules: [fieldRules.required('请输入 AccessKeyId')]
  },
  file_aliyun_access_key_secret: {
    type: 'password',
    label: 'AccessKeySecret',
    rules: [fieldRules.required('请输入 AccessKeySecret')]
  },
  file_aliyun_end_point: {
    type: 'input',
    label: 'EndPoint',
    rules: [fieldRules.required('请输入 EndPoint')]
  },
  file_aliyun_bucket_name: {
    type: 'input',
    label: 'BucketName',
    rules: [fieldRules.required('请输入 BucketName')]
  },
  file_aliyun_bind_domain_url: {
    type: 'input',
    label: '绑定域名',
    placeholder: '如 https://file.xxx.com',
    rules: [fieldRules.url('请输入正确的绑定域名')]
  },

  /* ---------------- 文件-腾讯云 file_tencentT ---------------- */
  file_tencent_secret_id: {
    type: 'input',
    label: 'SecretId',
    rules: [fieldRules.required('请输入 SecretId')]
  },
  file_tencent_secret_key: {
    type: 'password',
    label: 'SecretKey',
    rules: [fieldRules.required('请输入 SecretKey')]
  },
  file_tencent_region_id: {
    type: 'input',
    label: 'RegionId',
    placeholder: '如 ap-beijing',
    rules: [fieldRules.required('请输入 RegionId')]
  },
  file_tencent_bucket_name: {
    type: 'input',
    label: 'BucketName',
    rules: [fieldRules.required('请输入 BucketName')]
  },
  file_tencent_bind_domain_url: {
    type: 'input',
    label: '绑定域名',
    placeholder: '如 https://file.xxx.com',
    rules: [fieldRules.url('请输入正确的绑定域名')]
  },

  /* ---------------- 文件-MinIO file_minio ---------------- */
  file_minio_access_key: {
    type: 'input',
    label: 'AccessKey',
    rules: [fieldRules.required('请输入 AccessKey')]
  },
  file_minio_secret: {
    type: 'password',
    label: 'SecretKey',
    rules: [fieldRules.required('请输入 SecretKey')]
  },
  file_minio_end_point: {
    type: 'input',
    label: 'EndPoint',
    placeholder: '如 http://127.0.0.1:9000',
    rules: [fieldRules.required('请输入 EndPoint')]
  },
  file_minio_bucket_name: {
    type: 'input',
    label: 'BucketName',
    rules: [fieldRules.required('请输入 BucketName')]
  },
  file_minio_bind_domain_url: {
    type: 'input',
    label: '绑定域名',
    placeholder: '如 https://file.xxx.com',
    rules: [fieldRules.url('请输入正确的绑定域名')]
  },

  /* ---------------- 短信-阿里云 sms_aliyun ---------------- */
  sms_aliyun_access_key_id: {
    type: 'input',
    label: 'AccessKeyId',
    rules: [fieldRules.required('请输入 AccessKeyId')]
  },
  sms_aliyun_access_key_secret: {
    type: 'password',
    label: 'AccessKeySecret',
    rules: [fieldRules.required('请输入 AccessKeySecret')]
  },
  // 注意：后端常量拼写为 sms_aliyujn_...，此处保持一致
  sms_aliyujn_default_sign_name: {
    type: 'input',
    label: '默认短信签名',
    rules: [fieldRules.required('请输入默认短信签名')]
  },

  /* ---------------- 短信-腾讯云 sms_tencent ---------------- */
  sms_tencent_secret_id: {
    type: 'input',
    label: 'SecretId',
    rules: [fieldRules.required('请输入 SecretId')]
  },
  sms_tencent_secret_key: {
    type: 'password',
    label: 'SecretKey',
    rules: [fieldRules.required('请输入 SecretKey')]
  },
  sms_tencent_default_sdk_app_id: {
    type: 'input',
    label: '默认 SdkAppId',
    rules: [fieldRules.required('请输入默认 SdkAppId')]
  },
  sms_tencent_default_sign_name: {
    type: 'input',
    label: '默认短信签名',
    rules: [fieldRules.required('请输入默认短信签名')]
  }
}

/** 取配置项的字段定义，未声明返回空对象（由 form.vue 走自动推断） */
export function getConfigField(configKey) {
  return CONFIG_FIELDS[configKey] || {}
}

export default CONFIG_FIELDS
