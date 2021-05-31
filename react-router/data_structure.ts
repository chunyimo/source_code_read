// router 相关的数据结构
/* interface

interface History {
  readonly attribute unsigned long length;
  attribute ScrollRestoration scrollRestoration;
  readonly attribute any state;
  void go(optional long delta = 0);
  void back();
  void forward();
  void pushState(any data, DOMString title, optional DOMString? url = null);
  void replaceState(any data, DOMString title, optional DOMString? url = null);
};

*/

/* 相关事件

 1. popstate: 
    何时触发？通过浏览器导航站点；或者以编程的方式遍历历史记录（如go，back，forward）
    Note: pushState 和 replaceState不会触发该事件

 2. hashchange
    window.location.hash 改变时就会触发该事件

*/

/* 相关对象 Location

  Note: 调用location.assign() 方法时需要给完整的路径，包括协议，
  Note：否则只会拼接在当前路径的后面，导致与预期不相符。

  Note：调用location.replace() 可以传入boolean值，为true时，
  Note：表示一定从服务端请求，不使用缓存

  Note: 可以直接对location赋值url string，进行跳转

  Note：可以设置location.search 发起请求

*/

/* 相关对象 history lib Location

 export interfacr Loaction {
   pathname: string;
   search：string;
   hash: stringj;
   state: object | null;
   key: string;
 }

*/