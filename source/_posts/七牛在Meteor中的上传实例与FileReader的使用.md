---
title: 七牛在Meteor中的上传实例与FileReader的使用
author: Martin张灏哲
catalog: true
date: 2016-08-31 12:59:03
subtitle: Meteor 中使用qiniu NodeSDK 的个人总结
tags:
  - Meteor
  - qiniu
header-img: 'http://obd9ssud2.bkt.clouddn.com/meteor-qiniu.jpg'
---

# 引言
自己在项目中使用`qiniu`的总结.
可以在这里下载[Meteor-qiniu-demo](https://github.com/Here21/qiniu-meteor-demo)

# 安装

`qiniu`通过 npm 以 node 模块化的方式安装：
```
meteor npm install qiniu
```
还需要这个包将异步转为同步:
```
meteor add meteorhacks:async
```

**初始化**
在自己的秘钥中找到` AccessKey / SecretKey`. 

# 找到文件
使用`<input type="file"> `就可以创建一个上传`uploader`,然后要在`meteor`中找到`file`对象.
>一个FileList对象通常来自于一个HTML input元素的files属性,你可以通过这个对象访问到用户所选择的文件.该类型的对象还有可能来自用户的拖放操作,查看 [DataTransfer](https://developer.mozilla.org/zh-CN/docs/Web/API/DataTransfer) 对象了解详情.

```
<input id="fileItem" type="file"> // multiple 属性提供多文件上传
var file = document.getElementById('fileItem').files[0];
```
**参考这里[FileList](https://developer.mozilla.org/zh-CN/docs/Web/API/FileList)**

# 使用FileReader
在Meteor中,我们需要在`client`中获取 `Dom`中的files对象,所以就需要用到`FileReader API`去方便我们获取files.
{% blockquote FileReader https://developer.mozilla.org/zh-CN/docs/Web/API/FileReader FileReader %}
HTML5 终于为我们提供了一种通过 File API 规范与本地文件交互的标准方式.
可使用 File API 在向服务器发送图片的过程中创建图片的缩略图预览，或者允许应用程序在用户离线时保存文件引用。
{% endblockquote %}

然后通过`fileReader`将其读取到内存中.

`FileReader` 接口可用于通过熟悉的 `JavaScript` 事件处理来***异步***读取文件。因此，可以监控读取进度、找出错误并确定加载何时完成。这些 `API` 与 `XMLHttpRequest` 的事件模型有很多相似之处。

在`meteor`中:
{% codeblock client/main.js lang:js https://github.com/Here21/qiniu-meteor-demo/blob/master/client/main.js %}
Template.upload.events({
  'change #uploader'(event, instance) {
    let node = document.getElementById('uploader').files[0];

    // 实例化 FileReader 对象,以便将其内容读取到内存中
    var reader = new FileReader();
    reader.readAsDataURL(node);
    reader.onload = function(event) {
      let dataUrl = event.target.result;
      
      console.log(typeof dataUrl);
      // DDP传的数据必须是EJSON-able的,无法传二进制,在server端使用qiniu上传时得转回二进制,而这里的dataURL是base64的
      Meteor.call('qiniu-upload', dataUrl, function(err, res) {
        if (!err) {
          alert('图片上传成功');
        }else {
          alert('图片上传失败，请重试');
        }
      });
    }
  },
});
{% endcodeblock %}

# 使用qiniu NodeSDK
将秘钥中找到` AccessKey / SecretKey`的配置在`qiniu.conf`
这里利用`Async`异步转同步,关于`meteorhacks:async`可以在这里获取更多信息.[atmosphere-meteorhacks:async](https://atmospherejs.com/meteorhacks/async)
{% codeblock server/qiniu-upload.js lang:js https://github.com/Here21/qiniu-meteor-demo/blob/master/server/qiniu-upload.js %}
import qiniu from 'qiniu';
import {Meteor} from 'meteor/meteor';
import {check} from 'meteor/check';

const ak = 'AccessKey';
const sk = 'SecretKey';
const bucket = 'bucket';


Meteor.methods({
  'qiniu-upload'(dataUrl) {
    // 新版本的meteor要求method和publication函数都要check参数
    check(dataUrl, String);
    
    qiniu.conf.ACCESS_KEY = ak;
    qiniu.conf.SECRET_KEY = sk;

    // 华北地区的空间需要使用以下域名
    qiniu.conf.UP_HOST = 'http://up-z1.qiniu.com';

    // 由于Meteor.methods 不是异步函数,但是qiniu是异步,所以最好将两者变成一致,我这里利用Async变成同步
    let wrappedQiniuIo = Async.wrap(qiniu.io, ['put']);

    let putPolicy = new qiniu.rs.PutPolicy(bucket);
    let token = putPolicy.token();
    let extra = new qiniu.io.PutExtra();

    // qiniu上传图片需要图片的二进制数据
    let buffer = new Buffer(dataUrl.replace(/^data:image\/\w+;base64,/, ''), 'base64');

    let ret = wrappedQiniuIo.put(token, '', buffer, extra);
    console.log(ret.key);
  }
})

{% endcodeblock %}
**处理二进制**
{% blockquote runoob.com http://www.runoob.com/nodejs/nodejs-buffer.html Buffer(缓冲区) %}
Buffer库为Node.js带来了一种存储原始数据的方法，可以让Nodejs处理二进制数据，
每当需要在Nodejs中处理I/O操作中移动的数据时，就有可能使用Buffer库。
原始数据存储在 Buffer 类的实例中。一个 Buffer 类似于一个整数数组，但它对应于 V8 堆内存之外的一块原始内存。
{% endblockquote %}
其他[Node.js缓冲模块Buffer](http://blog.fens.me/nodejs-buffer/)文章实例

`qiniu`上传也可以指定`key`去自定义上传到七牛后保存的文件名.参考 [qiniu-NodeSDK](http://developer.qiniu.com/code/v6/sdk/nodejs.html)

# 备注

[通过 File API 使用 JavaScript 读取文件](http://www.html5rocks.com/zh/tutorials/file/dndfiles/)
[Meteor-DDP 翻译文章](https://cnodejs.org/topic/51b030d9555d34c678e5fb2e)
[DDP 翻译文章](https://cnodejs.org/topic/51b03065555d34c678e5ee98)

**为什么要在method中将异步转同步?**
在meteor中,客户端代码是异步,而服务端的`method`是同步函数,而`qiniu sdk`提供的则是异步函数,如果一个异步函数在同步函数中,同步函数没有等异步函数执行完就执行结束,那么有可能造成一些不好的影响.
在这个例子中,如果我要在`server/qiniu-upload.js`中的`'qiniu-upload'(dataUrl) {...}`把`ret.key`直接插入到数据库中,那就有可能没有等`ret`返回,`insert`就结束了.
有关***JS中异步与同步***,在这篇文章中有详细讲解 [JavaScript：彻底理解同步、异步和事件循环(Event Loop)](https://segmentfault.com/a/1190000004322358)