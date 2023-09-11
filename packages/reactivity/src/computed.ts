import { effect, track, trigger } from './effect'

export const computed = (fn: Function) => {
  let _value: any
  let dirty: boolean = true
  const effectFn = effect(fn, {
    lazy: true,
    scheduler() {
      if (!dirty) {
        dirty = true
        trigger(obj, 'value')
      }
    }
  })

  const obj = {
    get value() {
      if (dirty) {
        dirty = false
        _value = effectFn()
      }
      track(obj, 'value')
      return _value
    },

    get effect() {
      return effectFn
    }
  }

  return obj
}

