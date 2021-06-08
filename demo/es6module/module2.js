export let a = 'a'
console.log('after export');
setTimeout(() => {
  console.log('module2 reset a');
  a = 'reset a';
})