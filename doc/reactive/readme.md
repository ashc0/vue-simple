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

## scheduler 调度

背景：能够控制副作用函数的执行时机 次数 方式。

思路：在使用effect注册副作用函数时，可以传入一个options，其中包含了scheduler调度器，并且挂载到effectFn上以供用户调用。在trigger时，也就是effectFn调用时，会先判断是否有调度器，有的话就用调度器调用effectFn，没有的话就直接调用effectFn。

异步渲染的基本原理：利用调度器，调度执行时，将effectFn放入到一个set类型的jobQueue中，然后在下一个tick中执行这个jobQueue中的所有操作。

## computed 计算属性

背景：既是响应式数据，又是副作用函数。惰性执行（个人认为，既然computed作为计算属性，应该和值一样，不访问就相当于不存在），缓存计算结果。

实现：
1. 要有响应式数据的特征，就要有track和trigger的两个过程。在get value的时候触发track，在set value的时候触发trigger，也就是effect的scheduler中trigger。
2. 要有副作用函数的特征，就要有effect(getter)的过程。但是在这里，这个effect(getter)的作用只是 1. 告诉computed数据是否脏了 2. 触发computed的依赖更新。
3. 惰性执行，effect.options中添加lazy属性，为true时，不执行effectFn，返回effectFn。effectFn的调用完全由computed内部调度。
   1. effectFn的调度：在computed的value的getter中，判断是否脏了，如果脏了，就执行effectFn，然后将脏标记清除，更新缓存。如果没有脏，就不执行effectFn，直接返回上一次的结果。

## watch 侦听器

背景：可以接收一个值，也可以接收一个getter。如果接收的是reactive对象，应该监听到这个对象下所有的深层属性的变化。如果接收的是getter，应该监听到getter中所有的响应式数据的变化。

实现：
1. 利用 effect + scheduler 来实现。effect收集依赖，scheduler调度执行 callback。
2. 包装source，如果source是一个getter，那就 `() => getter()`。如果是响应式对象，那就 `() => traverse(source)`，traverse会深层遍历响应式对象的所有属性，确保能够监听到所有的属性变化，同时设置一个Set，应对循环引用的情况。
   1. 所以直接监听响应式对象可能会有性能问题
3. newValue oldValue。使用 lazy 来手动调度，这样就可以在调度时，获取到新旧值。初始化watch时，手动调用effectFn，来收集getter的依赖，并且得到oldValue。之后再scheduler中，每次触发，都会调用effectFn，来获取newValue，然后执行`callback(newValue, oldValue)`，然后将newValue赋值给oldValue。