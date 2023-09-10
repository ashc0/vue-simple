import { computed } from "../computed.js";
import { effect } from "../effect.js";
import { reactive } from "../reactive.js";

const obj = reactive({ foo: 1, bar: 2 })

const comp = computed(() => {
  // console.log(obj.foo + obj.bar)
  return obj.foo + obj.bar
})

// obj.foo = 2

// obj.bar = 3

effect(() => {
  console.log(comp.value)
})

obj.foo = 3

obj.bar = 4