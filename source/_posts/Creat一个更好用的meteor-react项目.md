---
title: Creat一个更好用的meteor-react项目
author: Martin张灏哲
catalog: false
date: 2016-11-16 11:36:32
subtitle: '构建meteor-react-redux项目 并且使用 webpack来替代ecmascript'
tags:
  - React
  - Meteor
  - Redux
header-img: http://obd9ssud2.bkt.clouddn.com/photo-1470218091926-22a08a325802.jpg
---

# 当我们开始使用Meteor-react的时候，我们都需要什么？

Meteor是一套惊人的工具来高效地创建伟大的Web应用。我非常喜爱它。而随着spa（不是SPA，是单页应用）的发展，以 react 来说，组件化和状态机的思想真是解放了烦恼的 dom 操作，一切都为状态。state 来操纵 views 的变化。
然而，因为页面的组件化，导致每个组件都必须维护自身的一套状态，对于小型应用还好。但是对于比较大的应用来说，过多的状态显得错综复杂，到最后难以维护，很难清晰地组织所有的状态，在多人开发中也是如此，导致经常会出现一些不明所以的变化，越到后面调试上也是越麻烦，很多时候 state 的变化已经不受控制。对于组件间通行、服务端渲染、路由跳转、更新调试，我们很需要一套机制来清晰的组织整个应用的状态，redux 应然而生，这种数据流的思想真是了不起。

而对于前端来说，我觉得如果我们能有一个实时热重载，ES6模块，资源打包和代码分离，这会让Meteor更加酷，那就是在`meteor`中使用`webpack`去构建你的代码！

Mantra 是一种基于 Meteor 1.3+、React 和 ES2015 的 Meteor 应用架构，主要作用让 Meteor 应用代码架构标准化，特别是前端部分，当然它对后端代码的组织也有要求。注意 Mantra 不是一个框架，而是一套如何构建 Meteor App 的说明。Mantra 的目的是写出更易于理解和维护的代码。它对几乎所有的情况都有一个标准，另外还为 Meteor App 增加单元测试覆盖率。
Mantra 使用的原则很有前瞻性，能够很长时间不会过时，同时也允许其他人做必要的改变。

* react 数据流
* meteor react 构建工具 —— webpack
* Mantra 架构思想
* FlowRouter
* ......

# 开始创建项目
## 创建一个Meteor项目
```js
meteor create meteor-
meteor npm // 安装内需的npm包
```
## 开始配置webpack
安装：
```js
meteor remove ecmascript
meteor add webpack:webpack
meteor add webpack:react
meteor add webpack:less
meteor add react-meteor-data
// 运行项目
meteor
// 注意使用npm install 而不是 meteor npm install
npm install
// 再运行的时候，就会发现webpack自动开始配置安装需要的插件
meteor
```
入口文件：

入口文件被定义在你的`package.json`文件中，`main`是项目的`server entry`,`browser`是项目的`client entry`。
```js
{
  "name": "meteor-react",
  "private": true,
  "main": "server/main.js",
  "browser": "client/main.js"
}
```
### 配置
你可以通过`webpack.json`配置`Webpack`，`webpack.json`文件应该在您的项目的根目录下。
同样，`babel`也被`webpack`所自动安装好了，可以通过`.babelrc`去配置。

## 修改项目代码

替代原代码：
{% codeblock client/main.html js %}
<head>
  <title>Todo List</title>
</head>
 
<body>
  <div id="render-target"></div>
</body>
{% endcodeblock %}

使用react：
{% codeblock client/main.js js %}
import React from 'react';
import { Meteor } from 'meteor/meteor';
import { render } from 'react-dom';
 
import App from './app';
 
Meteor.startup(() => {
  render(<App />, document.getElementById('render-target'));
});
{% endcodeblock %}

{% codeblock client/app.js js %}
import React, { Component } from 'react';
 
import Task from './task';
 
// App component - represents the whole app
export default class App extends Component {
  getTasks() {
    return [
      { _id: 1, text: 'This is task 1' },
      { _id: 2, text: 'This is task 2' },
      { _id: 3, text: 'This is task 3' },
    ];
  }
 
  renderTasks() {
    return this.getTasks().map((task) => (
      <Task key={task._id} task={task} />
    ));
  }
 
  render() {
    return (
      <div className="container">
        <header>
          <h1>Todo List</h1>
        </header>
 
        <ul>
          {this.renderTasks()}
        </ul>
      </div>
    );
  }
}
{% endcodeblock %}


{% codeblock client/task.js js %}
import React, { Component } from 'react';
 
import Task from './task';
 
// App component - represents the whole app
export default class App extends Component {
  getTasks() {
    return [
      { _id: 1, text: 'This is task 1' },
      { _id: 2, text: 'This is task 2' },
      { _id: 3, text: 'This is task 3' },
    ];
  }
 
  renderTasks() {
    return this.getTasks().map((task) => (
      <Task key={task._id} task={task} />
    ));
  }
 
  render() {
    return (
      <div className="container">
        <header>
          <h1>Todo List</h1>
        </header>
 
        <ul>
          {this.renderTasks()}
        </ul>
      </div>
    );
  }
}
{% endcodeblock %}

到这里，一个`meteor-react`使用`webpack`的项目就初步配置完成，接下来，还有引入`mantra`思想，使用`redux`的配置过程。
当然，如果你用不到，就不用往下看了。

***为了方便使用，这是一个基础的[`meteor-react-webpack-boilerplate`](https://github.com/Here21/meteor-react-boilerplate/tree/11199d63fe72b6ce824aa58237fb6c9014219990)***

### 小结
[meteor：webpack](https://github.com/thereactivestack/meteor-webpack/tree/master/packages/webpack/)

# Mantra思想构建项目结构
{% blockquote %}
Mantra是一个基于Meteor的应用程序架构，我们试图通过它达成如下两个目的.

1. 可维护性

可维护性是大规模团队工作成功的关键因素。为了达到这一目标，需要为代码的每一部分添加单元测试，并为各方面内容制定全面的标准。通过这种方式，新的团队成员也可以更加容易的融入到团队之中。

2. 与时俱进

JavaScript生态系统丰富多样，往往每个问题都有多个优秀方案，很难说谁是当前唯一的最佳选择，以及未来会发生什么变化。

Mantra定义了一些可长期遵守的核心原则，其它部分则可按需变化
{% endblockquote %}

Mantra原则很有前瞻性，能够很长时间不会过时。但是我们只使用了他们的原则，而并没有继续使用他们提供的`mantra-core`，因为他们提出了Mantra思想后，并不对这个`mantra-core`有太多关心。

## 启用路由
这里我选择`FlowRouter`搭配`react-mounter`：
```js
meteor add kadira:flow-router
meteor npm i --save react-mounter react react-dom
```
>React Mounter lets you mount React components to DOM easily.
React Mounter supports Server Side Rendering when used with FlowRouter.

[FlowRouter](https://github.com/kadirahq/flow-router)
[react-mounter](https://github.com/kadirahq/react-mounter)

## 依赖注入库
Mantra 使用依赖注入的目的是隔离代码。
Mantra 使用 `react-simple-di` 这个包来进行依赖注入。背后其实就是 React context。这个包接受 `Context` 和 `Actions` 作为依赖。
