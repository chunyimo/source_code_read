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
// Router组件定义了一个上下文，上下文中location变量又该组件通过state维护。Router组件执行时，就会设置给history上设置监听方法，该方法会在调用时拿到最新的location，调用this.setState去更新state，从而触发更新。
// 当location改变时可以触发更新
// 在诸如Link可以更改的location的地方，调用history的push或者replace方法，从而触发listener。
```

## history

> > 见https://github.com/chunyimo/test-history/blob/main/src/history/flow.md

## react-redux

> > 见https://github.com/chunyimo/react-router
