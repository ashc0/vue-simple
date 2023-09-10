export let activeEffect = null

const effectStack = [] // 为了应对嵌套的effect，需要一个栈来存储effect，这样就能保证能够恢复到上一个effect

export const bucket = new WeakMap()

export const effect = (fn, options) => {
  const effect = createEffect(fn, options)

  if (!options?.lazy) {
    effect()
  }

  return effect
}

function createEffect(fn, options) {
  const effect = function reactiveEffect() {
    cleanup(effect)
    try {
      activeEffect = effect
      effectStack.push(effect) // 放入栈顶 确保如果在 fn 中如果有effect运行，那么等到effect运行完毕后，能够恢复到当前的effect
      return fn()
    } finally {
      effectStack.pop() // 出栈 让栈的状态回归到之前的状态
      activeEffect = effectStack[effectStack.length - 1] // 恢复到上一个状态
    }
  }

  // 将调度器挂载到 effect 上，这样在 trigger 时，用户就可以根据 effect.options 的调度器来调度
  effect.options = options
  effect.deps = []

  return effect
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

  const effectsToRun = new Set()

  effects &&
    effects.forEach(effect => {
      // 当effect中修改了依赖的响应式数据 避免无限递归
      if (effect !== activeEffect) {
        effectsToRun.add(effect)
      }
    })

  // 之所以要这样包装一下而不是直接遍历effect是本身，是因为触发effect会再度触发依赖收集，让原始effectsSet添加新元素，这样会导致死循环。所以创建一个副本，遍历副本，触发副本中的effect，这样就不会影响原始的effectsSet了。
  // 而之所以要再度依赖收集，是为了每次都能拿到最新的依赖关系
  effectsToRun.forEach(effectFn => {
    // 如果一个 effectFn 存在调度器，那么就调用调度器，并将 effectFn 传入
    if (effectFn.options?.scheduler) {
      effectFn.options.scheduler(effectFn)
    } else {
      effectFn()
    }
  })
}
