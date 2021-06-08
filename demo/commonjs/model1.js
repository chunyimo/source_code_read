const {a, aObj} = require('./model2');
console.log(a);
console.log(aObj);

setTimeout(() => {
  console.log(a)
  console.log(aObj)
}, 2000);