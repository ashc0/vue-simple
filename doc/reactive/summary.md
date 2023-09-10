1. 运行 effectFn 一定会触发依赖收集 一定会把 effectFn 作为 activeEffect。也就是 可以通过 activeEffect 来判断是不是有副作用函数在执行。
2. 依赖收集的标志就是是否存在 activeEffect
3. 响应式，说白了就是数据劫持+观察者模式。劫持 get 的时候依赖收集，劫持 set 的时候触发依赖。
4. 关于cleanup，这个是针对effect的。也就是effect函数触发时会自动cleanup，和响应式数据无关。