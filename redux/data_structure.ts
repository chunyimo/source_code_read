// redux 相关的数据结构
enhancer: (createStore) => (preState, reducer) => {
  // 执行createStore(preState, reducer) 获取原始store
  // 构建新的dispatch
  // 用新的dispatch 取代 原始store中的dispatch，构建新的store，并返回新的store
}

applyMiddleware: (middlewares) => (createStore) => (preState, reducer) => {

}

/*
redux 几个重要的api：
  applyMiddleware
  createStore
  compose
*/

/*
react-redux 几个重要的api
  useSelector
  useDispatch
  useStore
*/