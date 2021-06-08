const exportObj = {
  a: 'a',
  aObj: {
    aobj: 'aobj'
  }
}
module.exports = exportObj;

console.log('after exports')
setTimeout(() => {
  console.log('reset a');
  exportObj.a = 'xixix';
  exportObj.aObj.aobj = 'reset aobj';
})
