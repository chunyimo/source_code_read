const asyncFunctionMiddleware = (storeApi) => next => action => {
  if (typeof action === 'function') {
    return action(storeApi.dispatch, storeApi.getState);
  }
  return next(action);
}

function compose() {
  let funcs = [...arguments];
  funcs = funcs.filter(func => typeof func === 'function');

  if (funcs.length === 0) {
    return () => {

    }
  }
  if (funcs.length === 1) {
    return funcs[0];
  }

  return funcs.reduce((a,b) => {
    return function() {
      return a(b.apply(void 0, arguments));
    }
  })
}

function a(arg) {
  console.log('执行了',arg);
  console.log('a')
  return 'a'
}
function b(arg) {
  console.log('执行了',arg);
  console.log('b');
  return 'b';
}
function c(arg) {
  console.log('执行了',arg);
  console.log('c');
  return 'c';
}

const cfun = compose(a, b, c);


function applyMiddleware() {
  let middlewares = [...arguments];
  return function(createStore){
    return function(prestate, action) {
      let store = createStore(prestate, action);
      const storeApi = {
        getState: store.getState,
        dispatch: function(action) {
          _dispatch.apply(void 0, action);
        }
      }
      // middleware 从 (storeApi) => (next) => (action) => {} 变为 (next) => (action) => void;
      var chain = middlewares.map((mid) => {
        return mid(storeApi);
      })
      // middleware 从 (next) => (action) => void 变为 (action) => {}
      // 最后调用的是store.dispatch
      _dispatch = compose.apply(void 0, chain)(store.dispatch);
      return {
        ...store,
        dispatch: _dispatch,
      }
    }
  }
  
}