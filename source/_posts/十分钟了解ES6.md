---
title: 十分钟了解ES6
author: Martin张灏哲
catalog: true
date: 2016-08-19 14:22:15
subtitle: 从javascript到ES6，看这些变化就够了
tags:
  - ES6
header-img: 'http://obd9ssud2.bkt.clouddn.com/ES6-the-bits-youll-actually-use.png'
---

# 导读

ES6的变化已经让javascript语言变得更值得信赖，那么在了解ES6之前，你都应该去试图理解一下的代码：
```js
export default class Vehicle {
  constructor(type, number) {
    this.type = type;
    this.number = number;
    this.fuel = 1000;
  }

  start() {
    this._startHandler = setInterval(() => {
      this.fuel--;
    }, 500);
  }

  stop() {
    clearInterval(this._startHandler)
  }

  display() {
    return `Number: ${this.number}`;
  }
}

// main.js
import Vehicle from './lib/vehicle';
const {log} = console;

let v1 = new Vehicle('Car', 'HY-8244');
v1.start();
log(v1.display());
```
这看上去不像你平时见过或者写的JS代码对吗？没关系，欢迎认识ES6。

# let & const
当我们声明变量的时候，通常会（ES6之前的语法）使用`var`。但是这有个大问题，我们用`var`定义的每个变量都有 **functional scope**。
```js
for (var lc=0; lc < 10; lc++) {
  var value = lc;
}

console.log(value, lc);
```
如上代码所示，我们既可以使用`value`又可以使用`lc`，即使`lc`是被定义在`for`循环中。

在**ES6**中，你可以用`let`和`const`去代替`var`使用：
```js
for (var lc=0; lc < 10; lc++) {
  // let 声明的变量是局部变量，在这里只课用在for循环内
  let value = lc;
}

console.log(value); // throws an error
```

`const`和`let`很像，不过`const`声明的变量是不允许改变的。
> In most cases, you can use `const` instead of `let`. That's how most developers declare variables with ES2015.

但是，值得注意的是：
```js
const a = 1;
a=2;
// Uncaught TypeError

const user = {name: "Martin"};
user.name = "Simon";
console.log(user.name);
```
不是说`const`声明的变量不可以改变吗？

没错，`const`声明的变量是不会被改变的，但是`user`被改变的是变量内部的**一块区域**，而不是变量被改变了。
所以这就是为什么很多人更喜欢用`const`去代替`let`

# 箭头函数 =>

使用箭头函数`=>`可以精简你的代码，让代码整洁优雅。来看栗子：
```js
// A
const array = [1, 2, 3, 4, 5];
const result = array.map(function(a) {
    return a * 10;
});
console.log(result);

// B
const array = [1, 2, 3, 4， 5];
const result = array.map(a => a * 10);
console.log(result);

// C 
const array = [1, 2, 3];
const result = array.map((a, i) => a * i);
console.log(result);
```
这里的结果会是一样的，在大的项目中，这会精简不少代码。当然，这里就相当于是个`lambdas`。还有，参数也可以是多个。

但是这里的使用有个小细节需要注意：
```js
// A
const array = [1, 2, 3, 4， 5];
const result = array.map(a => {res: a * 10});
console.log(result);
// [undefined, undefined, undefined, undefined]

// B
const array = [1, 2, 3, 4, 5];
const result = array.map(a => ({res: a * 10});
console.log(result);
// [10, 20, 30, 40, 50]
```
在A中，`{res: a * 10}`被箭头函数认为是一个区域，所以你需要包裹一个`（）`。


# ~~that = this~~

