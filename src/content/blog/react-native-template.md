---
title: 'Custom React Native Template'
pubDatetime: 2022-11-24T12:00:00Z
tags:
  - react-native
description: The template of React Native which include typescript is good enough, but it's complicated to config prettier, eslint, etc every time. So I need to make a template which contains the basic configuration used during my daily development.
draft: false
---

When I use the offical template which recommend in the React Native doc, I have some trouble with it. Such as the version of ruby is different with recommended verison and I have to config prettier, eslint, etc every time.

Ideal React or React Native project template need to contain basic configuration as below:

1. Format and linter configuration
2. Basic dependencies
3. Gemfile is only apply to iOS project, so this file need to move into the iOS folder

Thanks for [devaslife's video](https://www.youtube.com/watch?v=w-M9UFHLAl0), this video is incredible and help me a lot.

The template I made include the following configurations:

1. Add `prettier` and `eslint` configuration
2. Add `husky` and `lint-staged` which I used every day
3. Add wonderful open source dependencies, such as
   - `@react-navigation/native` and `@react-navigation/native-stack` for navigating between screens.
   - `react-native-safe-area-context`
   - `react-native-gesture-handler` is used to handle user gesture
   - `react-native-reanimated`, this is an elegant animation libray in React Native
4. Move Gemfile into iOS folder
5. Update ruby version to `2.7.6`, [Offical Ruby version](https://github.com/facebook/react-native/blob/main/template/_ruby-version)

Full template source code is [here](https://github.com/devswi/react-native-template-swi/tree/main/template)

## How to use

```bash
npx react-native init YourProjectName --template @swizm/react-native-template
```
