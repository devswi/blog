---
title: '在 figma 中创建组件'
pubDatetime: 2024-12-31T20:43:00+08:00
tags: ['design', 'notes']
description: 查阅 Figma 文档，学习如何在 Figma 中创建组件
featured: false
draft: false
---

无论是移动端还是前端开发，组件化都是一个老生常谈的概念。在 UI 设计中，借助于 figma 的组件概念，也能在不同页面中复用组件，提高设计效率。作为一个设计小白，趁着需求真空期，翻阅 figma 文档，学习如何在 figma 中创建可复用的 iOS Tab bar。

## 从 Tab Button 开始说起

应用的 Tab Bar 按钮是由 icon 和标题组成，第一步需要确定使用哪些 icon，从零开始绘制 icon 能力有限，目前看来是不现实的，那么借助开源的 icon 集合快速开始吧。这里我使用的是 [tabler](https://tabler.io/icons)，使用 [Iconify 的 figma 插件](https://www.figma.com/community/plugin/735098390272716381)，在 tabler 集合下，查找心仪的 icon。

> 为了方便管理，可以在 figma 中新建一个 section 专门管理项目中用到的 icon，App 内使用到的颜色也可以借助 section 统一管理。

![figma-section](@assets/images/figma/components/section.png)

在新建的 Icons section 中，打开 Iconify 插件，选中想要导入的 icon，点击右下角的选项按钮，点击下图中的第二个按钮 **Import as component** 快速导入 icon component。

![figma-import](@assets/images/figma/components/import-as-component.png)

接下来，从 Apple 提供的 figma 模板中导入 iPhone 的 Tab Bar 组件，复制里面的单个 Tab 作为自定义的 Tab Button 的基础，删除其中的 Symbol 字符，从侧边栏选择 `Assets` 找到上一步创建的 icon 组件，并点击 **Insert instance**，调整下 icon 与 label 的对齐与间距。

![tab-1](@assets/images/figma/components/tab-1.png)

选中整个 Tab 组件，使用快捷键 <kbd>⌘</kbd> + <kbd>⌥</kbd> + <kbd>K</kbd> 创建 Tab 组件，点击右侧边栏的 `Add property` 给 Tab Button 添加属性。

### 添加 label 属性

点击 `Add property` 的 `+` 按钮，选择 Text 属性，如下图所示，修改属性的命名与默认值，点击 `Create property` 按钮完成新建。

![tab-label](@assets/images/figma/components/label-property.png)

选中组件中文本，在右侧边栏中，点击如图所示的按钮，将文本的内容和 `label` 属性进行绑定。

![tab-link-label](@assets/images/figma/components/link-label-select.png)

![tab-link-label](@assets/images/figma/components/link-label-property.png)

### 添加 icon 属性

选中 Tab 组件，点击右侧边栏的 `Add property` 的 `+` 按钮，创建 `Instance swap` 类型的属性。

![tab-icon-property](@assets/images/figma/components/tab-icon-property.png)

或者，选中 Tab 组件中的 icon，在右侧边栏中，点击下图中的第二个按钮，figma 官方命名为 _instance swap property_

![tab-icon](@assets/images/figma/components/tab-icon.png)

点击之后就可以看到如下所示的 _component property_ 的创建页面。

![tab-icon-instance](@assets/images/figma/components/tab-icon-instance.png)

将需要使用的 icon 组件添加到下方的 `Preferred values` 中。接着和 `label` 属性一样，选中 icon 组件，在右侧边栏中，点击如图所示的按钮，将 icon 组件和 `icon` 属性进行绑定。

![tab-icon-bind](@assets/images/figma/components/tab-icon-bind.png)

到此为止，就完成了 `label` 和 `icon` 属性的创建与绑定，接下来就先来简单使用一下创建的 _Tab Button_ 组件，体验一下 figma 组件化的魅力。

### 组件化的魅力

新建一个矩形，调整下，让它能够适配带 Home Indicator 的 iPhone 尺寸，在侧边栏中，点击 `Assets` 添加一个之前创建好的 _Tab 组件_。选中组件，使用快捷键 <kbd>⌘</kbd> + <kbd>D</kbd> 快速复制 4 个 Tab 组件。用 [auto layout](https://help.figma.com/hc/en-us/articles/5731482952599-Add-auto-layout-to-a-design) 稍微调整一下，就变成了如图所示的样子。

![tab-bar](@assets/images/figma/components/tab-bar-1.png)

选中需要修改的组件，在右侧边栏中，就可以简单快捷的制作出心目中的 Tab Bar 了。

![tab-bar](@assets/images/figma/components/tab-bar-init.png)

## 添加 Tab Button 的选中状态

上文完成了最基本的 Tab Button 组件，接下来给 Tab Button 添加 Variant。

> 难怪这个单词怎么这么熟悉，tailwind 中也有 variant 的概念

![Add variant](@assets/images/figma/components/add-variant.png)

点击之后，figma 会复制一份之前的组件，并且默认添加了一个属性，这里修改属性名为 `State`，在上面的 Tab Button 中使用 `Default` 默认值，在下一个 Tab Button 中修改属性值为 `Selected`，并修改为选中状态的颜色。

![Add variant](@assets/images/figma/components/add-variant-state.png)

接着，我们把 Tab Bar 组件整体变为一个组件，添加一个 `Selected` 属性，来表示当前选中的 Tab 下标，这样在设计不同模块的页面时，能够快速应用。这里的步骤就不再赘述了，每次点击 `Add Variant` 之后，修改一下相应 Tab Button 的 `State` 属性，就可以快速构建不同选中下标的 Tab Bar 了。

![Done](@assets/images/figma/components/tab-bar-done.png)

## 写在最后

到这里也就完成了如何在 figma 中创建组件的笔记，也是我开始新年计划的一小步。2025 年给自己上了点小小的强度，之前也尝试给自己写过年终总结，也做过新年计划，不过重来没有完成过，因此 2025 年最重要的是希望自己能够坚持下来，虽然选择了家庭，选择离开大城市，但不代表可以平庸过完我的人生，就像自己 Github profile 上好多年都未曾换掉的那句话。

> Cease to struggle and you cease to live.
> 最怕你一生碌碌无为，还安慰自己平凡可贵

希望 2025 年 12 月 31 日，我能开开心心的回头来看我写于 2024 年 12 月 31 日 20:43 的这些话。

## 参考

- [Figma Explore component properties](https://help.figma.com/hc/en-us/articles/5579474826519-Explore-component-properties)
- [Figma Auto layout](https://help.figma.com/hc/en-us/articles/5731482952599-Add-auto-layout-to-a-design)
