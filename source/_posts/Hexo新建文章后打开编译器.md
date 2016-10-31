---
title: Hexo新建文章后打开编译器
subtitle: 让你的写作更愉快的打开方式
date: 2016-08-06 00:24:28
author: 'Martin'
header-img: 'http://obd9ssud2.bkt.clouddn.com/new-hexo.jpg'
tags:
  Hexo
---

用```hexo new "new post"```新建文章后，需要进入```source/_post```后才能打开新建的```new-post.md```文件开始编辑。
以下方法可以在执行```hexo new```后能用惯用的文本编辑器自动打开新建的**md**文件。

在Hexo的scripts目录（如无则新建之）下新建一个JavaScript脚本（文件名任意），粘贴下面的代码，会在监听到```hexo new```命令后用定义的编辑器打开新建的文件。
{% codeblock lang:js /scripts/opencode.js %}
var spawn = require('child_process').spawn;

// Hexo 2.x
hexo.on('new', function(path){
  spawn('code', [path]);
});

// Hexo 3
hexo.on('new', function(data){
  spawn('code', [data.path]);
});
{% endcodeblock %}

我在这里安利[VSCode](https://www.visualstudio.com/zh-cn/products/code-vs.aspx)这个编辑器，微软出品，速度快，插件多。
