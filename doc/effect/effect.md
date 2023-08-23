## effect

```ts
function effect<T = any>(
  fn: () => T,
  options?: ReactiveEffectOptions
): ReactiveEffectRunner {}
```

如果 fn 是 `ReactiveEffectRunner` 类型，并且其 effect 属性为真值，给fn二度赋值为 `fn.effect.fn`

创建 `_effect`为一个 `ReactiveEffect`实例，将`fn`作为constructor的参数传入

如果有 options （待续）

如果没有options或者options.lazy为falsy，则调用 `_effect.run()`

创建runner为`ReactiveEffectRunner` 类型，值为 `_effect.run.bind(_effect)`