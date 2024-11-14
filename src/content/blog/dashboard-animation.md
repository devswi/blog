---
title: 使用 Canvas 绘制仪表盘
pubDatetime: 2021-10-31T12:00:00.000Z
tags:
  - animation
  - canvas
description: 为了动态显示题目的完成情况，设计师想到了一个仪表盘动画，这篇文章就分享一下我是如何通过 Canvas 实现仪表盘动画的
draft: false
---

## 先看效果

<iframe height="380" style="width: 100%;" scrolling="no" title="Dashboard by Canvas " src="https://codepen.io/shiwei93/embed/abKPQPM?default-tab=html%2Cresult" frameborder="no" loading="lazy" allowtransparency="true" allowfullscreen="true">
  See the Pen <a href="https://codepen.io/shiwei93/pen/abKPQPM">
  Dashboard by Canvas </a> by 施伟 (<a href="https://codepen.io/shiwei93">@shiwei93</a>)
  on <a href="https://codepen.io">CodePen</a>.
</iframe>

## 前言

Sketch 中，有一个功能叫做<span className="text-red-600 font-medium">旋转副本</span>，顾名思义选中一个图形，点选一下旋转副本，就能按照设定的角度实现静态仪表盘了。参考这样的思路，思考下过往做 iOS 开发的经验，`Core Graphics` 应该可以完美实现静态仪表盘。Web 前端就可以通过 [Canvas](https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API) 搭配上 `<canvas>` 标签实现。事实也证明 `Canvas` 和 `Core Graphics` 在 API 设计上都极其相似。

## 实现

观察设计稿之后，发现仪表盘不是半圆。这就又涉及到如何计算角度了，为了合理偷懒，那就暂定圆弧弧度为 240<sup className="align-super">。</sup>吧。毕竟勾股定理，比起三角函数还是好记的太多了。

确定了圆弧角度之后，为了绘制图形我们需要清理一块画布，首先获取到 dom 上用来绘图的元素，同时保存一下后面会反复用到的上下文。

```typescript
this.canvas = document.getElementById('canvas') as HTMLCanvasElement;
this.ctx = this.canvas.getContext('2d');
```

图层的左上角是 `(0, 0)` 如果仍然以左上角为原点，在后续的开发中就需要时刻计算坐标偏移量了，这势必带来特别大的计算量。于是接下来需要在当前的绘图上下文中切换原点的坐标。希望原点在水平方向居中，垂直方向上需要能够在顶部容纳最长的仪表刻度。

```typescript
this.ctx?.translate(
  width / 2,
  height - (this.radius * 3) / 5 - this.options.maxLineLength
);
```

Canvas 的绘制圆环的起始点都在三点钟方向，旋转下画布，让圆弧的起点移动到八点钟的方向

```typescript
this.ctx?.rotate((150 * Math.PI) / 180);
```

到目前为止，在画布上仍然什么都看不见，下面就开始添加仪表盘上的刻度。通过 For 循环，按照配置中的线条数，就可以依次在圆弧上画出刻度线了。

```typescript
for (let i = 0; i <= lines; i++) {
  this.ctx.beginPath();
  this.ctx.lineWidth = this.endIndex === i ? maxLineWidth : lineWidth;
  this.ctx.strokeStyle = '#eaeaea';
  // draw line
  this.ctx.moveTo(this.radius, 0); // 设置起点
  this.ctx.lineTo(this.radius + lineLength, 0); // 设置终点
  this.ctx.stroke();
  // 圆弧的弧度为 240° 即 4/3 π，那么每条线的弧度为 4/3π/线条数
  this.ctx.rotate((Math.PI * 4) / 3 / lines); // 换转
}
```

解读一下代码块中的实现

1. `beginPath()`告知上下文需要开始画图了
2. `lineWidth` 和 `strokeStyle` 定义了接下来绘制图形的线条宽度和样式
3. 绘制线条的操作就和 iOS 一致了，首先移动起点到 `(radius, 0)` 终点就是 `(radius + lineLength, 0)`
4. 之后就是每一条仪表线绘制结束之后旋转下画布了运行一下，就可以看到圆弧上均匀分步了灰色的仪表线条。

## 动画

`Core Graphics` 提供了配套的执行动画方式，Canvas 就没有这么幸运了。好在之前处理 Web 平滑滚动时，了解到 `window.requestAnimationFrame` 可以用于处理定时循环操作。在仪表盘上同理，就实现示例中的仪表盘动画了。源码可以查看文章开头的 Codepen。

> Q: `requestAnimationFrame` 和 `requestIdleCallback` 的区别在哪? 哪个函数在屏幕重绘前调用? 哪个又在之后调用? 这一系列问题，后面有时间，咱们细聊
