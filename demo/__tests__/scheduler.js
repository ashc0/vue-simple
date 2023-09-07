import { effect } from '../effect.js'
import { reactive } from '../reactive.js'

const obj = reactive({
  a: 1
})

// effect(() => {
//   console.log(obj.a)
// }, {
//   scheduler(fn) {
//     setTimeout(fn, 1000)
//   }
// })

const jobQueue = new Set()

const p = Promise.resolve()

let isFlushing = false

const flushJob = () => {
  if (isFlushing) return
  isFlushing = true

  p.then(() => jobQueue.forEach(job => job())).finally(
    () => (isFlushing = false)
  )
}

effect(
  () => {
    console.log(obj.a)
  },
  {
    scheduler(fn) {
      jobQueue.add(fn)
      flushJob()
    }
  }
)

obj.a++
obj.a++
