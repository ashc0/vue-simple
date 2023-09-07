## 基础响应式

使用Proxy代理target，在get时触发依赖收集，set时触发依赖更新。

使用effect注册副作用函数，并声明一个全局的WeakMap。注册的副作用函数被放到全局，并调用，调用时一旦触发了Proxy的get，就代表这个副作用函数依赖于此响应式数据，于是触发依赖收集。

依赖收集 track：读取被挂载到全局的副作用函数，放入全局的WeakMap中，这个WeakMap的数据结构：
```ts
type DepsMap = WeakMap<target: object, Map<key: string, Set<function>>>
```

依赖更新 trigger：根据发生变动的target和key，获取到 EffectSet，遍历执行副作用函数。

## cleanup 分支切换

背景：在一个副作用函数中，如果有多个响应式数据，并且一部分响应式数据是存在于分支当中的，那么当分支不满足条件时，就需要把此分支下的响应式数据的此副作用函数清除掉。避免此副作用函数被错误的触发。

思路：触发一个副作用之前，先把此副作用函数从所有响应式数据的依赖集合中清除掉，为此需要记录下每个副作用函数所关联的响应式数据。然后执行副作用函数，执行期间会触发收集依赖。这样就能确认此副作用函数的依赖情况是最新的。

实现：改写effect函数，将副作用函数用一个新函数再包装一层来代替成为新的副作用函数，并且在这个新函数上挂载一个依赖列表，其中存放EffectSet。同时改写track，将EffectSet放入这个副作用函数的以来列表中。新函数的内容是先清除依赖，再执行副作用函数，并在执行期间收集依赖。最后，改写trigger，cleanup其实就是先删除再添加，这样会造成无限循环，于是创造一个effectSet的副本，遍历这个副本，这样哪怕cleanup改变了原始的effectSet也不会对副本造成影响。

清除依赖 cleanup：遍历包装函数的依赖列表，每一项都是副作用函数依赖的每个响应式数据的依赖集合，从集合中删除此包装函数。最后清空依赖列表。

## effect 嵌套

背景：effect函数会触发fn的调用，如果fn中又有effect函数，那就会出现effect 嵌套。在内层的effect执行时，会变更全局的 activeEffect。内部的effect执行完之后之后，继续执行外部effectFn，执行过程中会触发依赖收集，取全局的activeEffect，这时候取到的就是内层的effect，造成依赖关系错误。

思路：关键就是要恢复之前上下文的activeEffect。

实现：创造一个stack，执行 effectFn 之前，将当前的 activeEffect 压入 stack；执行完之后，stack.pop()，此时栈顶就是之前的 activeEffect。

## effect 无限递归

背景：如果在effect中同时修改和依赖了同一个响应式数据，那么就会触发响应式数据的set，set中会触发trigger，trigger中会触发同一个effect，这样就会造成无限递归。

思路：判断引发trigger的是不是trigger本身的依赖源。在trigger中，遍历effectSet时，如果发现当前的effectFn就是activeEffect，那么就跳过这个effectFn。因为执行effectFn时，会将effectFn赋值给activeEffect，如果此时有activeEffect，就代表现在正在执行的trigger是由某一个effectFn触发的，那如果当前的activeEffect和trigger中会触发的effectFn是同一个，那就代表这个effectFn是由自己触发的，就跳过这个effectFn。

实现：在创建effectSet的副本时，不会把完整的effectSet放进来，而是会判断哪些effectFn是activeEffect，如果是，就不放进去。这样就能避免effectFn触发自己。