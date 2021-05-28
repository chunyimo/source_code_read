(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined'
    ? factory(exports)
    : typeof define === 'function' && define.amd
    ? define(['exports'], factory)
    : ((global =
        typeof globalThis !== 'undefined' ? globalThis : global || self),
      factory((global.Redux = {})));
})(this, function (exports) {
  'use strict';

  var $$observable = /* #__PURE__ */ (function () {
    return (
      (typeof Symbol === 'function' && Symbol.observable) || '@@observable'
    );
  })();

  /**
   * These are private action types reserved by Redux.
   * For any unknown actions, you must return the current state.
   * If the current state is undefined, you must return the initial state.
   * Do not reference these action types directly in your code.
   */
  var randomString = function randomString() {
    return Math.random().toString(36).substring(7).split('').join('.');
  };

  var ActionTypes = {
    INIT: '@@redux/INIT' + /* #__PURE__ */ randomString(),
    REPLACE: '@@redux/REPLACE' + /* #__PURE__ */ randomString(),
    PROBE_UNKNOWN_ACTION: function PROBE_UNKNOWN_ACTION() {
      return '@@redux/PROBE_UNKNOWN_ACTION' + randomString();
    },
  };

  /**
   * @param obj The object to inspect.
   * @returns True if the argument appears to be a plain object.
   */
  function isPlainObject(obj) {
    if (typeof obj !== 'object' || obj === null) return false;
    var proto = obj;

    while (Object.getPrototypeOf(proto) !== null) {
      proto = Object.getPrototypeOf(proto);
    }

    return Object.getPrototypeOf(obj) === proto;
  }

  function kindOf(val) {
    var typeOfVal = typeof val;

    {
      // Inlined / shortened version of `kindOf` from https://github.com/jonschlinkert/kind-of
      function miniKindOf(val) {
        if (val === void 0) return 'undefined';
        if (val === null) return 'null';
        var type = typeof val;

        switch (type) {
          case 'boolean':
          case 'string':
          case 'number':
          case 'symbol':
          case 'function': {
            return type;
          }
        }

        if (Array.isArray(val)) return 'array';
        if (isDate(val)) return 'date';
        if (isError(val)) return 'error';
        var constructorName = ctorName(val);

        switch (constructorName) {
          case 'Symbol':
          case 'Promise':
          case 'WeakMap':
          case 'WeakSet':
          case 'Map':
          case 'Set':
            return constructorName;
        } // other

        return type.slice(8, -1).toLowerCase().replace(/\s/g, '');
      }

      function ctorName(val) {
        return typeof val.constructor === 'function'
          ? val.constructor.name
          : null;
      }

      function isError(val) {
        return (
          val instanceof Error ||
          (typeof val.message === 'string' &&
            val.constructor &&
            typeof val.constructor.stackTraceLimit === 'number')
        );
      }

      function isDate(val) {
        if (val instanceof Date) return true;
        return (
          typeof val.toDateString === 'function' &&
          typeof val.getDate === 'function' &&
          typeof val.setDate === 'function'
        );
      }

      typeOfVal = miniKindOf(val);
    }

    return typeOfVal;
  }

  function createStore(reducer, preloadedState, enhancer) {
    var _store;

    if (
      (typeof preloadedState === 'function' &&
        typeof enhancer === 'function') ||
      (typeof enhancer === 'function' && typeof arguments[3] === 'function')
    ) {
      throw new Error(
        'It looks like you are passing several store enhancers to ' +
          'createStore(). This is not supported. Instead, compose them ' +
          'together to a single function. See https://redux.js.org/tutorials/fundamentals/part-4-store#creating-a-store-with-enhancers for an example.'
      );
    }

    if (
      typeof preloadedState === 'function' &&
      typeof enhancer === 'undefined'
    ) {
      enhancer = preloadedState;
      preloadedState = undefined;
    }

    if (typeof enhancer !== 'undefined') {
      if (typeof enhancer !== 'function') {
        throw new Error(
          "Expected the enhancer to be a function. Instead, received: '" +
            kindOf(enhancer) +
            "'"
        );
      }
      // ! enhancer
      return enhancer(createStore)(reducer, preloadedState);
    }

    if (typeof reducer !== 'function') {
      throw new Error(
        "Expected the root reducer to be a function. Instead, received: '" +
          kindOf(reducer) +
          "'"
      );
    }

    var currentReducer = reducer;
    var currentState = preloadedState;
    var currentListeners = [];
    var nextListeners = currentListeners;
    var isDispatching = false;
    /**
     * This makes a shallow copy of currentListeners so we can use
     * nextListeners as a temporary list while dispatching.
     *
     * This prevents any bugs around consumers calling
     * subscribe/unsubscribe in the middle of a dispatch.
     */

    function ensureCanMutateNextListeners() {
      if (nextListeners === currentListeners) {
        nextListeners = currentListeners.slice();
      }
    }
    /**
     * Reads the state tree managed by the store.
     *
     * @returns The current state tree of your application.
     */

    function getState() {
      if (isDispatching) {
        throw new Error(
          'You may not call store.getState() while the reducer is executing. ' +
            'The reducer has already received the state as an argument. ' +
            'Pass it down from the top reducer instead of reading it from the store.'
        );
      }

      return currentState;
    }
    /**
     * Adds a change listener. It will be called any time an action is dispatched,
     * and some part of the state tree may potentially have changed. You may then
     * call `getState()` to read the current state tree inside the callback.
     *
     * You may call `dispatch()` from a change listener, with the following
     * caveats:
     *
     * 1. The subscriptions are snapshotted just before every `dispatch()` call.
     * If you subscribe or unsubscribe while the listeners are being invoked, this
     * will not have any effect on the `dispatch()` that is currently in progress.
     * However, the next `dispatch()` call, whether nested or not, will use a more
     * recent snapshot of the subscription list.
     *
     * 2. The listener should not expect to see all state changes, as the state
     * might have been updated multiple times during a nested `dispatch()` before
     * the listener is called. It is, however, guaranteed that all subscribers
     * registered before the `dispatch()` started will be called with the latest
     * state by the time it exits.
     *
     * @param listener A callback to be invoked on every dispatch.
     * @returns A function to remove this change listener.
     */

    function subscribe(listener) {
      if (typeof listener !== 'function') {
        throw new Error(
          "Expected the listener to be a function. Instead, received: '" +
            kindOf(listener) +
            "'"
        );
      }

      if (isDispatching) {
        throw new Error(
          'You may not call store.subscribe() while the reducer is executing. ' +
            'If you would like to be notified after the store has been updated, subscribe from a ' +
            'component and invoke store.getState() in the callback to access the latest state. ' +
            'See https://redux.js.org/api/store#subscribelistener for more details.'
        );
      }

      var isSubscribed = true;
      ensureCanMutateNextListeners();
      nextListeners.push(listener);
      return function unsubscribe() {
        if (!isSubscribed) {
          return;
        }

        if (isDispatching) {
          throw new Error(
            'You may not unsubscribe from a store listener while the reducer is executing. ' +
              'See https://redux.js.org/api/store#subscribelistener for more details.'
          );
        }

        isSubscribed = false;
        ensureCanMutateNextListeners();
        var index = nextListeners.indexOf(listener);
        nextListeners.splice(index, 1);
        currentListeners = null;
      };
    }
    /**
     * Dispatches an action. It is the only way to trigger a state change.
     *
     * The `reducer` function, used to create the store, will be called with the
     * current state tree and the given `action`. Its return value will
     * be considered the **next** state of the tree, and the change listeners
     * will be notified.
     *
     * The base implementation only supports plain object actions. If you want to
     * dispatch a Promise, an Observable, a thunk, or something else, you need to
     * wrap your store creating function into the corresponding middleware. For
     * example, see the documentation for the `redux-thunk` package. Even the
     * middleware will eventually dispatch plain object actions using this method.
     *
     * @param action A plain object representing “what changed”. It is
     * a good idea to keep actions serializable so you can record and replay user
     * sessions, or use the time travelling `redux-devtools`. An action must have
     * a `type` property which may not be `undefined`. It is a good idea to use
     * string constants for action types.
     *
     * @returns For convenience, the same action object you dispatched.
     *
     * Note that, if you use a custom middleware, it may wrap `dispatch()` to
     * return something else (for example, a Promise you can await).
     */

    function dispatch(action) {
      if (!isPlainObject(action)) {
        throw new Error(
          "Actions must be plain objects. Instead, the actual type was: '" +
            kindOf(action) +
            "'. You may need to add middleware to your store setup to handle dispatching other values, such as 'redux-thunk' to handle dispatching functions. See https://redux.js.org/tutorials/fundamentals/part-4-store#middleware and https://redux.js.org/tutorials/fundamentals/part-6-async-logic#using-the-redux-thunk-middleware for examples."
        );
      }

      if (typeof action.type === 'undefined') {
        throw new Error(
          'Actions may not have an undefined "type" property. You may have misspelled an action type string constant.'
        );
      }

      if (isDispatching) {
        throw new Error('Reducers may not dispatch actions.');
      }

      try {
        isDispatching = true;
        currentState = currentReducer(currentState, action);
      } finally {
        isDispatching = false;
      }

      var listeners = (currentListeners = nextListeners);

      for (var i = 0; i < listeners.length; i++) {
        var listener = listeners[i];
        listener();
      }

      return action;
    }
    /**
     * Replaces the reducer currently used by the store to calculate the state.
     *
     * You might need this if your app implements code splitting and you want to
     * load some of the reducers dynamically. You might also need this if you
     * implement a hot reloading mechanism for Redux.
     *
     * @param nextReducer The reducer for the store to use instead.
     * @returns The same store instance with a new reducer in place.
     */

    function replaceReducer(nextReducer) {
      if (typeof nextReducer !== 'function') {
        throw new Error(
          "Expected the nextReducer to be a function. Instead, received: '" +
            kindOf(nextReducer)
        );
      } // TODO: do this more elegantly
      currentReducer = nextReducer; 
      // This action has a similar effect to ActionTypes.INIT.
      // Any reducers that existed in both the new and old rootReducer
      // will receive the previous state. This effectively populates
      // the new state tree with any relevant data from the old one.

      dispatch({
        type: ActionTypes.REPLACE,
      }); // change the type of the store by casting it to the new store

      return store;
    }
    /**
     * Interoperability point for observable/reactive libraries.
     * @returns A minimal observable of state changes.
     * For more information, see the observable proposal:
     * https://github.com/tc39/proposal-observable
     */

    function observable() {
      var _ref;

      var outerSubscribe = subscribe;
      return (
        (_ref = {
          /**
           * The minimal observable subscription method.
           * @param observer Any object that can be used as an observer.
           * The observer object should have a `next` method.
           * @returns An object with an `unsubscribe` method that can
           * be used to unsubscribe the observable from the store, and prevent further
           * emission of values from the observable.
           */
          subscribe: function subscribe(observer) {
            if (typeof observer !== 'object' || observer === null) {
              throw new Error(
                "Expected the observer to be an object. Instead, received: '" +
                  kindOf(observer) +
                  "'"
              );
            }

            function observeState() {
              var observerAsObserver = observer;

              if (observerAsObserver.next) {
                observerAsObserver.next(getState());
              }
            }

            observeState();
            var unsubscribe = outerSubscribe(observeState);
            return {
              unsubscribe: unsubscribe,
            };
          },
        }),
        (_ref[$$observable] = function () {
          return this;
        }),
        _ref
      );
    } 
    
    // When a store is created, an "INIT" action is dispatched so that every
    // reducer returns their initial state. This effectively populates
    // the initial state tree.
    dispatch({
      type: ActionTypes.INIT,
    });
    var store =
      ((_store = {
        dispatch: dispatch,
        subscribe: subscribe,
        getState: getState,
        replaceReducer: replaceReducer,
      }),
      (_store[$$observable] = observable),
      _store);
    return store;
  }

  /**
   * Prints a warning in the console if it exists.
   *
   * @param message The warning message.
   */
  function warning(message) {
    /* eslint-disable no-console */
    if (typeof console !== 'undefined' && typeof console.error === 'function') {
      console.error(message);
    }
    /* eslint-enable no-console */

    try {
      // This error was thrown as a convenience so that if you enable
      // "break on all exceptions" in your console,
      // it would pause the execution at this line.
      throw new Error(message);
    } catch (e) {} // eslint-disable-line no-empty
  }

  function getUnexpectedStateShapeWarningMessage(
    inputState,
    reducers,
    action,
    unexpectedKeyCache
  ) {
    var reducerKeys = Object.keys(reducers);
    var argumentName =
      action && action.type === ActionTypes.INIT
        ? 'preloadedState argument passed to createStore'
        : 'previous state received by the reducer';

    if (reducerKeys.length === 0) {
      return (
        'Store does not have a valid reducer. Make sure the argument passed ' +
        'to combineReducers is an object whose values are reducers.'
      );
    }

    if (!isPlainObject(inputState)) {
      return (
        'The ' +
        argumentName +
        ' has unexpected type of "' +
        kindOf(inputState) +
        '". Expected argument to be an object with the following ' +
        ('keys: "' + reducerKeys.join('", "') + '"')
      );
    }

    var unexpectedKeys = Object.keys(inputState).filter(function (key) {
      return !reducers.hasOwnProperty(key) && !unexpectedKeyCache[key];
    });
    unexpectedKeys.forEach(function (key) {
      unexpectedKeyCache[key] = true;
    });
    if (action && action.type === ActionTypes.REPLACE) return;

    if (unexpectedKeys.length > 0) {
      return (
        'Unexpected ' +
        (unexpectedKeys.length > 1 ? 'keys' : 'key') +
        ' ' +
        ('"' +
          unexpectedKeys.join('", "') +
          '" found in ' +
          argumentName +
          '. ') +
        'Expected to find one of the known reducer keys instead: ' +
        ('"' + reducerKeys.join('", "') + '". Unexpected keys will be ignored.')
      );
    }
  }

  function assertReducerShape(reducers) {
    Object.keys(reducers).forEach(function (key) {
      var reducer = reducers[key];
      var initialState = reducer(undefined, {
        type: ActionTypes.INIT,
      });

      if (typeof initialState === 'undefined') {
        throw new Error(
          'The slice reducer for key "' +
            key +
            '" returned undefined during initialization. ' +
            'If the state passed to the reducer is undefined, you must ' +
            'explicitly return the initial state. The initial state may ' +
            "not be undefined. If you don't want to set a value for this reducer, " +
            'you can use null instead of undefined.'
        );
      }

      if (
        typeof reducer(undefined, {
          type: ActionTypes.PROBE_UNKNOWN_ACTION(),
        }) === 'undefined'
      ) {
        throw new Error(
          'The slice reducer for key "' +
            key +
            '" returned undefined when probed with a random type. ' +
            ("Don't try to handle '" +
              ActionTypes.INIT +
              '\' or other actions in "redux/*" ') +
            'namespace. They are considered private. Instead, you must return the ' +
            'current state for any unknown actions, unless it is undefined, ' +
            'in which case you must return the initial state, regardless of the ' +
            'action type. The initial state may not be undefined, but can be null.'
        );
      }
    });
  }
  // reducers => (state, action) => 
  function combineReducers(reducers) {
    var reducerKeys = Object.keys(reducers);
    var finalReducers = {};
    // 先处理一下reducers，过滤非法的reducer
    for (var i = 0; i < reducerKeys.length; i++) {
      var key = reducerKeys[i];

      {
        if (typeof reducers[key] === 'undefined') {
          warning('No reducer provided for key "' + key + '"');
        }
      }

      if (typeof reducers[key] === 'function') {
        finalReducers[key] = reducers[key];
      }
    }

    var finalReducerKeys = Object.keys(finalReducers); 

    // This is used to make sure we don't warn about the same
    // keys multiple times.
    var unexpectedKeyCache;

    {
      unexpectedKeyCache = {};
    }

    var shapeAssertionError;

    try {
      assertReducerShape(finalReducers);
    } catch (e) {
      shapeAssertionError = e;
    }
    // 返回一个rootReducer
    return function combination(state, action) {
      if (state === void 0) {
        state = {};
      }

      if (shapeAssertionError) {
        throw shapeAssertionError;
      }

      {
        var warningMessage = getUnexpectedStateShapeWarningMessage(
          state,
          finalReducers,
          action,
          unexpectedKeyCache
        );

        if (warningMessage) {
          warning(warningMessage);
        }
      }

      var hasChanged = false;
      var nextState = {};

      for (var _i = 0; _i < finalReducerKeys.length; _i++) {
        var _key = finalReducerKeys[_i];
        var reducer = finalReducers[_key];
        var previousStateForKey = state[_key];
        var nextStateForKey = reducer(previousStateForKey, action);

        if (typeof nextStateForKey === 'undefined') {
          var actionType = action && action.type;
          throw new Error(
            'When called with an action of type ' +
              (actionType ? '"' + String(actionType) + '"' : '(unknown type)') +
              ', the slice reducer for key "' +
              _key +
              '" returned undefined. ' +
              'To ignore an action, you must explicitly return the previous state. ' +
              'If you want this reducer to hold no value, you can return null instead of undefined.'
          );
        }

        nextState[_key] = nextStateForKey;
        hasChanged = hasChanged || nextStateForKey !== previousStateForKey;
      }
      //? reducer 被移除的情况 
      hasChanged =
        hasChanged || finalReducerKeys.length !== Object.keys(state).length;
      return hasChanged ? nextState : state;
    };
  }

  function bindActionCreator(actionCreator, dispatch) {
    return function () {
      for (
        var _len = arguments.length, args = new Array(_len), _key = 0;
        _key < _len;
        _key++
      ) {
        args[_key] = arguments[_key];
      }

      return dispatch(actionCreator.apply(this, args));
    };
  }

  function bindActionCreators(actionCreators, dispatch) {
    if (typeof actionCreators === 'function') {
      return bindActionCreator(actionCreators, dispatch);
    }

    if (typeof actionCreators !== 'object' || actionCreators === null) {
      throw new Error(
        "bindActionCreators expected an object or a function, but instead received: '" +
          kindOf(actionCreators) +
          "'. " +
          'Did you write "import ActionCreators from" instead of "import * as ActionCreators from"?'
      );
    }

    var boundActionCreators = {};

    for (var key in actionCreators) {
      var actionCreator = actionCreators[key];

      if (typeof actionCreator === 'function') {
        boundActionCreators[key] = bindActionCreator(actionCreator, dispatch);
      }
    }

    return boundActionCreators;
  }

  function ownKeys(object, enumerableOnly) {
    var keys = Object.keys(object);

    if (Object.getOwnPropertySymbols) {
      var symbols = Object.getOwnPropertySymbols(object);

      if (enumerableOnly) {
        symbols = symbols.filter(function (sym) {
          return Object.getOwnPropertyDescriptor(object, sym).enumerable;
        });
      }

      keys.push.apply(keys, symbols);
    }

    return keys;
  }
  // 对象扩展符
  function _objectSpread2(target) {
    for (var i = 1; i < arguments.length; i++) {
      var source = arguments[i] != null ? arguments[i] : {};

      if (i % 2) {
        ownKeys(Object(source), true).forEach(function (key) {
          _defineProperty(target, key, source[key]);
        });
      } else if (Object.getOwnPropertyDescriptors) {
        Object.defineProperties(
          target,
          Object.getOwnPropertyDescriptors(source)
        );
      } else {
        ownKeys(Object(source)).forEach(function (key) {
          Object.defineProperty(
            target,
            key,
            Object.getOwnPropertyDescriptor(source, key)
          );
        });
      }
    }

    return target;
  }

  function _defineProperty(obj, key, value) {
    if (key in obj) {
      Object.defineProperty(obj, key, {
        value: value,
        enumerable: true,
        configurable: true,
        writable: true,
      });
    } else {
      obj[key] = value;
    }

    return obj;
  }

  function compose() {
    for (
      var _len = arguments.length, funcs = new Array(_len), _key = 0;
      _key < _len;
      _key++
    ) {
      funcs[_key] = arguments[_key];
    }

    if (funcs.length === 0) {
      // infer the argument type so it is usable in inference down the line
      return function (arg) {
        return arg;
      };
    }

    if (funcs.length === 1) {
      return funcs[0];
    }

    return funcs.reduce(function (a, b) {
      return function () {
        return a(b.apply(void 0, arguments));
      };
    });
  }
  /**
   * 该函数的目的是将所有的middleware compose成一个函数，
   * @returns 
   */
  // 返回值类型：(createStore) => (reducer, preloadedState) => {}
  function applyMiddleware() {
    for (
      var _len = arguments.length, middlewares = new Array(_len), _key = 0;
      _key < _len;
      _key++
    ) {
      middlewares[_key] = arguments[_key];
    }

    return function (createStore) {
      return function (reducer, preloadedState) {
        var store = createStore(reducer, preloadedState);

        var _dispatch = function dispatch() {
          throw new Error(
            'Dispatching while constructing your middleware is not allowed. ' +
              'Other middleware would not be applied to this dispatch.'
          );
        };

        var middlewareAPI = {
          getState: store.getState,
          dispatch: function dispatch(action) {
            for (
              var _len2 = arguments.length,
                args = new Array(_len2 > 1 ? _len2 - 1 : 0),
                _key2 = 1;
              _key2 < _len2;
              _key2++
            ) {
              args[_key2 - 1] = arguments[_key2];
            }

            return _dispatch.apply(void 0, [action].concat(args));
          },
        };
        // middleware 从 (storeApi) => (next) => (action) => {} 变为 (next) => (action) => void;
        var chain = middlewares.map(function (middleware) {
          return middleware(middlewareAPI);
        });
        // middleware 从 (next) => (action) => void 变为 (action) => {}
        _dispatch = compose.apply(void 0, chain)(store.dispatch);
        return _objectSpread2(
          _objectSpread2({}, store),
          {},
          {
            dispatch: _dispatch,
          }
        );
      };
    };
  }

  // functions
  /*
   * This is a dummy function to check if the function name has been altered by minification.
   * If the function has been minified and NODE_ENV !== 'production', warn the user.
   */

  function isCrushed() {}

  if (typeof isCrushed.name === 'string' && isCrushed.name !== 'isCrushed') {
    warning(
      'You are currently using minified code outside of NODE_ENV === "production". ' +
        'This means that you are running a slower development build of Redux. ' +
        'You can use loose-envify (https://github.com/zertosh/loose-envify) for browserify ' +
        'or setting mode to production in webpack (https://webpack.js.org/configuration/mode/) ' +
        'to ensure you have the correct code for your production build.'
    );
  }

  exports.__DO_NOT_USE__ActionTypes = ActionTypes;
  exports.applyMiddleware = applyMiddleware;
  exports.bindActionCreators = bindActionCreators;
  exports.combineReducers = combineReducers;
  exports.compose = compose;
  exports.createStore = createStore;

  Object.defineProperty(exports, '__esModule', { value: true });
});
