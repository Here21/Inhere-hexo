---
title: MongoDB Shell Script操作备忘
author: Martin张灏哲
catalog: false
date: 2016-11-22 20:05:57
subtitle: "翻译&补充：官方文档——Write Scripts for the mongo Shell"
tags:
  - MongoDB
header-img: http://obd9ssud2.bkt.clouddn.com/mongoDB.jpeg
---
# 编写mongo Shell的脚本
>在此页面上
> * 打开新连接
> * 互动和脚本之间的区别
> * 脚本

您可以在JavaScript中编写mongo shell的脚本，在MongoDB中操作数据或执行管理操作。 有关mongo shell的更多信息，有关使用这些mongo脚本的更多信息，请参阅通过服务器部分上的mongo shell实例运行.js文件。

本教程提供了编写使用mongo shell访问MongoDB的JavaScript的介绍。

在脚本文件中，可包含任意数量使用JavaScript（如条件语句和循环）的MongoDB命令。MongoDB shell脚本编程主要是通过三种方式实现的。

* 在命令行指定要执行的JavaScript文件。
* 在命令行使用参数--eval <expression>，其中expression是要执行的JavaScript表达式。
* 在MongoDB shell启动后，调用方法load(script_path)，其中script_path是要执行的JavaScript文件的路径。

## 打开新连接
从mongo shell或从JavaScript文件，您可以使用Mongo（）构造函数实例化数据库连接：
```js
new Mongo()
new Mongo(<host>)
new Mongo(<host:port>)
```
考虑下面的例子，它实例化一个到默认端口上在localhost上运行的MongoDB实例的新连接，并使用getDB（）方法将全局数据库变量设置为myDatabase：
```js
conn = new Mongo();
db = conn.getDB("myDatabase");
```

如果连接到强制实施访问控制的MongoDB实例，则可以使用db.auth（）方法进行身份验证。

此外，您可以使用connect（）方法连接到MongoDB实例。 以下示例连接到在localhost上运行的非默认端口27020的MongoDB实例，并设置全局数据库变量：
```js
db = connect("localhost:27020/myDatabase");
```
方法请参考这里：[mongo Shell Methods](http://docs.mongoing.com/manual-zh/reference/method.html)


## 互动和脚本之间的区别（Differences Between Interactive and Scripted mongo）

当为mongo shell编写脚本时，请考虑以下内容：

* 要设置db全局变量，请使用[`getDB（）`](https://docs.mongodb.com/v3.2/reference/method/Mongo.getDB/#Mongo.getDB)方法或connect（）方法。 您可以将数据库引用分配给除db以外的变量。
* 默认情况下，`mongo shell`中的写操作使用[`{w：1}`](https://docs.mongodb.com/v3.2/reference/write-concern/#wc-w)的写入关注。 如果执行批量操作，请使用 [Bulk（）](https://docs.mongodb.com/v3.2/reference/method/Bulk/#Bulk)方法。 有关详细信息，请参阅 [ Write Method Acknowledgements](https://docs.mongodb.com/v3.2/release-notes/2.6-compatibility/#write-methods-incompatibility) 。

  更改在版本2.6：在MongoDB 2.6之前，调用 [`db.getLastError（）`](https://docs.mongodb.com/v3.2/reference/method/db.getLastError/#db.getLastError)显式地等待写操作的结果。

* 您**不能**在JavaScript文件内使用任何shell帮助程序（例如使用`<dbname>`，`show dbs`等），因为它们不是有效的JavaScript。
下表将最常见的`mongo shell`帮助器映射到他们的JavaScript等效项。

| Shell Helpers            | JavaScript Equivalents           |
| --------                 | -----:                           |
| show dbs, show databases | db.adminCommand('listDatabases') |
| use <db>                 | db = db.getSiblingDB('<db>')     |
| show collections         | db.getCollectionNames()          |
| show users	             | db.getUsers()                    |
| show roles               | db.getRoles({showBuiltinRoles: true}) |
| show log <logname>	     | db.adminCommand({ 'getLog' : '<logname>' }) |
| show logs	               | db.adminCommand({ 'getLog' : '*' }) |
| it                       | cursor = db.collection.find() ... |  
                          
* 在交互模式下，mongo打印操作的结果，包括所有光标的内容。 在脚本中，使用JavaScript `print（）`函数或mongo特定的`printjson（）`函数返回格式化的JSON。

例
要在mongo shell脚本中打印结果游标中的所有项目，请使用以下idiom：
```js
cursor = db.collection.find();
while ( cursor.hasNext() ) {
   printjson( cursor.next() );
}
```
> find()拿到的不是数据，而是游标（cursor），详情看mongo Shell Methods中关于cursor

## 脚本
从系统提示符，使用mongodb来评估JavaScript。

### -eval 参数
使用`--eval`选项为mongo传递shell一个`JavaScript fragment`，如下所示：
```js
mongo test --eval "printjson(db.getCollectionNames())"
```
### 执行JavaScript文件
您可以为mongo shell指定.js文件，mongo将直接执行JavaScript:
```js
mongo localhost:27017/test myjsfile.js
```
此操作在mongo shell中执行`myjsfile.js`脚本，该脚本连接到可以通过端口`27017`上的`localhost`接口访问的mongod实例上的 **test** 数据库。

或者，您可以使用Mongo（）构造函数在javascript文件中指定mongodb连接参数。 有关详细信息，请参阅文章开头**打开新连接**部分。

您可以使用`load（）`函数从***mongo shell中***执行.js文件，如下所示：
```js
▶ mongo
MongoDB shell version v3.4.0-rc4
connecting to: mongodb://127.0.0.1:27017
MongoDB server version: 3.4.0-rc4
...
>load("myjstest.js")
```
此函数加载并执行myjstest.js文件。

load（）方法接受相对路径和绝对路径。如果mongo shell的当前工作目录是`/data/db`，并且`myjstest.js`驻留在`/data/db/scripts`目录中，则mongo shell中的以下调用将是等效的：
```js
load("scripts/myjstest.js")
load("/data/db/scripts/myjstest.js")
```
> 没有load（）函数的搜索路径。 如果所需的脚本不在当前工作目录或完全指定的路径中，mongo将无法访问该文件。

## 个人补充
### 实例：
```js
// WorkSpace/LearnCode/mongo-scripts/script.js
conn = new Mongo('127.0.0.1:27017');
db = conn.getDB('cw');

boxes = db.boxes.find();
printjson(boxes.next() );
```
然后打开终端：
```
mongo script.js
```
结果：
```
▶ mongo mongo.js
MongoDB shell version v3.4.0-rc4
connecting to: mongodb://127.0.0.1:27017
MongoDB server version: 3.4.0-rc4
{
        "_id" : "1192336012",
        "campus" : "北华大学",
        "building" : "东校区9号楼",
        "room" : "103",
        "nCustomers" : "8",
        "activateAt" : ISODate("2016-09-27T10:04:02.342Z")
}

```


# 参考
[mongodb执行js脚本(一)---shell执行](http://www.voidcn.com/blog/q383965374/article/p-2589838.html)

[Write Scripts for the mongo Shell](https://docs.mongodb.com/manual/tutorial/write-scripts-for-the-mongo-shell/)

[Javascript shell](https://developer.mozilla.org/zh-CN/docs/Mozilla/Projects/SpiderMonkey/Introduction_to_the_JavaScript_shell#说明)

[异步社区——MongoDB shell 脚本编程](http://www.epubit.com.cn/book/onlinechapter/27994)
