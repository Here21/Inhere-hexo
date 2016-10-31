---
title: Redux 上手笔记（一）
author: Martin张灏哲
catalog: true
date: 2016-08-17 13:42:22
subtitle: '让react的state可控可预测'
tags:
  - React
  - Redux
header-img: 'http://obd9ssud2.bkt.clouddn.com/redux.jpg'
---

# Redux 动机

{% blockquote %}
通过限制更新发生的时间和方式，Redux 试图让 state 的变化变得可预测。
{% endblockquote %}

## 三大原则

- 单一数据源（整个应用的 state 被储存在一棵 object tree 中，并且这个 object tree 只存在于唯一一个 store 中）
- 只读的State（惟一改变 state 的方法就是触发 action，action 是一个用于描述已发生事件的普通对象。）
- 使用纯函数来执行修改（为了描述 action 如何改变 state tree ，你需要编写 reducers。）

---


# 了解Redux基础
## Action

Action 是把**数据**从应用（译者注：这里之所以不叫 view 是因为这些数据有可能是服务器响应，用户输入或其它非 view 的数据 ）传到 store 的**有效载荷**。它是 store 数据的唯一来源。一般来说你会通过 `store.dispatch()` 将 action 传到 store。
```javascript
const ADD_TODO = 'ADD_TODO'
{
  type: ADD_TODO,
  text: 'Build my first Redux app'
}
```

action 内必须使用一个字符串类型的`type`字段来表示将要执行的动作。多数情况下，`type` 会被定义成字符串常量。当应用规模越来越大时，建议使用单独的模块或文件来存放 action。

```javascript
import { ADD_TODO, REMOVE_TODO } from '../actionTypes'
```

我们还需要再添加一个 **action type** 来表示用户完成任务的动作。因为数据是存放在数组中的，所以我们通过下标 `index `来引用特定的任务。而实际项目中一般会在**新建数据的时候生成唯一的 ID**作为数据的引用标识。

```javascript
{
  type: TOGGLE_TODO,
  index: 5
}
```

> **我们应该尽量减少在 action 中传递的数据**。比如上面的例子，传递 index 就比把整个任务对象传过去要好。

## Action 创建函数
action 创建函数只是简单的返回一个 action：

```javascript
function addTodo(text) {
  return {
    type: ADD_TODO,
    text
  }
}
```

> 这样做将使 action 创建函数更容易被移植和测试。

###  dispatch
**Redux 中只需把 action 创建函数的结果传给 dispatch() 方法即可发起一次 dispatch 过程**。

```javascript
dispatch(addTodo(text))
dispatch(completeTodo(index))
```

或者创建一个 **被绑定的 action 创建函数** 来自动 dispatch：

```javascript
const boundAddTodo = (text) => dispatch(addTodo(text))
const boundCompleteTodo = (index) => dispatch(completeTodo(index))
```

然后直接调用它们：

```javascript
boundAddTodo(text);
boundCompleteTodo(index);
```

store 里能直接通过 `store.dispatch()` 调用 `dispatch()` 方法，但是多数情况下你会使用 `react-redux` 提供的 `connect()` 帮助器来调用。`bindActionCreators()` 可以自动把多个 action 创建函数 绑定到 `dispatch()` 方法上。

