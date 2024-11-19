---
title: 在 Expo 项目中使用 nativewind
pubDatetime: 2024-11-19T15:58:00Z
tags:
  - react-native
  - notes
description: 记录下在 Expo 项目中使用 nativewind 遇到的问题
draft: false
---

在日常开发 React 或 Vue 项目时，我都经常使用 [tailwindcss](https://tailwindcss.com/) 来快速搭建 UI。最近**再次**开始了学习 React Native 的旅程，我们可以借助于 [nativewind](https://nativewind.dev/)，在 React Native 中使用 tailwindcss。不过今天在参考 [nativewind 官方文档](https://www.nativewind.dev/getting-started/expo-router) 配置 nativewind 时却遇到了几个让我困惑的地方，这篇笔记就记录下我遇到的问题。

## 新的 Expo 项目

参考 [Expo 文档](https://docs.expo.dev/more/create-expo/#--template)使用 `pnpm create expo-app` 新建一个 Expo 项目，在不使用 `--template` 指定模版的情况下，新建的 Expo 项目会默认有两个 Tab 页。可以在项目目录下执行 `pnpm reset-project` 来重置项目。

此时开始配置 nativewind，参考 nativewind 的文档，首先添加依赖

```bash
pnpm install nativewind tailwindcss react-native-reanimated react-native-safe-area-context
```

执行 `pnpm tailwindcss init` 新建 `tailwind.config.js` 或者手动创建 `tailwind.config.ts`，这里我自己手动创建了 typescript 配置文件。

```typescript
import type { Config } from 'tailwindcss';

export default {
  content: ['./app/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {},
  },
  plugins: [],
} satisfies Config;
```

和 Web 项目中使用 tailwindcss 一样，需要新建一个 CSS 文件，添加 tailwind 的基础样式。

```CSS
@tailwind base;
@tailwind components;
@tailwind utilities;
```

并且在 _app/\_layout.tsx_ 文件中导入这个 CSS 文件。

到这里我就开始尝试在页面中使用 `className` 来编写样式了，但发现并没有生效。查看 nativewind 文档时，第三步 `Add the Babel preset` 时，发现按上面的步骤新建的 Expo 项目并没有 `babel.config.js` 就人为跳过了。

> 教训：多看文档别跳过!

回到 [Expo 文档](https://docs.expo.dev/versions/latest/config/babel/) 关于 babel 配置说明，有如下一段话

> Each new Expo project created using npx create-expo-app configures Babel automatically and uses babel-preset-expo as the default preset. There is no need to create a babel.config.js file unless you need to customize the Babel configuration.

原来如此，Expo 项目默认会配置 `babel-preset-expo`，因此新建项目时不会添加 `babel.config.js` 文件，我们可以通过执行 `pnpm expo customize` 生成 `babel.config.js` 文件，然后在里面添加 nativewind 需要的配置。

按照 nativewind 的文档，修改 `babel.config.js` 文件

```javascript
module.exports = function (api) {
  api.cache(true);
  return {
    presets: [
      ['babel-preset-expo', { jsxImportSource: 'nativewind' }],
      'nativewind/babel',
    ],
  };
};
```

同样需要修改 `metro.config.js` 文件，使用 `pnpm expo customize` 时可以一起选择 `metro.config.js`。

```javascript
const { getDefaultConfig } = require('expo/metro-config');
const { withNativeWind } = require('nativewind/metro');

const config = getDefaultConfig(__dirname);

module.exports = withNativeWind(config, { input: './global.css' });
```

重启项目，就可以在项目中愉快的使用 tailwindcss 了。
