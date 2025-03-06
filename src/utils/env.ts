import { isMp } from './platform'

/**
 * 根据微信小程序当前环境，判断应该获取的BaseUrl
 */
export const getEvnBaseUrl = () => {
  // 请求基准地址
  const urlMap = {
    request: import.meta.env.VITE_SERVER_BASEURL,
    ws: import.meta.env.VITE_WS_BASEURL,
  }

  // 小程序端环境区分
  if (isMp) {
    const {
      miniProgram: { envVersion },
    } = uni.getAccountInfoSync()
    // develop 开发版，trial体验版，release正式版

    switch (envVersion) {
      case 'develop':
        urlMap.request = import.meta.env.VITE_SERVER_BASEURL_DEV
        urlMap.ws = import.meta.env.VITE_WS_BASEURL_DEV
        break
      case 'trial':
        urlMap.request = import.meta.env.VITE_SERVER_BASEURL_DEV
        urlMap.ws = import.meta.env.VITE_WS_BASEURL_DEV
        break
      case 'release':
        urlMap.request = import.meta.env.VITE_SERVER_BASEURL
        urlMap.ws = import.meta.env.VITE_WS_BASEURL
        break
    }
  }

  return urlMap
}
