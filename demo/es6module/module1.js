import {a} from './module2.js';
console.log(a); // a
setTimeout(() => {
  console.log(a); // reset a
}, 2000)