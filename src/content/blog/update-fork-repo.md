---
title: '更新 frok 的 Git 仓库'
pubDatetime: 2018-08-05T12:00:00+08:00
tags:
  - git
draft: false
description: ''
---

在 GitHub 上 fork 的 swift 仓库还是很久之前的。开始阅读代码时，怎么更新呢？这是个问题，查阅了 Google，解决方法如下，记录下来。

1. 使用 `git remote add` 增加源分支地址到项目远程分支列表中 `git remote add swift git@github.com:apple/swift.git`
2. 使用 `git remote -v` 查看添加结果
3. 通过 `git fetch swift` 将源分支最新的代码拉取到本地
4. 合并两个版本的代码 `git merge swift/master`
5. 将合并完成的代码 push 到自己 fork 之后的仓库里

```bash
git push origin master
```

DONE!!!

