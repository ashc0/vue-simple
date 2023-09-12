import { effect } from './effect'

export function watch<T extends object>(
  obj: T,
  cb: (newValue?: T, oldValue?: T) => any
): any
export function watch<T extends object>(
  getter: () => T,
  cb: (newValue?: T, oldValue?: T) => any
): any

export function watch<T extends object>(
  source: T | (() => T),
  cb: (newValue?: T, oldValue?: T) => any
) {
  let oldValue: T | undefined
  let newValue: T

  let getter: () => T

  if (typeof source === 'function') {
    getter = () => source()
  } else if (typeof source === 'object' && source !== null) {
    getter = () => traverse(source)
  } else {
    getter = () => source
  }

  const effectFn = effect(getter, {
    lazy: true,
    scheduler() {
      newValue = effectFn() as T
      cb(newValue, oldValue)
      oldValue = newValue
    }
  })

  effectFn()
}

function traverse(obj: any, seen = new Set()): any {
  if (typeof obj !== 'object' || obj === null || seen.has(obj)) {
    return
  }

  seen.add(obj)

  Reflect.ownKeys(obj).forEach(key => traverse(obj[key], seen))
}
