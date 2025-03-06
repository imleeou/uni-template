/** 登录接口返回数据类型 */
export interface UserInfoType {
  avatarUrl: string | null
  city: string | null
  country: string | null
  createTime: string
  gender: number
  language: string | null
  nickname: string | null
  province: string | null
  status: number
  token: string
  updateTime: string
  userId: number
  wechatOpenid: string
  wechatUnionid: string | null
}

/** list数据分页类型接口数据格式 */
export interface ListDataType<T = any> {
  list: T[]
  total: number
  pageNum: number
  pageSize: number
  pages: number
  size: number
}
