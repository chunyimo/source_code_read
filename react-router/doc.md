# router

> 主要涉及三个 lib：history, react-router, react-router-dom, 三者的联系如下

```ts
import { Router } from 'react-router';
import { createBrowserHistory as createHistory } from 'history';
class BrowserRouter extends React.Component {
  history = createHistory(this.props);

  render() {
    return <Router history={this.history} children={this.props.children} />;
  }
}
// BrowserRouter由react-router-dom 暴露出去
// 在Router组件中，调用了history的listen方法添加监听器回调，在回调中调用this.setState，
// 当location改变时可以触发更新
// 在诸如Link可以更改的location的地方，调用history的push或者replace方法，从而触发listener。
```

## history

> > 见https://github.com/chunyimo/test-history/blob/main/src/history/flow.md

## react-redux

> > 见https://github.com/chunyimo/react-router
