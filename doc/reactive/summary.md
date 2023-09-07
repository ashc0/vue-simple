1. 运行 effectFn 一定会触发依赖收集 一定会把 effectFn 作为 activeEffect。也就是 可以通过 activeEffect 来判断是不是有副作用函数在执行。
2. 依赖收集的标志就是是否存在 activeEffect