## 原理概述

> lazy 接受一个返回 promise 的函数，在首次挂在时会处理这个函数。
> 一般而言，首次处理，该 promise 仍旧时 pending 状态，抛出这个 promise。
> Suspense 通过 componentDidCatch 可以捕获到这个 promise，可以给这个 promise
> 添加 onResolve 方法，等待 resolve 是通过设置 setState 进行更新。
