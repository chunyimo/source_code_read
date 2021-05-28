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

function combineReducers(reducersObjMap) {
  // 获取所有的reducer，过滤掉非函数的的值
  let validReducers = {};
  for (let key of Object.keys(reducersObjMap)) {
    if (typeof reducersObjMap[key] !== 'function') {
      console.warn('invalid reducer');
    }
    validReducers[key] = reducersObjMap[key];
  }

  // 返回rootReducer
  return function rootReducer(state, action) {
    if (state === void 0) {
      state = {}
    }

    let nextState = {};
    let hasChanged = false;

    for (let key of Object.keys(validReducers)) {
      let preStateForKey = state[key];
      let nextStateForKey = validReducers[key](preStateForKey, action);

      nextState[key] = nextStateForKey;
      hasChanged = hasChanged || nextStateForKey !== preStateForKey;
    }

    return hasChanged ? nextState : state;
  }
}

// proxy 代理
function wrapMapToPropsFunc(mapToProps) {
  return function initProxySelect(dispatch) {
    const proxy = function mapToPropsProxy(stateOrDispatch, ownProps) {
      return proxy.dependsOnOwnProps? proxy.mapToProps(stateOrDispatch,ownProps): proxy.mapToProps(stateOrDispatch);
    }
    // 首次调用，执行自己定义的
    proxy.mapToProps = function detectFactoryAndVerigy(stateOrDispatch, ownProps) {
      // 非首次调用，执行传入的
      proxy.mapToProps = mapToProps
      // 计算出props
      let props = proxy(stateOrDispatch, ownProps);
      // 处理props
      if (typeof props === 'function') {
        proxy.mapToProps = props;
        props = proxy(stateOrDispatch, ownProps);
      }

      return props;
    }
    return proxy;
    
  }
}