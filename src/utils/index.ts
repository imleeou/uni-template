import { pages, subPackages } from '@/pages.json'

const tabBar = undefined

export const getLastPage = () => {
  // getCurrentPages() 至少有1个元素，所以不再额外判断
  // const lastPage = getCurrentPages().at(-1)
  // 上面那个在低版本安卓中打包回报错，所以改用下面这个【虽然我加了src/interceptions/prototype.ts，但依然报错】
  const pages = getCurrentPages()
  return pages[pages.length - 1]
}

/** 判断当前页面是否是tabbar页  */
export const getIsTabbar = () => {
  if (!tabBar) {
    return false
  }
  if (!tabBar.list.length) {
    // 通常有tabBar的话，list不能有空，且至少有2个元素，这里其实不用处理
    return false
  }
  const lastPage = getLastPage()
  const currPath = lastPage.route
  return !!tabBar.list.find((e) => e.pagePath === currPath)
}

/**
 * 获取当前页面路由的 path 路径和 redirectPath 路径
 * path 如 ‘/pages/login/index’
 * redirectPath 如 ‘/pages/demo/base/route-interceptor’
 */
export const currRoute = () => {
  const lastPage = getLastPage()
  const currRoute = (lastPage as any).$page
  // console.log('lastPage.$page:', currRoute)
  // console.log('lastPage.$page.fullpath:', currRoute.fullPath)
  // console.log('lastPage.$page.options:', currRoute.options)
  // console.log('lastPage.options:', (lastPage as any).options)
  // 经过多端测试，只有 fullPath 靠谱，其他都不靠谱
  const { fullPath } = currRoute as { fullPath: string }
  // console.log(fullPath)
  // eg: /pages/login/index?redirect=%2Fpages%2Fdemo%2Fbase%2Froute-interceptor (小程序)
  // eg: /pages/login/index?redirect=%2Fpages%2Froute-interceptor%2Findex%3Fname%3Dfeige%26age%3D30(h5)
  return getUrlObj(fullPath)
}

const ensureDecodeURIComponent = (url: string) => {
  if (url.startsWith('%')) {
    return ensureDecodeURIComponent(decodeURIComponent(url))
  }
  return url
}
/**
 * 解析 url 得到 path 和 query
 * 比如输入url: /pages/login/index?redirect=%2Fpages%2Fdemo%2Fbase%2Froute-interceptor
 * 输出: {path: /pages/login/index, query: {redirect: /pages/demo/base/route-interceptor}}
 */
export const getUrlObj = (url: string) => {
  const [path, queryStr] = url.split('?')
  // console.log(path, queryStr)

  if (!queryStr) {
    return {
      path,
      query: {},
    }
  }
  const query: Record<string, string> = {}
  queryStr.split('&').forEach((item) => {
    const [key, value] = item.split('=')
    // console.log(key, value)
    query[key] = ensureDecodeURIComponent(value) // 这里需要统一 decodeURIComponent 一下，可以兼容h5和微信y
  })
  return { path, query }
}
/**
 * 得到所有的需要登录的pages，包括主包和分包的
 * 这里设计得通用一点，可以传递key作为判断依据，默认是 needLogin, 与 route-block 配对使用
 * 如果没有传 key，则表示所有的pages，如果传递了 key, 则表示通过 key 过滤
 */
export const getAllPages = (key = 'needLogin') => {
  // 这里处理主包
  const mainPages = [
    ...pages
      .filter((page) => !key || page[key])
      .map((page) => ({
        ...page,
        path: `/${page.path}`,
      })),
  ]
  // 这里处理分包
  const subPages: any[] = []
  subPackages.forEach((subPageObj) => {
    // console.log(subPageObj)
    const { root } = subPageObj

    subPageObj.pages
      .filter((page) => !key || page[key])
      .forEach((page: { path: string } & Record<string, any>) => {
        subPages.push({
          ...page,
          path: `/${root}/${page.path}`,
        })
      })
  })
  const result = [...mainPages, ...subPages]
  // console.log(`getAllPages by ${key} result: `, result)
  return result
}

/**
 * 得到所有的需要登录的pages，包括主包和分包的
 * 只得到 path 数组
 */
export const getNeedLoginPages = (): string[] => getAllPages('needLogin').map((page) => page.path)

/**
 * 得到所有的需要登录的pages，包括主包和分包的
 * 只得到 path 数组
 */
export const needLoginPages: string[] = getAllPages('needLogin').map((page) => page.path)

// 获取当前页面的完整路径（带参数）
export function getCurrentFullPath() {
  const currentPage = getLastPage()

  // 获取路径
  const route = currentPage.route
  // 获取参数对象
  const options = (currentPage as any).options
  // 构建完整路径
  let fullPath = `/${route}`
  console.log('[ fullPath ] >', fullPath, route, options)
  const queryParams = Object.keys(options)
    .map((key) => `${key}=${options[key]}`)
    .join('&')
  console.log('[ queryParams ] >', queryParams)
  if (queryParams) {
    fullPath += `?${queryParams}`
  }

  return fullPath
}

/** 将url中的参数转为对象 */
export function parseQueryString(queryString: string) {
  const params = {}
  const pairs = queryString.split('&')

  pairs.forEach((pair) => {
    const [key, value] = pair.split('=')
    if (key) {
      params[decodeURIComponent(key)] = decodeURIComponent(value || '')
    }
  })

  return params
}

