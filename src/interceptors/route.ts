/**
 * by leeou
 * 路由拦截，通常也是登录拦截
 */
import { useLoginStore } from '@/store'

const navigateToInterceptor = {
  // 注意，这里的url是 '/' 开头的，如 '/pages/index/index'，跟 'pages.json' 里面的 path 不同
  invoke({ url }: { url: string }) {
    // const path = url.split('?')[0]
    console.log('路由拦截', url) // /pages/route/index?a=1&age=30

    const loginStore = useLoginStore()
    if (!loginStore.isLoggedIn) {
      loginStore.uniLogin()
    }
    return true
  },
}

export const routeInterceptor = {
  install() {
    uni.addInterceptor('navigateTo', navigateToInterceptor)
    uni.addInterceptor('reLaunch', navigateToInterceptor)
    uni.addInterceptor('redirectTo', navigateToInterceptor)
  },
}
