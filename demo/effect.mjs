export let activeEffect = null

export const effectMap = new WeakMap()

export const effect = fn => {
  activeEffect = fn
  fn()
  activeEffect = null
}

export const track = (target, key) => {
  if (!activeEffect) return
  if (!effectMap.has(target)) {
    effectMap.set(target, new Map())
  }
  let map = effectMap.get(target)

  if (!map.has(key)) {
    map.set(key, new Set())
  }
  let set = map.get(key)

  set.add(activeEffect)
}

// activeEffect = fn
