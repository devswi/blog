---
title: Redux 笔记
author: swi
pubDatetime: 2023-02-13T00:00:00.000Z
featured: true
draft: false
tags:
  - notes
  - react
ogImage: ''
description: 了解 Redux 的基本概念，记录 Redux 的学习笔记
---

## Redux 是什么

**[Redux](https://redux.js.org/)是通过 actions 事件，管理与更新应用状态的工具**。换一种说法就是，在某个地方统一管理整个应用的状态数据，避免了状态/事件等在组件之间来回传递的尴尬局面。举个例子：

![redux-notes](@assets/images/redux/redux-notes-old.png)

我们希望 _component A_ 中的按钮点击事件，会触发 _count_ 值的更新，而 _count_ 值的更新，又要触发 _component B_ 的重新渲染。在传统的 React 项目中，我们的做法通常是将 _count_ 的定义提升到父组件中，通过 props 传参的形式来影响各个子组件。同样的需求，使用 Redux 实现方式如下图。

![use-redux](@assets/images/redux/use-redux.png)

从图中可以看出，应用状态都被放置在一个名为 **store** 的容器中。_componetn A_ 需要通过 **dispatch** 方法，借助 **reducer** 来更新状态，而 _component B_ 订阅了状态变化，就能够收到通知获取新的状态重新渲染 UI。

> 上图中，除了订阅方法之外，我们可以通过结合 React 自身提供的 Context 以及 useReducer 一起实现上图中类似的功能

## Redux 术语

### Actions

**Actions** 是一个包含 `type` 属性的空对象，<b>用来描述应用内发生的事件</b>。使用 `useReducer` 的时候，对于 `action.type` 的命名没有制定过规范，而 Redux 要求 `type` 的格式应当是 **domain/eventName** 格式的字符串。例如第一部分的自增事件，`type` 应当命名为 **counter/increase**。**Actions** 还可以有一个额外参数 _payload_ 作为事件的附加信息，用于传递数据等操作。

### Reducers

`reducer` 是一个函数，函数定义大致如下

```typescript
function xxxReducer(state = initialState, action): newState {}
```

### Store

当前应用的所有状态信息都存储在 **Store** 中。通过 `createStore` 来创建 **Store**，通过 `getState` 方法来获取当前的状态信息。

### Dispatch

**dispatch** 是 Redux 中唯一可以更新状态的方法，通过 `store.dispatch(action)` 进行调用。

### Selectors

**Selectors** 的作用是用来读取存储在 **Store** 中一小部分数据，**Selectors** 我理解为是一种规范，当 **Store** 中的数据结构变的复杂后，**Selectors** 能够保证获取同一数据片段的一致性。

## 实践

实践部分就参考官网教程在 _ttask_ 中实现一个简单的 Todo 应用。

### 依赖安装

```bash
pnpm add @reduxjs/toolkit react-redux --filter web

pnpm add @types/react-redux -D --filter web
```

### 项目结构

官方文档中的目录结构和 nextjs 推荐的目录结构类似，按照应用的功能模块，拆开统一放置在 `features` 目录下，大致目录结构参考如下

```plain
/src
  /app
    store.ts -- 创建 redux store 实例
  /features
    /todos   -- 操作 todo 事项功能，例如新建，删除等
      todosSlice.ts -- redux 分片
    /filter
      filterSlice.ts -- redux 分片
```

### 创建 Store

使用 Redux Toolkit 提供的 `configureStore` 方法创建 store

```typescript
// app/store.ts
import { configureStore } from '@reduxjs/toolkit';

export default configureStore({
  reducer: {},
});
```

### 通过 Provider 在应用中共享 store

使用 React-redux 提供的 `<Provider>` 组件包装一下应用原来的组件，在 _ttask_ 项目中，修改 `_app.tsx` 文件。

```typescript
// _app.tsx
import { Provider } from 'react-redux';
import store from '@app/store';

const App = ({ children }: AppProps) => {
  return <Provider store={store}>{children}</Provider>;
};
```

### 创建 Redux 切片(slices) 与 actions

首先，定义 Todo 任务的数据结构包含如下字段

```typescript
export enum Status {
  // 任务待处理
  Pending,
  // 任务进行中
  OnProgress,
  // 任务完成
  Completed,
}

// 筛选任务状态类型，包含了 'all'
export type AllStatus = 'all' | Status;

const priority = ['low', 'medium', 'high', 'urgent'] as const;
type Priority = (typeof priority)[number];

interface Todo {
  id: string;
  title: string;
  status: Status;
  priority?: Priority;
}
```

Todo list 的 actions 大致包括下面的几个

| action.type             | action.payload          | 描述           |
| ----------------------- | ----------------------- | -------------- |
| `todos/added`           | `{ title, proority? }`  | 添加新任务     |
| `todos/statusChanged`   | `{ todoId, status }`    | 修改任务状态   |
| `todos/priorityChanged` | `{ todoId, priority? }` | 修改任务优先级 |

Readux Toolkit 提供了 `createSlice` API，用来拆分 _reducer_ 的逻辑和 actions 操作。

```typescript
// features/todos/todoSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Status, Todo } from '@models';
import { v4 as uuidv4 } from 'uuid';

type Todos = { entities: Todo[] };

const initialState: Todos = {
  entities: [],
};

const todosSlice = createSlice({
  name: 'todos',
  initialState,
  reducers: {
    added(state, action: PayloadAction<Pick<Todo, 'title' | 'priority'>>) {
      const { title, priority } = action.payload;
      const newTodo: Todo = {
        id: uuidv4(),
        status: Status.Pending,
        title,
        priority,
      };
      state.entities.push(newTodo);
    },
    statusChanged(state, action: PayloadAction<Pick<Todo, 'id' | 'status'>>) {
      const { id: todoId, status } = action.payload;
      const todo = state.entities.find(entity => entity.id === todoId);
      if (todo) todo.status = status;
    },
    priorityChanged(
      state,
      action: PayloadAction<Pick<Todo, 'id' | 'priority'>>
    ) {
      const { id: todoId, priority } = action.payload;
      const todo = state.entities.find(entity => entity.id === todoId);
      if (todo) todo.priority = priority;
    },
  },
});

export const { added, statusChanged, priorityChanged } = todosSlice.actions;

export default todosSlice.reducer;
```

上面的代码片段就是 `createSlice` 用法了，再回头看官方文档中介绍的 `createSlice` 的优势就能有更深的体会了

- 在 `reducer` 字段中，以函数的形式实现 `reducer` 的每个 case，告别传统的 _switch/case_
- 状态的修改可以使用更简短的不可变更新逻辑，告别了传统对象展开方式，通过 [immer](https://immerjs.github.io/immer/) 实现
- 可以根据定义在 `reducer` 中的函数，自动生成相应的 _action_

同理，可以很容易的定义出任务过滤的 actions 以及 slice 的实现

| action.type                   | action.payload | 描述             |
| ----------------------------- | -------------- | ---------------- |
| `filters/statusFilterChanged` | `status`       | 按照任务状态过滤 |

```typescript
// features/filters/filtersSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { AllStatus } from '@models';

type TodoFilter = { status: AllStatus };

const initialState: TodoFilter = {
  status: 'all',
};

const filtersSlice = createSlice({
  name: 'filters',
  initialState,
  reducers: {
    statusFilterChanged(state, action: PayloadAction<AllStatus>) {
      state.status = action.payload;
    },
  },
});

export const { statusFilterChanged } = filtersSlice.actions;

export default filtersSlice.reducer;
```

完成了 slice 实现之后，就需要将两个切片内容整合起来，修改 `app/store.ts` 文件，在 `createStore` 方法中添加定义好的两个切片。

```typescript
import { configureStore } from '@reduxjs/toolkit';
import filtersSlice from '@features/filters/filtersSlice';
import todosSlice from '@features/todos/todosSlice';

const store = configureStore({
  reducer: {
    todos: todosSlice,
    filters: filtersSlice,
  },
});

// 导出 RootState 和 AppDispatch 两个类型，在 Typescript 项目中非常有用
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;
```

启动前端服务，在浏览器中，通过 [redux-devtools](https://github.com/reduxjs/redux-devtools) 浏览器插件，就能看到 _redux store_ 中的初始状态。

![redux-devtools](@assets/images/redux/redux-devtools.png)

### 在组件中使用 Redux 的 State 与 Actions

> 参考 nextjs 中对 _features_ 目录的定义，功能相关的组件也需要放在 _features_ 目录下

在 `features/filters/StatusFilter.tsx` 文件，并添加一下代码片段，并将组件添加到页面上。

```typescript
import { useSelector, useDispatch } from 'react-redux';
import { AllStatus, Status } from '@models';
import { formatFilterTag } from '@utils';
import { RootState, AppDispatch } from '@app/store';
import { statusFilterChanged } from './filtersSlice';

const StatusFilter = () => {
  // 1.
  const currentStatus = useSelector((state: RootState) => state.filters.status);
  // 2.
  const dispatch = useDispatch<AppDispatch>();

  return (
    <section className="flex items-center my-6">
      {['all', 0, 1, 2].map((key) => (
        <div
          key={key}
          className={`filter-tag ${currentStatus === key ? 'selected' : ''}`}
          // 3.
          onClick={() => dispatch(statusFilterChanged(key as AllStatus))}
        >
          {formatFilterTag(Status[key as Status] || 'all')}
        </div>
      ))}
    </section>
  );
};

export default StatusFilter;
```

简单说明一下代码片段中的注释标记

1. 定义 `RootState` 可以帮助我们在使用 `useSelectore` hook 时，有更好的类型提示
2. 从 `useDispath` hook 中获取到 `dispatch` 函数
3. `statusFilterChanged` 方法是有 reducer 函数生成，函数定义如下，可以说 `redux-toolkit` 大大简化了 `dispatch` 的调用行为

```typescript
statusFilterChanged(payload: AllStatus): {
    payload: AllStatus;
    type: "filters/statusFilterChanged";
}
```

### 处理异步逻辑

上文过滤器的处理逻辑，都是同步的。筛选按钮的 `onClick` 方法中，调用了 `dispatch` 方法，`store` 运行 `reducer` 并返回新的状态。但大多数应用场景，都是异步操作，比如通过 API 获取数据。Redux 当然考虑好了异步场景，并引入了一个新的名词 **thunk**。

**thunk** 一种特殊类型的 Redux 函数，thunk 函数能够处理异步逻辑。**thunk** 的内部返回了一个函数，该函数接收 `dispatch` 和 `getState` 两个参数，并直接返回该内部函数。

```javascript
// 外部 "创建 thunk" 函数
const fetchUserById = userId => {
  // 内部 "thunk" 函数，接收 `dispatch` 和 `getState` 参数
  return async (dispatch, getState) => {
    try {
      const user = await userAPI.fetchById(userId);
      // 异步函数执行完毕，调用 `dispatch`
      dispatch(userLoaded(user));
    } catch (err) {
      // 错误处理
    }
  };
};
```

> `redux` 需要使用 `redux-thunk` 中间件，才能使用 `thunk` 处理异步逻辑。RTK (Redux Toolkit) 已经默认启用了 `redux-thunk` 插件。

接下就在 _ttask_ 项目中添加加载 todo list 的异步逻辑。

#### 新建 API 模拟数据

在 _server_ 项目中添加 `/src/controllers/v1/todos.ts` 文件，并定义一个 _controllers_

```typescript
import { Controller, Get, RouterContext } from '@swizm/nflask';

@Controller('/todos')
class Todos {
  @Get('/')
  async getAllTodos(ctx: RouterContext) {
    ctx.body = {
      objects: [],
    };
    ctx.status = 200;
  }
}

export default Todos;
```

#### 管理请求状态

修改定义在 `todosSlice` 中的 `Todo` 类型，新增如下 `status` 和 `error` 字段，用于管理请求状态和请求失败时的错误信息。

```typescript
type Todos = {
  entities: Todo[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
};
```

#### 使用 `createAsyncThunk` 方法请求数据

首先添加一个请求方法，通过 [axios](https://github.com/axios/axios) 请求本地启动的 _server_ 服务 `http://localhost:3000/api/v1/todos`。接下来使用 `createAsyncThunk` 新建 `thunk` 函数。

```typescript
export const fetchTodos = createAsyncThunk<Todo[]>(
  'todos/fetchTodos',
  async () => {
    const response = await getAllTodos();
    return response.data.objects;
  }
);
```

> _server_ 项目对跨域没有做任何处理，这里也就成功的触发了跨域，跨域不在本文的讨论范围之内，快速解决一下，详情还是参考 [MDN 官方文档](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS) 吧

注意 `createAsyncThunk` 的第一个参数，这个参数可以等价的认为是 **actions** 的 _type_ ，当数据被请求时，开发工具里会显示以这个参数作为前缀的事件类型，如下图

![redux-async-thunk](@assets/images/redux/redux-async-thunk.png)

通过 `createAsyncThunk` 定义了获取 API 数据的方法，但是并没有定义在 `slice` 的 `reducers` 属性中，`createSlice` 提供了 `extraReducers` 属性，用来解决响应 **未定义** 在 `reducers` 中的 `reducer`。

```typescript
const todosSlice = createSlice({
  name: 'todos',
  // ...
  reducers: {},
  extraReducers(builder) {
    builder
      .addCase(fetchTodos.pending, state => {
        state.status = 'loading';
      })
      .addCase(fetchTodos.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.entities = state.entities.concat(action.payload);
      })
      .addCase(fetchTodos.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message ?? 'Fetch request failed';
      });
  },
});
```

`extraReducers` 是一个参数为 `builder` 的函数，我们通过 `builder.addCase(actionCreator, reducer)` 方法来处理每个异步 `thunk` 场景。

#### 组件中获取 Todos 列表数据

还记得上文 `StatusFilter` 组件的开发吗？这里 Todo 列表组件也同理需要放置在 _features/todos_ 目录下。

```typescript
import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { AppDispatch, RootState } from '@app/store';
import { fetchTodos, selectAllTodos } from './todosSlice';

const TodosList = () => {
  const dispatch = useDispatch<AppDispatch>();
  const todos = useSelector(selectAllTodos);
  const todosStatus = useSelector((state: RootState) => state.todos.status);

  useEffect(() => {
    if (todosStatus === 'idle') {
      dispatch(fetchTodos());
    }
  }, [todosStatus, dispatch]);

  return (
    <section>
      {todos.map((todo) => (
        <div key={todo.id}>{todo.title}</div>
      ))}
    </section>
  );
};

export default TodosList;
```

单纯的 React 项目，都会使用 `useFetch` 这个知名度很高的 hooks 来处理，页面首次加载时请求数据的场景。在 Redux 中，也一样需要在 `useEffect` 中，当状态为 `idle` 时发起首次请求。

### 实现状态筛选

最后就是关于任务筛选状态之后，显示对应的任务列表了。修改一下 _todoSlice_ 中的 `getAllTodos` 方法就可以了。

```typescript
export const selectAllTodos = (state: RootState) => {
  const {
    filters: { status },
    todos,
  } = state;
  if (status === 'all') return todos.entities;
  return todos.entities.filter(todo => todo.status === status);
};
```

## 总结

至此，跟着官方文档，对 Redux 有了个简单了解。对 Redux 的认知再也不是过去 React 的 **Context** 配合 **useReducer** 等于 Redux。Redux 不仅仅只是通过全局 Store 管理应用程序状态的简单工具，而更像是配合 React 一起协作的生态。[redux-toolkit](https://github.com/reduxjs/redux-toolkit) 提供的 `createStore`/`createSlice`/`createAsyncThunk` 等方法以及 [react-redux](https://github.com/reduxjs/react-redux) 提供的一些 hook 简化了 Redux 的使用成本。同时我们也在 [ttask](https://github.com/shiwei93/ttask) 的 web 子项目中做了实践，不过还只是文档做的简单功能，一定存在更加高级且便利的用法，以后在继续学习补充吧。
