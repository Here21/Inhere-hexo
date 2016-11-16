---
title: PipeLine处理数据（一）
author: Martin张灏哲
catalog: false
date: 2016-11-13 14:07:49
subtitle: '处理复杂数据的思考与进步'
tags:
  - Javascript
  - 工作总结
header-img: 'http://obd9ssud2.bkt.clouddn.com/PipeLine.jpg'
---

# PipeLine思路
处理数据是程序员的必修课，无论是后端程序员，还是前端程序员，都要面对的绕不开的问题。
处理问题的方式有很多，如何更聪明高效的处理才会不断进步。

刚开始接触的时候，最直观的思路就是**循环**，`for while`等，但是当数据结构比较复杂的时候，这样处理不仅会很混乱，也同样低效。

所以PipeLine的思路就是利用语言标准库提供的方法去处理。
![PipeLine](http://obd9ssud2.bkt.clouddn.com/PipeLine%20%281%29.png)

# 实例

看看我们抓取的生肉（未处理数据）：
![生肉](http://obd9ssud2.bkt.clouddn.com/PipeLine-%E7%94%9F%E8%82%89%E6%95%B0%E6%8D%AE.png)
而我要做的是将里面的每个`items`给`groupBy`然后再`reduce`每个`items`中的`ordered`。
刚开始接触这样复杂的数据，有点不知所措，在这里记录下我的处理过程，做个总结。

在这里用到了`lodash`：
```js
  // [[{...,items,...},{...,items,...}],[{...,items,...},{...,items,...}],[{...,items,...},{...,items,...}]...]
  let list = orders.map((arr) =>// arr: [{...,items,...},{...,items,...}...]
    ({items: arr.reduce(
      (pre, cur) => pre.concat(cur.items), [])}// [{items:[{_id:...,name:...,...},{items:[{_id:...,name:...,...},{}...]},{},{}...]
    )
  ).reduce((pre, cur) => (pre.concat(cur.items)), []); // [{...},{},{},{},{}]

  let items = _(list).groupBy('_id')// {id1: [{...}, {...}], id2: [{...}]}
    .mapValues((snackGroup, _id) => ({
      _id,
      name: snackGroup[0].name,
      ordered: snackGroup.reduce((sum, item) => sum + item.ordered, 0)
    })).value();

  return _.values(items);
  ```
最后呢，数据就被处理成想要的样子了：
![熟肉](http://obd9ssud2.bkt.clouddn.com/PipeLine%E7%86%9F%E8%82%89.png)


# 总结
[*Javascript 标准库*](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects)

[map](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Array/map)

[reduce](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Array/Reduce)

[lodash](http://lodashjs.com/docs/)