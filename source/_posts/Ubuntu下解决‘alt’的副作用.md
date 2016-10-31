---
title: Ubuntu下解决‘alt’的副作用
date: 2016-08-10 11:02:40
subtitle: 让你的开发环境变得更好
author: Martin张灏哲
tags:
  - Ubuntu
  - Linux
header-img:
---
# Ubuntu下解决‘alt’的副作用

在Ubuntu下写程序的时候，会用到很多IDE或者编辑器，如**Sublime Text**、**VSCode**、**Webstorm**之类的，那就会发现在多列编辑的时候，会和系统默认的快捷键有冲突。

这个```alt + 拖动```快捷键组合在系统设置里是找不到的，因为是系统默认触发```alt + Handle```

所以我们需要用命令行去替换：

1，打开终端，菜单-编辑-配置文件首选项-命令，勾上“以登录Shell方式运行命令”，重启终端。
2，在终端输入 ```gsettings get org.gnome.desktop.wm.preferences mouse-button-modifier```查看```mouse-button-modifier```当前的值，应该是返回```<Alt>```。
3，接着输入 ```gsettings set org.gnome.desktop.wm.preferences mouse-button-modifier '<Super><Alt>' ```（**值'<Super><Alt>'为要更改的按键，意为Win+Alt,也可以改为想要的键。测试此值不能为空或禁用，否则出现默认按下Alt键的效果。**）
4，完事记得取消**“以登录Shell方式运行命令”**。