```js
function Clock() {
    this.currentTime = new Date();
}

Clock.prototype.start = function() {
    var that = this;
    setInterval(function() {
        that.currentTime = new Date();
    }, 1000);
}

// 箭头函数
function Clock() {
    this.currentTime = new Date();
}

Clock.prototype.start = function() {
    setInterval(() => {
        this.currentTime = new Date();
    }, 1000);
}
```
还有一点需要注意，有些情况无法使用`=>`箭头函数：
```js

const user = {userId: 'arunoda'};
const RPC = {
  methods: {}, 
  call (name, ...args) {
    return this.methods[name].apply(user, args);
  }
};
// 箭头函数
RPC.methods.sum = (a, b) => {
  if (!this.userId) {
    throw new Error("Unauthorized");
  }

  return a + b;
}

const total = RPC.call('sum', 10, 20);
console.log('Total is: ' + total);
// TypeError: Cannot read property 'userId' of undefined

// function
RPC.methods.sum = function (a, b) {
  if (!this.userId) {
    throw new Error("Unauthorized");
  }

  return a + b;
}

const total = RPC.call('sum', 10, 20);
console.log('Total is: ' + total);
"Total is: 30"
```
这是因为，箭头功能携带其中函数定义的地方的`context`。他们掩盖了运行时环境。
> That's because arrow functions carry the context of the place where the function is defined. They mask the runtime context.
Arrow functions are great, but they are not a solution you can use everywhere. Think before using them.

# 增强的Object
请看栗子:
```js
// 不用再写`function`
const user = {
    getName() {
        return 'Arunoda';
    }
}
console.log(user.getName());

// 直接给Object赋值
const name = 'Arunoda';
const age = 80;
const user = {name, age};

// 与上相同
const name = 'Arunoda';
const age = 80;
const user = {
    name: name,
    age: age
};
```

我们还可以这样使用:
```js
function printName({name}) {
    console.log('Name is: ' + name);
}

const user = {
    name: 'Arunoda',
    age: 80,
    city: 'Colombo'
};
printName(user);
```
这不仅简化我们的代码，而且相当于为代码做了文档,当我们看在函数的第一行，我们知道我们正在使用的输入对象的到底是什么。

当然,最喜欢的我认为还是这个:
```js
// 你也可以用{name, age = 20}
function printUser([name, age = 20]) {
    console.log('Name is: ' + name + ' Age: ' + age);
}

printUser(["Arunoda", 80]);
```
这就使我们的代码更为健壮.在写一些结构复杂的代码的时候,我们难免会遇到`参数`的变化,那这种写法就可以有效的避免变化带来的麻烦.

# 展开操作符 'spread operator' `...array`
```js
function volume(l, w, h) {
    return l*w*h;
}

// ES6以前
function result(l, w, h) {
    const res = volume(l, w, h);
    console.log('Result is: ' + res);
    return res;
}

// ES6
function result(...args) {
    const res = volume(...args);
    console.log('Result is: ' + res);
    return res;
}

result(10, 20, 30);
```

如下情况需要注意:
```js
function printTeam(leader, ...others) {
  console.log('Leader: ' + leader + ' - Others: ' + others);
}

printTeam('Arunoda', 'John', 'Singh');
// Leader: Arunoda - Others: John,Singh 
// NOT Leader: Arunoda - Others: ["John", "Singh"]
```

# 对Objects的操作

如果我们想要`clone`或者`merge`一个对象,过去的话我们通常会选用很多辅助库,如`lodash``underscore`.
```js
var user = {name: "Arunoda"};
var newUser = _.clone(user);
var withAge = _.extend(user, {age: 20});
var newUserVersion = _.defaults({age: 80}, user);

console.log(newUser, withAge, newUserVersion);
```
在ES6中,我们有一些简单的方式(不使用帮助库)去实现:
```js
const user = {name: "Arunoda"};
const newUser = {...user};
const withAge = {...user, age: 20};
const newUserVersion = {age: 80, ...user};

console.log(newUser, withAge, newUserVersion);
```
{% blockquote %}
When you are adding a new field to an object, it's good practice to create new objects rather than extending it.
This leads to clear code and reduces mistakes.
This new syntax encourages us to do that.
{% endblockquote %}

