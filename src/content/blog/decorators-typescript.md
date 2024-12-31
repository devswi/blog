---
title: Typescript decorators 装饰器
pubDatetime: 2023-02-03T21:12:00+08:00
tags:
  - nodejs
  - typescript
description: 不再羡慕 Python 的装饰器，Typescript 有自己的装饰器
draft: false
---

`@koa/router` 为 `koa` 带来了 `express` 一样通过 `router.get('/api')` 等方法定义路由的能力。但这样定义路由的方法过于传统了，[flask](https://flask.palletsprojects.com/) 就使用了 Python 的装饰器来简化路由的定义。开源社区也有很多项目，通过 Typescript 的装饰器 (decorators) 简化路由定义。

```python
@app.route("/")
def hello_world():
  return "<p>Hello, World!</p>"
```

## 什么是装饰器

[官方解释](https://www.typescriptlang.org/docs/handbook/decorators.html): Decorators provide a way to add both annotations and a meta-programming syntax for class declarations and members.

装饰器是为类和类成员提供注解和元编程语法的一种方式。还是抽象，看下面的一个例子吧。

> 由于装饰器还是 Typescript 中的一个实验性功能，如果需要在 Typescript 代码中使用装饰器，需要在 tsconfig 配置中添加 `experimentalDecorators: true`

假设我们对于需要存储的实体都需要生成一个随机 ID 与创建时间字符串，没有装饰器之前，我们可以定义一个 `Entity` 类

```typescript
class Entity {
  id: number;
  created: string;

  constructor() {
    this.id = Math.floor(Math.random() * 1000);
    this.created = new Date().toLocaleDateString();
  }
}
```

有了 `Entity` 类之后，我们就可以以此为基础定义我们需要的数据结构，例如定义 `User` 和 `City` 两个类

```typescript
class User extends Entity {
  name: string;
  constructor(name: string) {
    super();
    this.name = name;
  }
}

class City extends Entity {
  zipCode: string;
  constructor(zipCode: string) {
    super();
    this.zipCode = zipCode;
  }
}

const swi = new User('swi');
const nanjing = new City('210000');
```

使用装饰器，可以这样写

```typescript
function Entity() {
  return function <K extends { new (...args: any[]): {} }>(constructor: K) {
    return class extends constructor {
      id = Math.floor(Math.random() * 1000);
      created = new Date().toLocaleDateString();
    };
  };
}

@Entity()
class User {
  name: string;
  constructor(name: string) {
    this.name = name;
  }
}

@Entity()
class City {
  zipCode: string;
  constructor(zipCode: string) {
    this.zipCode = zipCode;
  }
}
```

需要注意的是，使用装饰器的情况下，无法访问装饰器新增的字段，例如上面的例子，我们无法通过 `new User('swi').id` 或 `new User('swi').created` 访问 `id` 以及 `created`。这是一个[已知问题](https://github.com/microsoft/TypeScript/issues/4881)，目前我们可以通过额外定义 `interface` 来解决，不过这个问题并不影响本文需要实现的功能。

```typescript
interface EntityType {
  id: number;
  created: string;
}

interface User extends EntityType {}
```

之后就可以访问 `id` 与 `created`。上面的 `Entity` 属于类装饰器，装饰器共有如下几种类型

1. 类装饰器 - Class Decorators
2. 方法装饰器 - Method Decorators
3. 属性装饰器 - Property Decorators
4. 访问器装饰器 - Accessor Decorators

### 方法装饰器 - Method Decorators

[core-decorators](https://github.com/jayphelps/core-decorators) 提供了一些常用的装饰器示例，虽然已经被 archived 不过参考里面的示例，可以窥探一些装饰器的用法。例如其中提供的 `@deprecate` 装饰器，用于标记废弃的函数。当调用被标记为废弃的函数时，控制台会打印废弃信息。

```typescript
type DeprecatedProps = {
  // 过期信息
  message: string;
};

function Deprecated(props?: DeprecatedProps) {
  return function (
    target: Object,
    propertyKey: string | symbol,
    descriptor: PropertyDescriptor
  ) {
    const original = descriptor.value as Function;
    const key =
      typeof propertyKey === 'string' ? propertyKey : propertyKey.toString();
    const msg = props?.message ?? 'has been marked deprecated.';
    descriptor.value = function (...args: any[]) {
      console.warn(`DEPRECATED ${target.constructor.name}#${key}: ${msg}`);
      return original.call(args);
    };
  };
}
```

在之前的例子里，给 `User` 的 `retreat` 方法加个装饰器

```typescript
@Deprecated({ message: '已经废弃' })
retreat() {
  console.log('retreat is executed');
}
```

此时再次调用 `retreat` 就可以在控制台看到废弃的警告信息了。

### 属性装饰器 - Property Decorators

属性装饰器和方法装饰器相比，没有 `descriptor` 参数。还以上面的 `User` 类为例，新增一个 `age` 属性用来表示用户的年龄，年龄一定是正数。不使用装饰器的情况下，我们需要重写 `age` 的 `setter` 方法，并在函数内部做判断。借助装饰器，可以将比较逻辑统一封装起来，避免重复实现。

```typescript
import 'reflect-metadata';

function PositiveInteger(target: object, propertyKey: string | symbol) {
  const keyType = Reflect.getMetadata('design:type', target, propertyKey);
  const key =
    typeof propertyKey === 'string' ? propertyKey : propertyKey.toString();
  if (keyType.name !== 'Number') {
    throw new Error(
      `The type of ${target.constructor.name}#${key} must be number.`
    );
  }
  let value: typeof keyType;
  Object.defineProperty(target, propertyKey, {
    set(newValue: number) {
      if (newValue <= 0) {
        throw new Error(
          `ERROR: ${target.constructor.name}#${key} must be positive!`
        );
      }
      if (newValue !== Math.floor(newValue)) {
        throw new Error(
          `ERROR: ${target.constructor.name}#${key} cann't be a float number`
        );
      }
      value = newValue;
    },
    get() {
      return value;
    },
    configurable: true,
  });
}
```

接下来给 `age` 属性添加 `@PositiveInteger` 装饰器。

```typescript
user.age = -12;
```

运行代码，在控制台就能够看到报错了。

> 看起来 `@PositiveInteger` 实现了需求，不过也存在如下两个问题。
>
> 1. `user.age = -12` 的报错只会在运行时报错
> 2. `@PositiveInteger` 的实现方式会导致 `Object.keys(user)` 不会返回 `age` 属性，目前看来这是一个已知问题

### 访问器装饰器 - Accessor Decorators

访问器装饰器作用于 _Property Descriptor_ 来对访问器方法进行监听、修改等操作。仍然以上文中的年龄属性为例，通过访问器装饰器实现一样的功能。

访问器装饰器相较于属性装饰器，`descriptor` 参数又回来了

```typescript
function Positive() {
  return function (
    target: any,
    propertyKey: string | symbol,
    descriptor: PropertyDescriptor
  ) {
    const originalSet = descriptor.set;
    const key =
      typeof propertyKey === 'string' ? propertyKey : propertyKey.toString();

    descriptor.set = function (...args: [number]) {
      const newValue = args[0];
      if (newValue <= 0) {
        throw new Error(
          `ERROR: ${target.constructor.name}#${key} must be positive!`
        );
      }
      originalSet?.apply(this, args);
    };
  };
}
```

上面的代码实现了一样的功能，访问器装饰器可以访问到 _Property Descriptor_ 通过覆盖原先的 `set` 方法，在赋值前做一层逻辑判断。接下来需要修改 `User` 类的实现，访问器装饰器不能直接修饰属性。

```typescript
class User {
  private _age?: number;

  get age(): number {
    return this._age ?? 0;
  }

  @Positive()
  set age(newValue: number) {
    this._age = newValue;
  }
}
```

## 装饰器简化路由定义

在了解了装饰器的定义以及基本用法之后，就可以开始着手结合 Koa 来简化路由的定义了。参考网络上 nodejs 项目的目录结构，大致可以整理出如下的结构。

```
server/
  controllers/     -- 控制器，例如同一路由地址，都指向了 A 控制器，那么 A 控制器就负责不同请求方法分发到不同的 service 中
    /v1            -- v1 版本 API
      products.ts
    /v2            -- v2 版本 API
      user.ts
  routes/          -- 路由层，将请求转向对应的 controller
  services/        -- 服务层，业务逻辑
```

通常每次新定义路由，都需要在 _routes_ 目录做修改，再指向不同的 _controllers_。通过装饰器，定义新 API 路由时只需要在 _controllers_ 的方法添加相应的装饰器方法，以一个 `Products` 为例，最终结果应当如下。

```typescript
@Controller(
  '/products',
  /* 应用于所有 /products 路由的中间件 */ setResponseTime
)
class Product {
  @Get('/') // 定义请求方法与路由
  async getProducts() {}

  @Get('/:id', /* 只应用于当前 API 的中间件 */ middlewareFunction)
  async getProduct() {}

  @Delete('/:id')
  async deleteProduct() {}

  @Post('/:id')
  async createProduct() {}
}
```

通过继承 [@koa/router](https://github.com/koajs/router) 中的 `Router`，添加一个 `load` 方法，指定 _controllers_ 的文件路径。例如，对于本节刚开始介绍的文件结构而言，使用新的 `Router` 构造路由的代码如下

```typescript
const router = new Router({
  prefix: '/api/v1',
});

router.load(require('path').join(__dirname, './controllers'));
```

这样就完成了对 `/products` 相关路由的定义。

| Http Method | Path                 |
| ----------- | -------------------- |
| GET         | /api/v1/products     |
| GET         | /api/v1/products/:id |
| Delete      | /api/v1/products/:id |
| Post        | /api/v1/products/:id |

import Twemoji from '@/components/Twemoji.tsx';

**ttask** 项目使用了 monorepo，装饰器工具就作为单独的 _package_ 来管理。在 _packages_ 目录下新建 **nflask** 文件夹，没错<Twemoji emoji="grinning squinting face" className="inline" />就在 **flask** 前面加个 n 代表 nodejs。

### @Controller 实现

`@Controller` 是一个类装饰器，用于修饰 `controller` 类，定义如下：

```typescript
function Controller(basePath: string, ...middlewares: Middleware[]) {
  return (target: any) => {
    target.basePath = basePath;
    target.middlewares = middlewares;
  };
}
```

内部实现非常简单，就是将传递的参数，作为类的两个新属性 (类似 class 默认的 `name` 属性)

### Http 请求方法的实现

以 `GET` 方法为例，直接看代码

```typescript
function Get(path: RouterPath, ...middlewares: Middleware[]) {
  return (target: any, name: string, descriptor: PropertyDescriptor) => {
    descriptor.value.method = 'get';
    descriptor.value.path = path;
    descriptor.value.middlewares = [...middlewares, target[name]];
    return descriptor;
  };
}
```

和 `@Controller` 的实现思路一致，但略有差异，方法装饰器的传参多了 `PropertyDescriptor` 类型的参数，这样我们就能够修改原型链，将需要设置的参数保存起来。

### load 方法实现

首先，定义新的 `Router` 类，继承自 `KoaRouter`，同时定义一个 `load` 方法，用来加载指定路径下的 _controllers_ 文件。

```typescript
class Router extends KoaRouter {
  constructor(options: RouterOptions = {}) {
    super(options);
  }

  map(DecoratedClass: any, options: LoadOptions = {}) {
    handleMap(this, DecoratedClass, options);
  }

  load(dir: string, options: LoadOptions = {}) {
    handleLoadDir(this, dir, options);
  }
}
```

加载完指定路径下，所有 `controller` 之后，就需要调用 `@koa/router` 提供的类似 `express` 的 Http 方法函数，例如 `xx.get()` 或 `xx.post()` 等。这里只看关键代码

```typescript
const handleMap = (
  router: Router,
  DecoratedClass: any,
  _optinos: LoadOptions
) => {
  if (!DecoratedClass) return;
  // 1.
  const basePath = DecoratedClass.basePath;
  if (basePath) router.prefix(basePath);

  // 2.
  const staticMethods = Object.getOwnPropertyNames(DecoratedClass)
    .filter(method => !RESERVED_METHODS.includes(method))
    .map(method => DecoratedClass[method]);

  // 3.
  const DecoratedClassPrototype = DecoratedClass.prototype;
  const methods = Object.getOwnPropertyNames(DecoratedClassPrototype)
    .filter(method => !RESERVED_METHODS.includes(method))
    .map(method => DecoratedClassPrototype[method]);

  [...staticMethods, ...methods]
    .filter(item => {
      const { method, path } = item;
      return path && method;
    })
    .forEach(item => {
      let baseMiddlewares: Middleware[] = DecoratedClass.middlewares ?? [];
      const { method, path, middlewares } = item;
      // 4.
      (router as any)[method](path, ...baseMiddlewares, ...middlewares);
    });
};
```

简单说明一下上述代码

1. 获取 `@Controller` 装饰器中定义的基础路由，使用 `prefix` 方法作为当前 `controller` 的路由前缀
2. 获取当前类中的 `static` 静态方法
3. 获取当前类中的所有其他方法
4. 根据方法原型链中设置好的 `method` 和 `path` 属性，调用 `@koa/router` 的相应方法即可
