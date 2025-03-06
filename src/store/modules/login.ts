import dayjs from 'dayjs'
import { defineStore } from 'pinia'
import { httpPost } from '@/utils/http'
import type { UserInfoType } from '@/types'
import { getCodeAsync } from '@/utils/uni'

export const INIT_STATE = {
  nickname: '微信用户' + new Date().getTime().toString().slice(0, 6),
  avatarUrl: '/static/logo.png',
}

export const useLoginStore = defineStore(
  'LoginStore',
  () => {
    /** 登录获取用户信息 */
    const userInfo = ref<UserInfoType>()
    /** token 有效期 */
    const tokenExpireTime = ref<string>()

    /** 是否登录 / token 在有效期内 */
    const isLoggedIn = computed(
      () => !!userInfo.value?.token && dayjs().isBefore(dayjs(tokenExpireTime.value)),
    )

    const setUserInfo = (val: Partial<UserInfoType>) => {
      if (Object.keys(val).length === 0) return
      userInfo.value = { ...userInfo.value, ...val }
      // 在接口更新用户信息时，只需更新 nickname
      if (Object.keys(val).includes('nickname')) {
        updateUserInfo({
          // 头像地址后端更新
          // avatarUrl: val.avatarUrl ?? userInfo.value.avatarUrl,
          nickname: val.nickname ?? userInfo.value.nickname,
        })
      }
    }

    const clearUserInfo = () => {
      userInfo.value = { ...userInfo.value, ...INIT_STATE }
    }

    /** 登录 */
    const uniLogin = async () => {
      const code = await getCodeAsync()
      await handleLogin(code)
    }

    /** 调用后端登录接口，获取 openId */
    const handleLogin = async (code: string) => {
      try {
        const { run } = useRequest<UserInfoType>(() =>
          httpPost('/auth/login', {}, { code }, { noToken: true }),
        )
        const loginRes = await run()

        // 设置 token 有效期 12 小时
        tokenExpireTime.value = dayjs().add(12, 'hour').format('YYYY-MM-DD HH:mm:ss')

        userInfo.value = {
          ...loginRes,
          avatarUrl: loginRes.avatarUrl ?? INIT_STATE.avatarUrl,
          nickname: loginRes.nickname ?? INIT_STATE.nickname,
        }
      } catch (error) {
        console.log('登录失败')
      }
    }

    /** 获取用户信息，此Api每次都会授权，只在新用户调用 */
    const getUserInfo = () => {
      uni.getUserProfile({
        desc: '为了提供个性化的体验',
        lang: 'zh_CN',
        success: (res) => {
          console.log('getUserProfile', res)
        },
        fail: (error) => {
          console.log('getUserProfile 调用失败', error)
        },
      })
    }

    /** 更新用户信息 */
    const updateUserInfo = async (value: Partial<UserInfoType>) => {
      const { run } = useRequest<UserInfoType>(() =>
        httpPost('/auth/updateUserInfo', {
          ...value,
          userId: userInfo.value.userId,
        }),
      )
      run()
    }

    return {
      userInfo,
      isLoggedIn,
      tokenExpireTime,
      setUserInfo,
      clearUserInfo,
      uniLogin,
      getUserInfo,
    }
  },
  {
    persist: true,
  },
)