这有个问题给你,请看代码:
```js
const user = {
  name: 'Arunoda',
  emails: ['hello@arunoda.io']
};

const newUser = {...user};
newUser.emails.push('mail@arunoda.io');

console.log(user.emails);
```
请问输出的结果会如何?
```
["hello@arunoda.io", "mail@arunoda.io"]
```
**尽管我们复制了对象，但是它不是一个深克隆。我们仅克隆了顶级域**.在这两个对象的`emails`字段中使用是相同的。


我们也可以复制数组:
```js
const marks = [10, 20, 30];
const newMarks = [...marks, 40];

console.log(marks, newMarks);
// [10,20,30],[10,20,30,40]
```
# Immutability in JavaScript (纯函数)

{% blockquote %}
That means, a function gets some input and returns some value. But the function does not change the values it receives via arguments. And it always returns the same value for the same input.

`random()` would not a pure function. And any function that modifies some global state is also not pure.

{% endblockquote %}
栗子:
```js
// with objects
function addMarks(user, marks) {
  return {
    ...user,
    marks
  };
}

const user = {username: 'arunoda'};
const userWithMarks = addMarks(user, 80);

console.log(user, userWithMarks);

// with arrays
function addUser(users, username) {
  const user = {username};
  return [
    ...users,
    user
  ];
}

const user = {username: 'arunoda'};
const users = [user];
const newUsers = addUser(users, 'john');

console.log(users, newUsers);
```
# 模板字符串
直接上栗子:
```js
// A
const name = "Martin";
const string = `Hello ${name}!`;

console.log(string);

// 多行字符串
const message = `
  # Title

  This is a multi line string as markdown.
  It's pretty nice.
`;
console.log(message);
// 等于上代码
var message = "\n  # Title\n\n  This is a multi line string as markdown.\n  It's pretty nice.\n";
console.log(message);
```

# 类 Class
JavaScript不是一个传统的的面向对象的语言(不像Java等有`class`)。但是，我们可以使用的函数`function`和`prototypes`去模拟class。
不过有了ES2015，现在我们直接可以写本地类:
```js
class Vehicle {
  constructor(type, number) {
    this.type = type;
    this.number = number;
  }

  display() {
    return `Number: ${this.number}`;
  }
}

const v1 = new Vehicle('Car', 'GH-2343');
console.log(v1.display());
``` 
{%blockquote%}
Behind the scenes, it's using functions and prototypes to implement the class.
So, it's compatible with older versions of JavaScript while providing us with nicer syntax.
That means you can still access the prototype and edit it as needed.
{%endblockquote%}

栗子:
```js
class Vehicle {
  constructor(type, number) {
    this.type = type;
    this.number = number;
  }

  display() {
    return `Number: ${this.number}`;
  }
}

class Car extends Vehicle {
  constructor(number) {
    super('Car', number);
  }

  display() {
    const value = super.display();
    return `Car ${value}`;
  }
}

const v1 = new Car('GH-2343');
console.log(v1.display());
```
我们在子类的构造函数中调用父类的构造函数`constructor`,在子类中复写了父类的`display()`方法,并且在子类中的`display()`方法中,也调用父类的`display()`方法.

# 模块 Module
ES2015有一个模块系统，我们可以把我们的应用拆分成较小的模块(可管理的模块)。这个模块系统非常类似于CommonJS的模块系统（或Node.js的的模块系统），但有一个重要的差别:
{% blockquote %}
All the imports should be static. That means, you can't import modules at runtime. They need to done at compile time (or better when interpreting JavaScript).
Here's a piece of code that cannot be written with ES2015 modules:
{% endblockquote %}
```js
let router;

if (typeof window === 'function') {
  router = import './client-router';
} else {
  router = import './server-router';
}
```
[ECMAScript6 入门](http://es6.ruanyifeng.com/#docs/module)有关于模块详细的介绍.

模块是ES语法中的新的东西,需要仔细阅读,阮一峰老师的书中有详细的解读.