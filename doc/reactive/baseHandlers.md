## baseHandlers
```ts
export const mutableHandlers: ProxyHandler<object> = {
  get,
  set,
  deleteProperty,
  has,
  ownKeys
}
```

### get => createGetter(isReadonly = false, shallow = false)

根据isReadonly shallow。来设置访问对象上的ReactFlags属性时的返回值。（RAW的细节）

是否是数组？非readonly下：
是数组？直接返回某（待续）
不是数组且key是 hasOwnProperty？返回vue自己写的hasOwnProperty（待续）

使用Reflect拿到res

key是Symbol？看key是不是内建symbol：看key是否是不可追踪的key（`__proto__,__v_isRef,__isVue`）   如果以上返回值true 返回res

如果不是readonly。进行依赖收集`track(target, TrackOpTypes.GET, key)`

如果是shallow 返回res

如果res是ref？（解包）
 - 如果是数组并且key是整数，直接返回res
 - 不是数组，返回res.value （解包）

如果res是对象？（惰性）
 - 是否是只读，是的话用readonly包裹res并返回
 - 不是的话就用reactive包裹res并返回
 - 也就是对象嵌套的情况下，只有实际访问到了深层的对象的时候才会对深层对象处理而不是初次全部处理

最后，如果以上都不是，就返回res

转到effect/track