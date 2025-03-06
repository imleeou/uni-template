import dayjs from 'dayjs'
import { ref, onUnmounted } from 'vue'
import { useAppStore, useLoginStore } from '@/store'

/** 配置项类型 */
export interface WebSocketOptionsType {
  /** 心跳间隔，单位： 毫秒 */
  heartbeatInterval?: number
  /** 重连间隔，单位： 毫秒 */
  reconnectInterval?: number
  /** 最大重连次数 */
  maxReconnectTimes?: number
  /** 心跳包数据 */
  heartbeatData?: any
  /** 心跳包返回数据 */
  heartbeatResponse?: string
  /** 心跳超时检测时间，单位： 毫秒 */
  heartbeatTimeout?: number
  /** 接收消息回调 */
  onMessage?: (data: any) => void
}

/** socket状态枚举 */
export enum SocketStatusEnum {
  /** 已关闭 */
  CLOSED,
  /** 正在连接 */
  CONNECTING,
  /** 已连接 */
  OPEN,
}

/** ws消息类型枚举 */
export enum SocketMessageTypeEnum {
  /** 心跳 */
  HEARTBEAT = 'PING',
  /** 获取房间信息 */
  GET_ROOM_INFO = 'GET_ROOM_INFO',
  /** 标准模式转分 */
  TRANSFER = 'NORMAL_TRANSFER',
  /** 积分池模式转分 */
  POOL_TRANSFER = 'POINT_POOL_TRANSFER',
}

/** 发送消息数据类型 */
export interface SocketMessageDataType<T = any> {
  /** 消息类型 */
  messageType: SocketMessageTypeEnum
  /** 数据类型 json/string */
  dataType?: string
  /** 入参 */
  param?: T
}

/** 默认配置项 */
const DEFAULT_OPTIONS: WebSocketOptionsType = {
  heartbeatInterval: 3 * 60 * 1000,
  reconnectInterval: 20 * 1000,
  maxReconnectTimes: 5,
  heartbeatTimeout: 20 * 1000,
  heartbeatData: 'PING',
  heartbeatResponse: 'PONG',
}

