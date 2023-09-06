export let activeEffect = null

export const bucket = new WeakMap()

export const effect = fn => {
  const effectFn = () => {
    cleanup(effectFn)
    activeEffect = effectFn
    fn()
    activeEffect = null
  }
  effectFn.deps = []
  effectFn()
}

export function cleanup(effectFn) {
  effectFn.deps.forEach(dep => {
    dep.delete(effectFn)
  })

  effectFn.deps.length = 0
}

export const track = (target, key) => {
  if (!activeEffect) return
  if (!bucket.has(target)) {
    bucket.set(target, new Map())
  }
  let map = bucket.get(target)

  if (!map.has(key)) {
    map.set(key, new Set())
  }
  const deps = map.get(key)

  deps.add(activeEffect)

  activeEffect.deps.push(deps)
}

export const trigger = (target, key) => {
  const depsMap = bucket.get(target)
  if (!depsMap) return
  const effects = depsMap.get(key)

  const effectsToRun = new Set(effects)
  // 之所以要这样包装一下而不是直接遍历effect是本身，是因为触发effect会再度触发依赖收集，让原始effectsSet添加新元素，这样会导致死循环。所以创建一个副本，遍历副本，触发副本中的effect，这样就不会影响原始的effectsSet了。
  // 而之所以要再度依赖收集，是为了每次都能拿到最新的依赖关系
  effectsToRun.forEach(effectFn => effectFn())
}

// activeEffect = fn
