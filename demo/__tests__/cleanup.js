import { effect } from '../effect.js'
import { reactive } from '../reactive.js'

const obj = reactive({
  bool: true,
  text: '123'
})

effect(() => {
  console.log(`lalala${obj.bool ? obj.text : ''}`)
})


obj.text = '456'

obj.bool = false

obj.text = '789'

obj.text = '101112'

obj.bool = true

obj.text = '121314'