/** 获取数字 1-9 对应的汉字 */
export function getNumberToChinese(num: number) {
  const chineseNum = ['一', '二', '三', '四', '五', '六', '七', '八', '九']
  return chineseNum[num - 1]
}

/**
 * 判断环境是否是H5
 */
export const isH5 = (() => {
  let isH5 = false
  // #ifdef H5
  isH5 = true
  // #endif
  return isH5
})()

/**
 * 否是数值
 * @param {*} value
 */
export function isNumber(value: any): value is number {
  return getType(value) === 'number'
}

/**
 * @description 检查值是否不为空
 * @param value 值
 * @return {Boolean} 是否不为空
 */
export const isDef = <T>(value: T): value is NonNullable<T> => value !== undefined && value !== null

/**
 * 获取目标原始类型
 * @param target 任意类型
 * @returns {string} type 数据类型
 */
export function getType(target: unknown): string {
  // 得到原生类型
  const typeStr = Object.prototype.toString.call(target)
  // 拿到类型值
  const match = typeStr.match(/\[object (\w+)\]/)
  const type = match && match.length ? match[1].toLowerCase() : ''
  // 类型值转小写并返回
  return type
}

/**
 * 检查给定值是否为数组。
 * @param {any} value 要检查的值
 * @returns {boolean} 如果是数组则返回 true，否则返回 false
 */
export function isArray(value: any): value is Array<any> {
  // 如果 Array.isArray 函数可用，直接使用该函数检查
  if (typeof Array.isArray === 'function') {
    return Array.isArray(value)
  }
  // 否则，使用对象原型的 toString 方法进行检查
  return Object.prototype.toString.call(value) === '[object Array]'
}

/**
 * 检查给定值是否为字符串。
 * @param {unknown} value 要检查的值
 * @returns {value is string} 如果是字符串则返回 true，否则返回 false
 */
export function isString(value: unknown): value is string {
  return getType(value) === 'string'
}

/**
 * @description 判断target是否对象
 * @param value
 * @return {boolean}
 */
export function isObj(value: any): value is object {
  return Object.prototype.toString.call(value) === '[object Object]' || typeof value === 'object'
}

export type RectResultType<T extends boolean> = T extends true ? UniApp.NodeInfo[] : UniApp.NodeInfo

/**
 * 获取节点信息
 * @param selector 节点选择器 #id,.class
 * @param all 是否返回所有 selector 对应的节点
 * @param scope 作用域（支付宝小程序无效）
 * @param useFields 是否使用 fields 方法获取节点信息
 * @returns 节点信息或节点信息数组
 */
export function getRect<T extends boolean>(
  selector: string,
  all: T,
  scope?: any,
  useFields?: boolean,
): Promise<RectResultType<T>> {
  return new Promise<RectResultType<T>>((resolve, reject) => {
    let query: UniNamespace.SelectorQuery | null = null
    if (scope) {
      query = uni.createSelectorQuery().in(scope)
    } else {
      query = uni.createSelectorQuery()
    }

    const method = all ? 'selectAll' : 'select'

    const callback = (rect: UniApp.NodeInfo | UniApp.NodeInfo[]) => {
      if (all && isArray(rect) && rect.length > 0) {
        resolve(rect as RectResultType<T>)
      } else if (!all && rect) {
        resolve(rect as RectResultType<T>)
      } else {
        reject(new Error('No nodes found'))
      }
    }

    if (useFields) {
      query[method](selector).fields({ size: true, node: true }, callback).exec()
    } else {
      query[method](selector).boundingClientRect(callback).exec()
    }
  })
}

/**
 * 将驼峰命名转换为短横线命名。
 * @param {string} word 待转换的词条
 * @returns {string} 转换后的结果
 */
export function kebabCase(word: string): string {
  // 使用正则表达式匹配所有大写字母，并在前面加上短横线，然后转换为小写
  const newWord: string = word
    .replace(/[A-Z]/g, function (match) {
      return '-' + match
    })
    .toLowerCase()

  return newWord
}

/**
 * 将外部传入的样式格式化为可读的 CSS 样式。
 * @param {object | object[]} styles 外部传入的样式对象或数组
 * @returns {string} 格式化后的 CSS 样式字符串
 */
export function objToStyle(styles: Record<string, any> | Record<string, any>[]): string {
  // 如果 styles 是数组类型
  if (isArray(styles)) {
    // 使用过滤函数去除空值和 null 值的元素
    // 对每个非空元素递归调用 objToStyle，然后通过分号连接
    return styles
      .filter(function (item) {
        return item != null && item !== ''
      })
      .map(function (item) {
        return objToStyle(item)
      })
      .join(';')
  }

  if (isString(styles)) {
    return styles
  }

  // 如果 styles 是对象类型
  if (isObj(styles)) {
    // 使用 Object.keys 获取所有属性名
    // 使用过滤函数去除值为 null 或空字符串的属性
    // 对每个属性名和属性值进行格式化，通过分号连接
    return Object.keys(styles)
      .filter(function (key) {
        return styles[key] != null && styles[key] !== ''
      })
      .map(function (key) {
        // 使用 kebabCase 函数将属性名转换为 kebab-case 格式
        // 将属性名和属性值格式化为 CSS 样式的键值对
        return [kebabCase(key), styles[key]].join(':')
      })
      .join(';')
  }
  // 如果 styles 不是对象也不是数组，则直接返回
  return ''
}
