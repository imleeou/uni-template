import { CustomRequestOptions } from '@/interceptors/request'
import { httpGet, httpPost } from '@/utils/http'

type IUseRequestOptions<T> = {
  /** 是否立即执行 */
  immediate?: boolean
  /** 初始化数据 */
  initialData?: T
}

export type Methods = 'post' | 'get'

/**
 * usePost是一个定制化的请求钩子，用于处理异步请求和响应。
 * @param methods 请求方法，'post'或'get'。
 * @param url 请求地址。
 * @param options 包含请求选项的对象 {immediate, initialData}。
 * @param options.immediate 是否立即执行请求，默认为false。
 * @param options.initialData 初始化数据，默认为undefined。
 * @returns 返回一个对象{loading, error, data, run}，包含请求的加载状态、错误信息、响应数据和手动触发请求的函数。
 */
export default function usePost<T = any>(
  methods: Methods,
  url: string,
  options: IUseRequestOptions<T> = { immediate: false },
) {
  const loading = ref(false)
  const error = ref(false)
  const data = ref<T>(options.initialData)

  const func = (
    data?: Record<string, any>,
    options?: Omit<CustomRequestOptions, 'url' | 'data' | 'method'>,
  ) =>
    methods === 'post'
      ? httpPost(url, data, options?.query ?? {}, options)
      : httpGet(url, data, options)

  const run = async (
    data?: Record<string, any>,
    options?: Omit<CustomRequestOptions, 'url' | 'data' | 'method'>,
  ) => {
    loading.value = true
    return func(data, options)
      .then((res) => {
        data.value = res as IResData<T>
        error.value = false
        return data.value
      })
      .catch((err) => {
        error.value = err
        throw err
      })
      .finally(() => {
        loading.value = false
      })
  }

  options.immediate && run()
  return { loading, error, data, run }
}
