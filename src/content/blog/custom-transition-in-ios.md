---
title: 自定义转场动画
author: swi
pubDatetime: 2020-06-10T20:45:00.000+08:00
featured: false
draft: false
tags:
  - iOS
ogImage: ''
description: ''
---

## 目标

- 转场 API 是如何被构建的
- 如何使用自定义转场实现 present 和 dismiss
- 如何构建可交互的转场

## 转场 API

![API](https://koenig-media.raywenderlich.com/uploads/2015/07/parts.001.jpg)

### 基础概念

#### Transitioning Delegate

每一个视图控制器都有 `transitioningDelegate` 这是一个遵循了 `UIViewControllerTransitioningDelegate` 的 object。

无论是 present 还是 dismiss 一个视图控制器，UIKit 都会从视图控制器的 `transitioningDelegate` 找到所需的动画控制器。使用自定义的转场动画就需要实现一个转场代理并返回期望的动画控制器。

#### Animation Controller

动画控制器是一个实现了 `UIViewControllerAnimatedTransitioning` 协议的 object。

#### Transitioning Context

转场上下文实现了 `UIViewControllerContextTransitioning` 协议，并且在转场过程中扮演了至关重要的角色：它将转场涉及到的 View 和 View Controller 封装在其内部。

## 转场流程

1. 触发转场，调用 present / dismiss API 或者通过 segue
2. UIKit 询问 "to" 将要显示的视图控制器的转场代理。如果返回 nil，UIKit 将使用内建的默认转场
3. UIKit 通过 `animationController(forPresented:presenting:source:)` 获取动画控制器，如果返回 nil 则使用默认的动画
4. UIKit 构建转场上下文环境
5. UIKit 通过 `transitionDuration(using:)` 获取执行动画的时长
6. UIKit 执行动画控制器中的 `animateTransition(using:)` 执行转场动画
7. 最后，动画控制器调用转场上下文中的 `completeTransition(_:)` 来声明动画完成

# 参考文章

- [HeroTransitions/Hero](https://github.com/HeroTransitions/Hero)
- [raywenderlich](https://www.raywenderlich.com/322-custom-uiviewcontroller-transitions-getting-started)
