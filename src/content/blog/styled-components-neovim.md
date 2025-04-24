---
title: '在 neovim 中使用 styled-components'
pubDatetime: 2025-01-07T13:24:00+08:00
tags:
  - notes
  - neovim
description: 最近又开始使用 styled-components，记录下如何在 neovim 中使用
draft: false
featured: false
---

最近又看了看 styled-components，上次用 styled-components 还是在扇贝的时候，回老家之后都写的 Vue 没机会使用 styled-components 了。这段时间新入坑了 React Native，在 nativewind 和 styled-components 之间抉择一下，打算都尝试一下，看看庶强庶弱。之前已经尝试过 nativewind 了，项目配置完成只需要安装 `tailwindcss-language-server` 就可以正常使用了。`styled-components` 相对来说稍微复杂一下，需要做如下修改

1. [nvim-treesitter](https://github.com/nvim-treesitter/nvim-treesitter) 安装 `styled`
2. 项目中安装 [typescript-styled-plugin](https://github.com/styled-components/typescript-styled-plugin)
3. `styled-components` 的类型定义需要安装 `@types/styled-components-react-native`

![sample](@assets/images/styled-components.png)
