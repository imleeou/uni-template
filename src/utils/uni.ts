import { getEvnBaseUrl } from '@/utils/env'

/** 授权 */
export function authorize(scope: string) {
  console.log('[ scope ] >', scope)
  return new Promise((resolve, reject) => {
    uni.authorize({
      scope,
      success: (res) => {
        resolve(res)
      },
      fail: (err: any) => {
        reject(err)
      },
    })
  })
}

/** 异步获取code */
export function getCodeAsync() {
  return new Promise((resolve: (value: string) => void, reject) => {
    uni.login({
      provider: 'weixin',
      success: (res) => {
        resolve(res.code)
      },
      fail: (err: any) => {
        reject(err)
      },
    })
  })
}

export interface UploadOptions {
  formData?: any
  name: string
  header?: any
  timeout?: number
  apiUrl?: string
}

/** 封装 uni.uploadFile */
export const uploadFile = (
  filePath: string,
  options: UploadOptions = {
    name: 'file',
  },
): Promise<any> => {
  const VITE_UPLOAD_BASEURL = `${getEvnBaseUrl().request}/api/uploadAvatar`

  return new Promise((resolve, reject) => {
    uni.uploadFile({
      url: options.apiUrl || VITE_UPLOAD_BASEURL,
      filePath,
      ...options,
      success: (res) => {
        const data =
          typeof res.data === 'string' && res.data.startsWith('{') ? JSON.parse(res.data) : res.data
        console.log('上传成功', res.data, data)
        resolve(data)
      },
      fail: (err: any) => {
        reject(err)
      },
    })
  })
}

/** 获取系统信息 */
export function getSystemInfo(useCache = true) {
  const CACHE_KEY = '__systemInfo__'
  const cacheData = uni.getStorageSync(CACHE_KEY)

  return new Promise((resolve: (value: UniApp.GetSystemInfoResult) => void, reject) => {
    if (cacheData && useCache) {
      resolve(cacheData)
      return
    }
    uni.getSystemInfo({
      success: (res) => {
        uni.setStorage({ key: CACHE_KEY, data: res })
        resolve(res)
      },
      fail: (err) => {
        reject(err)
      },
    })
  })
}

/** 获取导航栏 + 状态栏高度 */
export async function getNavigationBarHeight() {
  const systemInfo = await getSystemInfo()
  console.log(`💡 ~ getNavigationBarHeight ~ systemInfo -> `, systemInfo)
  // 获取手机顶部状态栏的高度
  const statusBarHeight = systemInfo.statusBarHeight || 0

  // 获取导航栏的高度（手机状态栏高度 + 胶囊高度 + 胶囊的上下间距）
  const menuButtonInfo = uni.getMenuButtonBoundingClientRect()
  console.log(`💡 ~ getNavigationBarHeight ~ menuButtonInfo -> `, menuButtonInfo)
  const navBarHeight = menuButtonInfo.height + (menuButtonInfo.top - statusBarHeight) * 2

  return navBarHeight + statusBarHeight
}
