import { effect } from './effect.js'
import { reactive } from './reactive.js'

const obj = reactive({
  a: 1,
  b: 2
})

effect(() => {
  console.log(`obj.a的最新值是${obj.a}`)
})
effect(() => {
  console.log(`obj.b的最新值是${obj.b}`)
})

obj.a++


obj.b++
obj.b++
obj.b++
obj.b++


const obj1 = reactive({
  c: 3
})
effect(() => {
  console.log(`obj1.c的最新值是${obj1.c}`)
})
obj1.c++
