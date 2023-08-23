let product = {
  price: 10,
  quantity: 2
}

const productProxy = new Proxy(product, {
  get(target, key, receiver) {
    return Reflect.get(target, key, receiver) 
    // 为什么要用反射 
    // 因为使用反射的 receiver 代表getter的this，
    // this就是未被代理的对象，要知道，访问未被代理的对象是不会触发getter
    // 而且 proxy的默认行为就是用的 reflect
    
    // 参见 ./2.js
  
  
  
  },

  set(target, key, value) {
    target[key] = value
    effect()
    return true
  }
})

let total = 0

let effect = () => {
  total = productProxy.price * productProxy.quantity
}

effect()

console.log(`总价格：${total}`)
productProxy.quantity = 3
console.log(`总价格：${total}`)

// 为什么要用


