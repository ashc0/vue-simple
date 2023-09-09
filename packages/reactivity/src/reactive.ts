import { track, trigger } from './effect'

export const enum ReactiveFlags {
  SKIP = '__v_skip',
  IS_REACTIVE = '__v_isReactive',
  IS_READONLY = '__v_isReadonly',
  IS_SHALLOW = '__v_isShallow',
  RAW = '__v_raw'
}

type Target = {
  [ReactiveFlags.IS_REACTIVE]?: boolean
}

const proxyMap = new WeakMap<Target, any>()

export function reactive<T extends Object>(target: T): T {
  return defineReactiveObject(target) as any
}

function defineReactiveObject(target: Target) {
  if(proxyMap.has(target)) {
    return proxyMap.get(target)
  }

  // if(target[ReactiveFlags['IS_REACTIVE']]) {
  //   return target
  // }

  const proxy = new Proxy<typeof target>(target, {
    get(target, key, receiver) {
      if(key === ReactiveFlags['IS_REACTIVE']) {
        return true
      }

      track(target, key)
      const res = Reflect.get(target, key, receiver)

      if(Object.prototype.toString.call(res) === '[object Object]') {
        return reactive(res)
      }

      return res
    },

    set(target, key, value, receiver) {
      const res = Reflect.set(target, key, value, receiver)

      trigger(target, key)
      return res
    }
  })
  proxyMap.set(target, proxy)

  return proxy
}
