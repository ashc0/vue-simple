## track

```ts
track(target: object, type: TrackOpTypes, key: unknown)
```

两个全局变量 shouldTrack = true  activeEffect = undefined

当两周皆为 真值 进入下一步
但是初次的时候activeEffect是undefined 所以不会接着走，也就是没有依赖要收集。
当调用了effect时，出现了依赖

跳转 effect.md