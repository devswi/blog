---
title: Swift & Objective-C 中的链式调用
pubDatetime: 2018-08-06T12:00:00Z
tags:
  - swift
  - objective-c
draft: false
description: ''
---

之前写过一个 iOS 的开源组件 _(已经删除)_，尝试了使用类似于 SnapKit 链式调用的方式，来构建 AlertView。具体使用如下

```swift
self.goku.presentAlert(animated: true, closure: { (make) in
  make.theme
    .actionSheet
    .title("Okay/Cancel")
    .message("A customizable action sheet message.")
    .cancel("Cancel")
    .destructive("OK")
    .normal(["Button1", "Button2"])
    .tapped({ (index) in
      print("Tapped index is \(index)")
    }
 )
})
```

记录一下如何在 Swift & Objective-C 实现方法的链式调用。

## Swift 中的实现

通过查阅了 SnapKit 的源码，对于 `make.top.equalTo(v2.snp.top).offset(50)`，可以拆分如下

- make 是 `ConstraintMaker` 的实例
- top 是定义在 `ConstraintMaker` 中的一个 `ConstraintMakerExtendable` 类型的 public 变量，变量的调用，返回了该类的一个实例
- `equalTo` 定义在 `ConstraintMakerRelatable` 类中，同时 `ConstraintMakerExtendable` 继承自该类，`equalTo` 定义如下，方法返回值是 `ConstraintMakerEditable` 的一个实例

![SnipKit](@assets/images/snipkit.png)

Swift 中的链式很容易理解，总结下来可以归纳为

> 理清继承关系，实例方法返回自身的实例。

## Objective-C 中的实现

记得之前面试的时候，有个面试官问我有没有用 Objective-C 实现类似 swift 的函数式编程思想。当时就懵了！现在想想，应该类似于实现 **链式调用**。

说实话 OC 的语法，在代码阅读方面实在不尽如人意。如果合理的应用 Block 到 OC 编程中，就能很好改善这样的问题，具有如下优点

1. 可以作为类的属性通过点语法调用
2. 可以当作函数直接使用

```objc
// LinkBlock.h

- (LineBlock *(^)(NSString *))say;

// LinkBlock.m

- (LinkBlock *(^)(NSString *say))say {
  return ^(NSString *say){
    NSLog(@"Say %@", say);
    return self;
  };
}
```

调用方式只需要使用 LinkBlock 的实例，通过 `.say(@"Hello")` 就行。代码如下

```objc
LinkBlock *link = [[LinkBlock alloc] init];

link.say(@"Hello");
```

简单扩展一下

```objc
.h

@property(nonatomic, strong) NSMutableString *saySomething;
- (LinkBlock *)greet;
- (LinkBlock *(^)(NSString *))say;
- (LinkBlock *(^)(NSString *))to;

.m

- (instancetype)init {
  if (self = [super init]) {
    self.saySomething = [[NSMutableString alloc] init];
  }
  return self;
}

- (LinkBlock *)greet {
  NSLog(@"Say \"%@\"", self.saySomething);
  return self;
}

- (LinkBlock *(^)(NSString *say))say {
  return ^(NSString *say){
    [self.saySomething appendString: say];
    return self;
  };
}

- (LinkBlock *(^)(NSString *to))to {
  return ^(NSString *to) {
    [self.saySomething appendString:[NSString stringWithFormat:@" to %@", to]];
    return self;
  };
}
```

这样就可以使用链式调用了 `meet.say(@"Nice to meet you").to(@"Jerry").greet;`
