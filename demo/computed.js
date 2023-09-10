import { effect, trigger, track } from './effect.js'

export function computed(getter) {
  let _value
  let dirty = true

  // effectFn 的作用 1. 触发计算属性的依赖更新 2. 判断计算属性是否需要重新计算
  const effectFn = effect(getter, {
    lazy: true,
    scheduler() {
      if (dirty === false) {
        dirty = true
        trigger(obj, 'value')
      }
    }
  })

  const obj = {
    get value() {
      if (dirty) {
        _value = effectFn()
        dirty = false
      }
      track(obj, 'value')
      return _value
    }
  }

  return obj
}
