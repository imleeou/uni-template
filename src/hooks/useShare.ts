import { useLoginStore } from '@/store'
import { onShareAppMessage, onShareTimeline } from '@dcloudio/uni-app'

/** 通用的可以分享到朋友圈和好友 */
const useShare = () => {
  const SHARE_IMAGE = '/static/images/all-invite-image.png'

  /** 全局发送给朋友 */
  onShareAppMessage((res: any) => {
    const loginStore = useLoginStore()
    console.log('全局分享触发')
    if (res.from === 'button') {
      // 来自页面内分享按钮
      console.log(res.target)
    }
    return {
      title: `${loginStore.userInfo?.nickname ?? '朋友'}邀请你使用最好用的小程序！`,
      path: 'pages/index/index?from=fx',
      desc: 'uni template',
      imageUrl: SHARE_IMAGE,
    }
  })

  /** 全局分享到朋友圈 */
  onShareTimeline(() => {
    console.log('全局分享到朋友圈触发')
    return {
      title: `uni template`,
      query: 'from=fx',
    }
  })

  return {
    onShareAppMessage,
    onShareTimeline,
  }
}

export default useShare
