import { onShareAppMessage, onShareTimeline } from '@dcloudio/uni-app'

export default {
  data() {
    return {}
  },

  /** 全局分享到朋友圈 */
  onShareTimeline() {
    console.log('全局分享到朋友圈触发')
    return {
      title: `「xxx」最好用的小程序！`,
      query: 'from=fx',
    }
  },
}
