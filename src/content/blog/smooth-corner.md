---
title: '实现平滑圆角'
pubDatetime: 2025-01-02T19:58:00+08:00
tags:
  - design
description: 上一篇文章学习了如何在 figma 中实现组件化，这一篇来看看如何实现小米新 logo 类似的平滑圆角
draft: false
featured: true
---

小米的新 logo 从之前的一眼圆角变为看起来胖胖的圆角，下图中左边为新 logo，右边为旧的 logo。

![logo](https://cdn.cnbj1.fds.api.mi-img.com/mi-mall/eb753f75f748f7497144e06661906c91.jpg?w=720&h=307)

看起来挺玄乎的，当时刚发布的时候，听到最多的声音就是这据说 200w 的设计费真好赚。后来原研哉先生在专访中提到这是一个符合品牌特性的设计，并提出了 **Alive** 的理念。作为一个程序员，设计小白，没法理解大师的理念，只能用最直白的话：胖乎乎的还挺好看。

那上文提到的 Tab Bar 中，添加一个类似的新增账单的按钮吧，查阅资料之后发现，这个平滑圆角不是我能用钢笔工具慢慢调整出来的，背后包含的数学概念十分复杂。幸好 figma 提供了 `Corner smoothing` 工具，能帮助我实现一个类似的效果。工具使用本身并不复杂，就像下图中的效果，按照自己的想法调整一下就可以了，我就简单粗暴直接拉满。

![smooth corner](@assets/images/figma/smooth/config.png)

## 代码实现

既然设计出来了，该如何实现这个胖乎乎的圆角呢？

### 点 9 图 (Nine-Slice Scaling)

最简单的方法当然是切图了，用背景图的形式，一行代码就搞定了。不过 `background-image` 有局限性，按钮的宽度与图片不一致时，背景图被拉伸了，就没有设计图上的效果了。那就得借助点 9 图来实现了，将 `background-image` 替换为 `border-image`。这在 Web 里非常容易实现，问题在于需要在 React Native 中实现，点 9 图似乎就不太容易实现了。一番查阅，大致有两种解决方案：

1. 将图片分成独立的 9 部分，依次填充到按钮组件中
2. figma 导出定制 SVG 包含 4 个角

对于方法 `1`，个人觉得比较丑陋，直接就 Pass 了。至于方法 `2` 这个用钢笔工具在 figma 中一个点一个点绘制圆角异曲同工了，也是超出能力范围了。

那怎么办？难道自己想出来的设计，就这样因为实现难度就直接胎死腹中了吗？

> 倒也不尽然

### react-native-svg 绘制 svg

在我坚持不懈的否定下，强大的 ChatGPT 给出了如下答案

```typescript
export default function SmoothCorner({ className = '', width = 34, height = 34, radius, smoothing = 0.6 }: SmoothCornerProps) {
  const smoothRadius = radius + radius * smoothing * 0.6 // 平滑角的实际半径

  const pathData = `
    M${smoothRadius},0
    H${width - smoothRadius}
    C${width}, 0 ${width}, ${0} ${width}, ${smoothRadius}
    V${height - smoothRadius}
    C${width}, ${height} ${width}, ${height} ${width - smoothRadius}, ${height}
    H${smoothRadius}
    C0,${height} 0, ${height} 0, ${height - smoothRadius}
    V${smoothRadius}
    C0,0 0,0 ${smoothRadius},0
    Z
  `

  return (
    <View className={className}>
      <Svg width={width} height={height}>
        <Path d={pathData} fill="currentColor" />
      </Svg>
    </View>
  )
}
```

在项目中试用一下

![res](@assets/images/figma/smooth/res.png)

效果是实现了，不过 `radius` 参数和正常的效果不一致了，同样的数值但曲率变小了，多次尝试无果，只能慢慢调整，留个 _Todo_ 吧。

## 参考

- [Adjust corner radius and smoothing](https://help.figma.com/hc/en-us/articles/360050986854-Adjust-corner-radius-and-smoothing)
