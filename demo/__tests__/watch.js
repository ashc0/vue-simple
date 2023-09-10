import { watch } from "../watch.js";
import { reactive } from "../reactive.js";

const obj = reactive({ foo: 1, bar: 2 })

watch(obj, (newValue) => {
  console.log(obj)
})

obj.foo = 2

watch(() => obj, () => {
  console.log(obj.bar)
})

obj.foo = 3
obj.bar = 3
