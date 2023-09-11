type EffectFnOptions = {
  scheduler?: (fn: EffectFn) => void
  lazy?: boolean
}

type EffectFn = (() => void) & { deps: Effects[]; options: EffectFnOptions }

let activeEffect: EffectFn | undefined = undefined

const effectStack: Array<EffectFn> = []

type Effects = Set<EffectFn>

type DepsMap = Map<string | symbol, Effects>

const bucket = new WeakMap<object, DepsMap>()

export function effect(
  fn: Function,
  options: undefined | EffectFnOptions = {}
) {
  const effectFn: EffectFn = () => {
    cleanup(effectFn)
    try {
      activeEffect = effectFn
      effectStack.push(effectFn)
      return fn()
    } finally {
      effectStack.pop()
      activeEffect = effectStack[effectStack.length - 1]
    }
  }
  effectFn.deps = []
  effectFn.options = options

  if (!effectFn.options.lazy) {
    effectFn()
  }

  return effectFn
}

function cleanup(effect: EffectFn) {
  effect.deps.forEach(dep => {
    dep.delete(effect)
  })

  effect.deps.length = 0
}

export function track(target: object, key: symbol | string) {
  if (!activeEffect) return

  let depsMap = bucket.get(target)

  if (depsMap === undefined) {
    depsMap = new Map()
    bucket.set(target, depsMap)
  }

  let effect = depsMap.get(key)

  if (effect === undefined) {
    effect = new Set()
    depsMap.set(key, effect)
  }

  effect.add(activeEffect)

  activeEffect.deps.push(effect)
}

export function trigger(target: object, key: symbol | string) {
  const depsMap = bucket.get(target)

  if (depsMap && depsMap.has(key)) {
    const effects = depsMap.get(key)

    const effectsToRun: typeof effects = new Set()

    effects &&
      effects.forEach(effect => {
        if (activeEffect !== effect) {
          effectsToRun.add(effect)
        }
      })

    effectsToRun.forEach(effect => {
      if (effect.options?.scheduler) {
        effect.options.scheduler(effect)
      } else {
        effect()
      }
    })
  }
}