const useWebSocket = (url: string, options: WebSocketOptionsType = {}) => {
  const appStore = useAppStore()
  /** 合并配置项 */
  let initialOptions = {
    ...DEFAULT_OPTIONS,
    ...options,
  }
  /** 心跳包发送计时器 */
  let heartbeatTimer: null | number = null
  /** 心跳包超时检测计时器 */
  let heartbeatTimeoutTimer: null | number = null
  /** 重连计时器 */
  let reconnectTimer: null | number = null
  /** 最新发送的一条message */
  const latestMessage = ref<SocketMessageDataType>()
  /** 待发送消息 */
  const messageQueue = ref<SocketMessageDataType[]>([])
  const loginStore = useLoginStore()
  /** ws 状态 */
  const socketStatus = ref<SocketStatusEnum>(SocketStatusEnum.CLOSED)
  const loading = ref(false)

  /** socket 连接 */
  const connect = (callback?: () => void) => {
    console.log('connect---->')
    loading.value = true
    // 创建 WebSocket 对象
    uni.connectSocket({
      url,
      header: {
        token: loginStore.userInfo?.token,
      },
      success: (res) => {
        console.log('uni.connectSocket ~ WebSocket 创建成功', res)
        socketStatus.value = SocketStatusEnum.CONNECTING
      },
      complete: () => {},
    })

    /** socket 连接成功 */
    uni.onSocketOpen((res) => {
      loading.value = false
      console.log('WebSocket 已连接', res, callback)
      socketStatus.value = SocketStatusEnum.OPEN
      // 重置重连次数
      initialOptions.maxReconnectTimes =
        initialOptions.maxReconnectTimes || DEFAULT_OPTIONS.maxReconnectTimes
      if (callback) {
        callback()
      }
      stopReconnect()
      console.log('连接成功了，该发送心跳了...')
      // 立即发送心跳包
      sendHeartbeat(true)
      sendMessageQueue()
    })

    /** socket 接收消息 */
    uni.onSocketMessage((res) => {
      console.log('WebSocket 接收消息', res)
      const message = res.data.includes('{') ? JSON.parse(res.data) : res.data
      sendHeartbeat()

      // 处理心跳包返回数据
      if (message === initialOptions.heartbeatResponse) return
      latestMessage.value = message
      // 触发自定义回调
      initialOptions.onMessage && initialOptions.onMessage(message)
    })

    /** socket 关闭 */
    uni.onSocketClose(() => {
      console.log('onSocketClose ~ 监听到 WebSocket 关闭')
      // 如果ws状态没有更改，说明非主动关闭，有重连次数，尝试重连
      if (
        socketStatus.value === SocketStatusEnum.OPEN &&
        initialOptions.maxReconnectTimes &&
        initialOptions.maxReconnectTimes > 0
      ) {
        reconnect()
      } else {
        close()
      }
    })

    /** socket 连接失败 */
    uni.onSocketError((res) => {
      console.log('WebSocket 连接失败', res)
      reconnect()
    })
  }

  /** socket 发送消息 */
  const send = (data: SocketMessageDataType) => {
    const msg = typeof data === 'string' ? data : JSON.stringify(data)
    // const msg = data
    if (socketStatus.value === SocketStatusEnum.OPEN) {
      uni.sendSocketMessage({
        data: msg,
        success: (res) => {
          console.log('WebSocket 发送消息成功', res, msg)
        },
      })
    } else {
      console.warn('发送消息检测到WebSocket 未连接，尝试连接')
      addToMessageQueue(data)
      connect()
    }
  }

  /** 添加消息到消息队列 */
  const addToMessageQueue = (data: SocketMessageDataType) => {
    // if (messageQueue.value.includes(data)) return
    messageQueue.value.push(data)
  }

  /** 发送消息队列中的消息 */
  const sendMessageQueue = () => {
    if (messageQueue.value.length) {
      messageQueue.value.forEach((msg) => {
        send(msg)
      })
    }
  }

  /** 发送心跳包
   * @param immediate 是否立即发送
   */
  const sendHeartbeat = (immediate = false) => {
    clearHeartbeatTimer()
    console.log('sendHeartbeat', socketStatus.value)
    if (socketStatus.value === SocketStatusEnum.OPEN) {
      if (immediate) {
        console.log('WebSocket 立即发送心跳包')
        send(initialOptions.heartbeatData)
      }

      heartbeatTimer = setInterval(() => {
        console.log('WebSocket 发送心跳包')
        send(initialOptions.heartbeatData)
        // 心跳包超时检测
        heartbeatTimeoutTimer = setTimeout(() => {
          console.log('WebSocket 心跳包超时')
          reconnect()
        }, initialOptions.heartbeatTimeout)
      }, initialOptions.heartbeatInterval)
    } else {
      console.warn('WebSocket 未连接，无法发送心跳包')
    }
  }

  /** 清除心跳包计时器 */
  const clearHeartbeatTimer = () => {
    if (heartbeatTimer) {
      clearInterval(heartbeatTimer)
      heartbeatTimer = null
    }
    if (heartbeatTimeoutTimer) {
      clearTimeout(heartbeatTimeoutTimer)
      heartbeatTimeoutTimer = null
    }
  }

  /** 重连 */
  const reconnect = () => {
    if (socketStatus.value === SocketStatusEnum.OPEN) {
      return
    }

    if (initialOptions.maxReconnectTimes && initialOptions.maxReconnectTimes > 0) {
      reconnectTimer = setTimeout(() => {
        console.log('WebSocket 尝试重连')
        initialOptions.maxReconnectTimes!--
        connect()
      }, initialOptions.reconnectInterval)
    } else {
      const now = dayjs().format('YYYY-MM-DD HH:mm:ss')
      console.log(`[${now}]WebSocket 重连次数达到上限`)
      close()
    }
  }

  /** 停止重连 */
  const stopReconnect = () => {
    if (reconnectTimer) {
      clearTimeout(reconnectTimer)
      reconnectTimer = null
    }
  }

  /** 断开连接，不会重连 */
  const close = () => {
    const now = dayjs().format('YYYY-MM-DD HH:mm:ss')
    console.log(`触发close方法：[${now}]WebSocket 即将断开连接`)
    if (socketStatus.value === SocketStatusEnum.OPEN) {
      socketStatus.value = SocketStatusEnum.CLOSED
      uni.closeSocket()
    }
    clearHeartbeatTimer()
    stopReconnect()
    initialOptions = {
      ...DEFAULT_OPTIONS,
      ...options,
    }
  }

  /** 组件销毁时销毁 socket 连接 */
  onUnmounted(() => {
    console.log('onUnmounted')
    // 清空消息队列
    messageQueue.value = []
    close()
  })

  return {
    connect,
    send,
    close,
    reconnect,
    loading,
    socketStatus,
    latestMessage,
  }
}

export type UseWebSocketType = ReturnType<typeof useWebSocket>

export default useWebSocket
