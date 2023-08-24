import { effectMap, track } from './effect.mjs'

export const reactive = obj => {
  return new Proxy(obj, {
    get(target, key, reciever) {
      track(target, key)
      return Reflect.get(target, key, reciever)
    },

    set(target, key, value, reciever) {
      Reflect.set(target, key, value, reciever)
      effectMap
        .get(target)
        ?.get(key)
        ?.forEach(i => typeof i === 'function' && i())
      return true
    }
  })
}