{% codeblock Demo代码 lang:javascript https://github.com/Here21/Redux-demo-simple-/blob/0a7836150bca65d31faaefdd51f2aa72d8420b3f/src/actions.js Redux-demo-simple/src/actions.js %}
/*
 * action 类型
 */

export const ADD_TODO = 'ADD_TODO';
export const COMPLETE_TODO = 'COMPLETE_TODO';
export const SET_VISIBILITY_FILTER = 'SET_VISIBILITY_FILTER'

/*
 * 其它的常量
 */

export const VisibilityFilters = {
  SHOW_ALL: 'SHOW_ALL',
  SHOW_COMPLETED: 'SHOW_COMPLETED',
  SHOW_ACTIVE: 'SHOW_ACTIVE'
};

/*
 * action 创建函数
 */

export function addTodo(text) {
  return { type: ADD_TODO, text }
}

export function completeTodo(index) {
  return { type: COMPLETE_TODO, index }
}

export function setVisibilityFilter(filter) {
  return { type: SET_VISIBILITY_FILTER, filter }
}
{% endcodeblock %}

## Reducer

> Action 只是描述了**有事情发生了**这一事实，并没有指明应用如何更新 state。而这正是 reducer 要做的事情。

### 设计 State 结构

在 Redux 应用中，所有的 state 都被保存在一个单一对象中。建议在写代码前先想一下这个对象的结构。如何才能以最简的形式把应用的 state 用对象描述出来？

```javascript
{
  visibilityFilter: 'SHOW_ALL',
  todos: [
    {
      text: 'Consider using Redux',
      completed: true,
    },
    {
      text: 'Keep all state in a single tree',
      completed: false
    }
  ]
}
```

### Action 处理
reducer 就是一个纯函数，接收旧的 state 和 action，返回新的 state。

```javascript
(previousState, action) => newState
```

{% blockquote %}
**永远不要在 reducer 里做这些操作：**
- 修改传入参数；
- 执行有副作用的操作，如 API 请求和路由跳转；
- 调用非纯函数，如 Date.now() 或 Math.random()。
{% endblockquote %}

***谨记 reducer 一定要保持纯净。***

注意:

**不要修改 state**。 使用 `Object.assign()` 新建了一个副本。不能这样使用 `Object.assign(state, { visibilityFilter: action.filter })`，因为它会改变第一个参数的值。你必须把第一个参数设置为空对象。你也可以开启对ES7提案对象展开运算符的支持, 从而使用 `{ ...state, ...newState }` 达到相同的目的。

在 **default** 情况下返回旧的 state。遇到未知的 action 时，一定要返回旧的 state。

[减少样板代码](http://cn.redux.js.org/docs/recipes/ReducingBoilerplate.html#reducers)

### 拆分 Reducer

```javascript
function todoApp(state = initialState, action) {
  switch (action.type) {
    case SET_VISIBILITY_FILTER:
      return Object.assign({}, state, {
        visibilityFilter: action.filter
      })
    case ADD_TODO:
      return Object.assign({}, state, {
        todos: [
          ...state.todos,
          {
            text: action.text,
            completed: false
          }
        ]
      })
    case TOGGLE_TODO:
      return Object.assign({}, state, {
        todos: state.todos.map((todo, index) => {
          if(index === action.index) {
            return Object.assign({}, todo, {
              completed: !todo.completed
            })
          }
          return todo
        })
      })
    default:
      return state
  }
}

// todos 和 visibilityFilter 的更新看起来是相互独立的,可以把 todos 更新的业务逻辑拆分到一个单独的函数里

// ！！注意 todos 依旧接收 state，但它变成了一个数组
function todos(state = [], action) {
  switch (action.type) {
    case ADD_TODO:
      return [
        ...state,
        {
          text: action.text,
          completed: false
        }
      ]
    case TOGGLE_TODO:
      return state.map((todo, index) => {
        if (index === action.index) {
          return Object.assign({}, todo, {
            completed: !todo.completed
          })
        }
        return todo
      })
    default:
      return state
  }
}

function todoApp(state = initialState, action) {
  switch (action.type) {
    case SET_VISIBILITY_FILTER:
      return Object.assign({}, state, {
        visibilityFilter: action.filter
      })
    case ADD_TODO:
    case TOGGLE_TODO:
      return Object.assign({}, state, {
        todos: todos(state.todos, action)
      })
    default:
      return state
  }
}
```

### Reducer 合成

每个 reducer 只负责管理全局 state 中它负责的一部分。每个 reducer 的 state 参数都不同，分别对应它管理的那部分 state 数据。

{% codeblock Demo代码 lang:javascript https://github.com/Here21/Redux-demo-simple-/blob/0a7836150bca65d31faaefdd51f2aa72d8420b3f/src/reducers.js Redux-demo-simple/src/reducers.js%}
import { combineReducers } from 'redux'
import { ADD_TODO, TOGGLE_TODO, SET_VISIBILITY_FILTER, VisibilityFilters } from './actions'
const { SHOW_ALL } = VisibilityFilters

function visibilityFilter(state = SHOW_ALL, action) {
  switch (action.type) {
    case SET_VISIBILITY_FILTER:
      return action.filter
    default:
      return state
  }
}

function todos(state = [], action) {
  switch (action.type) {
    case ADD_TODO:
      return [
        ...state,
        {
          text: action.text,
          completed: false
        }
      ]
    case TOGGLE_TODO:
      return state.map((todo, index) => {
        if (index === action.index) {
          return Object.assign({}, todo, {
            completed: !todo.completed
          })
        }
        return todo
      })
    default:
      return state
  }
}

// Redux 提供了 combineReducers() 工具类来做上面 todoApp 做的事情
const todoApp = combineReducers({
  visibilityFilter,
  todos
})

export default todoApp
{% endcodeblock %}

`combineReducers() `所做的只是生成一个函数，这个函数来调用你的一系列 `reducer`，每个 reducer **根据它们的 key 来筛选出 state 中的一部分数据并处理**，然后这个生成的函数再将所有 reducer 的结果合并成一个大的对象。

{% blockquote %}
ES6 用户使用注意

combineReducers 接收一个对象，可以把所有顶级的 reducer 放到一个独立的文件中，通过 export 暴露出每个 reducer 函数，然后使用 import * as reducers 得到一个以它们名字作为 key 的 object：

```javascript
import { combineReducers } from 'redux'
import * as reducers from './reducers'

const todoApp = combineReducers(reducers)
```

{% endblockquote %}

## Store
{% blockquote %}
- action 来描述“发生了什么”
- reducers 来根据 action 更新 state 
{% endblockquote %}

**Store** 就是把它们联系到一起的对象。Store 有以下职责：

- 维持应用的 state；
- 提供 getState() 方法获取 state；
- 提供 dispatch(action) 方法更新 state；
- 通过 subscribe(listener) 注册监听器;
- 通过 subscribe(listener) 返回的函数注销监听器。

注意：***Redux 应用只有一个单一的 store***

在Reducer中，我们使用 combineReducers() 将多个 reducer 合并成为一个。现在我们将其导入，并传递 createStore()。

```javascript
import { createStore } from 'redux'
import todoApp from './reducers'
let store = createStore(todoApp)
```

`createStore()` 的第二个参数是可选的, 用于设置 state 初始状态。这对开发同构应用时非常有用，服务器端 redux 应用的 state 结构可以与客户端保持一致, 那么客户端可以将从网络接收到的服务端 state 直接用于本地数据初始化。

```javascript
let store = createStore(todoApp, window.STATE_FROM_SERVER)
```

## 数据流
> 严格的单向数据流是 Redux 架构的设计核心。

Redux 应用中数据的生命周期遵循下面 4 个步骤：
1. 调用 store.dispatch(action)
    - 你可以在任何地方调用 store.dispatch(action)，包括组件中、XHR 回调中、甚至定时器中。
2. Redux store 调用传入的 reducer 函数
    - Store 会把两个参数传入 reducer： **当前的 state 树和 action**
3. 根 reducer 应该把多个子 reducer 输出合并成一个单一的 state 树。
    - Redux 原生提供`combineReducers()`辅助函数，来把根 reducer 拆分成多个函数，用于分别处理 state 树的一个分支。
    假如你有两个 reducer：一个是 todo 列表，另一个是当前选择的过滤器设置：

    ```javascript
    function todos(state = [], action) {
      // 省略处理逻辑...
      return nextState;
    }

    function visibleTodoFilter(state = 'SHOW_ALL', action) {
      // 省略处理逻辑...
      return nextState;
    }

    let todoApp = combineReducers({
      todos,
      visibleTodoFilter
    })
    ```

    当你触发 action 后，combineReducers 返回的 todoApp 会负责调用两个 reducer：

    ```javascript
    let nextTodos = todos(state.todos, action);
    let nextVisibleTodoFilter = visibleTodoFilter(state.visibleTodoFilter, action);
    ```

    然后会把两个结果集合并成一个 state 树：

    ```javascript
    return {
      todos: nextTodos,
      visibleTodoFilter: nextVisibleTodoFilter
    };
    ```

    > 虽然 `combineReducers()` 是一个很方便的辅助工具，你也可以选择不用；你可以自行实现自己的根 reducer！

4. Redux store 保存了根 reducer 返回的完整 state 树。

这个新的树就是应用的下一个 state！所有订阅 `store.subscribe(listener)` 的监听器都将被调用；监听器里可以调用 `store.getState()` 获得当前 `state`。

现在，可以应用新的 state 来更新 UI。如果你使用了 `React Redux` 这类的绑定库，这时就应该调用 `component.setState(newState)` 来更新。

[Redux React Demo](https://github.com/Here21/Redux-demo-simple-/tree/0a7836150bca65d31faaefdd51f2aa72d8420b3f/src)