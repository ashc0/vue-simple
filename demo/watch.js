import { effect } from './effect.js'

// 利用 scheduler 来实现 watch。watch 的实现原理是，当响应式数据发生变化时，触发 watch 的回调函数。而响应式数据的变化是通过 effect 来触发的，所以只要在 effect 中触发 watch 的回调函数即可。
export function watch(source, cb) {
  let getter
  if (typeof source === 'function') {
    getter = () => source() // () => reactiveObject  reactiveObject.prop += '123' 不会触发 callback
  } else {
    getter = () => traverse(source)
  }

  const effectFn = effect(
    () => {
      getter()
    },
    {
      scheduler(effectFn) {
        newValue = effectFn()
        cb(newValue, oldValue)
        oldValue = newValue
      },
      lazy: true // 手动调度 用来实现 oldValue newValue
    }
  )

  let oldValue, newValue

  oldValue = effectFn() // 初始化 oldValue
}

// 对于一个对象 只要它发生了任何一点变化，都应该触发watch。所以需要递归遍历对象，对对象中的每一个属性都递归进行依赖收集。
function traverse(value, seen = new Set()) {
  if (typeof value !== 'object' || value === null || seen.has(value)) return

  seen.add(value)

  Reflect.ownKeys(value).forEach(key => {
    traverse(Reflect.get(value, key), seen)
  })

  return value
}
