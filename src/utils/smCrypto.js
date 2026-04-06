/**
 * 加解密的工具类
 * 使用：https://github.com/Cubelrti/sm-crypto-v2
 *
 * @author yubaoshan
 */
import { sm2 } from 'sm-crypto-v2'
import SETTING from '@/utils/setting'
const cipherMode = 1 // 1 - C1C3C2，0 - C1C2C3，默认为1
const publicKey = SETTING.sm2PublicKey

/**
 * 国密加解密工具类
 */
export default {
	/**
   * sm2加密
   * @param str 加密字符串
   * @returns
   */
	doEncrypt(str) {
    console.log("sm2publicKey",publicKey);
    // 支持使用 asn1 对加密结果进行编码，在 options 参数中传入 { asn1: true } 即可，默认不开启
    //let encryptData = sm2.doEncrypt(msgString, publicKey, cipherMode, { asn1: false }) // 加密结果为十六进制字符串
		return sm2.doEncrypt(str, publicKey, cipherMode)
	},

	// SM2解密
	doDecrypt(str) {
    //// 支持使用 asn1 对密文进行解码再解密，在 options 参数中传入 { asn1: true } 即可，默认不开启
		return sm2.doDecrypt(str, publicKey, cipherMode)
	},
  /**
   * 生成公钥、秘钥并输出到控制台，这个开发时使用，正式环境不要调用
   */
  generateKeyPairHexToConsole(){
    // 生成密钥对
    // 默认生成的是十六进制格式
    let keypair = sm2.generateKeyPairHex();

    console.log('私钥 (Private Key):', keypair.privateKey);
    console.log('公钥 (Public Key):', keypair.publicKey);
    console.log("生成键值对成功，私钥可以保存到配置文件中，公钥可以发送给前端，前端使用公钥加密，后端使用私钥解密")
  }

}
