import { trigger, track } from './effect.js'

export const reactive = obj => {
  return new Proxy(obj, {
    get(target, key, reciever) {
      track(target, key)
      return Reflect.get(target, key, reciever)
    },

    set(target, key, value, reciever) {
      const res = Reflect.set(target, key, value, reciever)
      trigger(target, key)

      return res
    }
  })
}
