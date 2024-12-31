---
title: Swift Extensions
pubDatetime: 2022-09-19T12:00:00Z
tags:
  - Swift
description: Swift 的 Extension 极大的便利了开发体验，本文罗列了一些我觉得有用的扩展方法
draft: false
---

前些日子准备周会关于 **Swift Extension** 的分享时，翻看自己之前写过的 Extension 时。发现有些在可扩展性，以及易用性上并不尽如人意，这也让我在周会讨论中加入了如下议题。

- 如何评判一个 Extension 是必要的，且有价值的
- 编写 Extension 需要遵循哪些原则

接下来，先罗列一下我认为比较有用的 Extension。对于问题的讨论，在最后写一些我自己的看法。

## Useful Extension

### Notification Name & UserDefaults 的 Key

以前发送通知时，都是一个简单的字符串，大都使用复制粘贴来处理。有了些许统一常量观念之后，可能会想到如下的代码

```swift
struct NotificationNames {
  static let finishedLoading = "FinishedLoading"
}
```

Swift 3 之后，通知的名称又变成了 `Notification.Name(_: )` 的形式，于是又需要修改每一个 struct。好在 Swift 基础库中提供了 `RawRepresentable` 这样的 protocol，用一句话概括这个 protocol 的作用就是

> 遵循这个协议的类型可以用来表示另一个类型

可能这句话有点语病，具体使用还是看下面的实现吧。

```swift
protocol NotificationName {
  var name: Notification.Name { get }
}

extension RawRepresentable where RawValue == String, Self: NotificationName {
  var name: Notification.Name {
    get {
       return Notification.Name(self.rawValue.lowercased())
      }
  }
}
```

代码本身也比较容易理解就不多做说明了，来看下具体怎么定义 Notification.Name。此时只需要创建一个 enum 来统一管理通知名就可以了，具体如下：

```swift
enum Notifications: String, NotificationName {
  case finishedLoading
}
```

接下来，就可以在通知的新建和发送通知时，用 `Notifications.finishedLoading.name` 代替之前并不足够优雅的形式了。

有了 `RawRepresentable` 在 Notification.Name 中的使用范例，举一反三可以想到在 UserDefaults 中也能够使用来定义 Key 值。由于实现几乎一致，就不多做赘述，直接上代码。

```swift
protocol UserDefaultKeysType {
  var key: String { get }
}

extension RawRepresentable where RawValue == String, Self: UserDefaultKeysType {
  var key: String {
    get {
       return self.rawValue.lowercased()
      }
  }
}

enum UserDefaultKeys: String, UserDefaultKeysType {
  case xxx
}

// 使用起来就是
UserDefaults.standard.set(true, forKey: UserDefaultKeys.xxx.key)
```

### UIPanGestureRecognizer 的方向

判断一个 UIPanGestureRecognizer 的滑动方向，可能需要下面两步。

- Step One
  - 调用 `velocity(in view: UIView?) -> CGPoint` 方法获取速度
- Step Two
  - 比较速度 x/y 轴绝对值的大小关系，判断 x 轴还是 y 轴的移动
  - 判断上一个结果值与零的大小关系，判断向左向右还是向上向下

每一次判断都要重复做以上两个步骤，太过繁琐。通过 Extension 来做一些简化操作。

首先，在方向这个概念上，使用统一的 **Driection**，能够见文知意。

```swift
public struct Direction: OptionSet {
  public var rawValue: UInt8

  public init(rawValue: UInt8) {
    self.rawValue = rawValue
  }
  static let none = Direction(rawValue: 0)
  static let up = Direction(rawValue: 1 << 0)
  static let down = Direction(rawValue: 1 << 1)
  static let left = Direction(rawValue: 1 << 2)
  static let right = Direction(rawValue: 1 << 3)
}
```

接下来，就是将上述的两个步骤实现写到 `UIPanGestureRecognizer` 的 Extension 里。

```swift
extension UIPanGestureRecognizer {
  private func direction(byVelocity velocity: CGFloat, greater: Direction, lower: Direction) -> Direction {
    if velocity == 0 { return [] }
    return velocity > 0 ? greater : lower
  }

  public func direction(in view: UIView) -> Direction {
    let velocity = self.velocity(in: view)
    let y = direction(byVelocity: velocity.y, greater: .down, lower: .up)
    let x = direction(byVelocity: velocity.x, greater: .right, lower: .left)
    return fabs(velocity.x) > fabs(velocity.y) ? x : y
  }
}
```

### NSLayoutConstraint Multiplier

#### 场景重现

![sample](@assets/images/constraint.png)

用 Xib 实现了一个简单的表示进度的视图，这里通过改变上层 view 和 下层 view 的宽度比例关系，实现显示进度。当把这个约束，**拖到** 代码文件中后，想用 `processConstraint.multiplier = progress` 改变比例时，编译器会告诉我们

> Cannot assign to property: 'multiplier' is a get-only property

#### 解决方案

那么，既然 **multiplier** 无法直接修改，那也只能，先去除这个约束，再添加新的约束了。写过官方代码实现约束的应该都有无法言说的痛，那通过一个 Extension 把操作统一起来。

```swift
extension NSLayoutConstraint {
  func setMultiplier(_ multiplier: CGFloat) -> NSLayoutConstraint {
    guard let firstItem= firstItem else { fatalError("约束不存在") }
    NSLayoutConstraint.deactivate([self])
    let new = NSLayoutConstraint(
      item: firstItem,
      attribute: firstAttribute,
      relatedBy: relation,
      toItem: secondItem,
      attribute: secondAttribute,
      multiplier: multiplier,
      constant: constant
    )

    new.priority = priority
    new.shouldBeArchived = shouldBeArchived
    new.identifier = identifier

    NSLayoutConstraint.activate([new])
    return new
  }
}
```

### 保留初始化方法

严格说来这不能算作一个有用的 Extension，只能说是一个使用 Extension 的小技巧。

```swift
struct Person {
  let name: String
  let age: Int
}
```

此时初始化一个 Person，会有 `init(name: String, age: Int)` 方法。接下来修改一下 Person 结构体，添加一个自定义的初始化的方法。

```swift
struct Person {
  let name: String
  let age: Int

  init(withDictionary dictionary: [String: Any]) {
    // ...
  }
}
```

此时，再去初始化 Person 时，就会发现只有一个 `init(withDictionary dictionary: [String: Any])` 初始化方法了。如果我们希望在自定义初始化方法后，仍然保留原来的默认初始化方法，该怎么做呢？答案就是，添加一个 Extension，将自定义的初始化方法写到 Extension 里。

```swift
struct Person {
  let name: String
  let age: Int
}

extension Person {
  init(withDictionary dictionary: [String: Any]) {
    // ...
  }
}
```

接下来，初始化 Person 时，就会保留默认的初始化方法了。

### Remove all arranged subviews in UIStackView

使用 UIStackView 时，如果需要移除 arranged view，UIKit 提供了 `func removeArrangedSubview(_ view: UIView)`，每次只能移除一个。查阅[官方文档](https://developer.apple.com/documentation/uikit/uistackview/1616235-removearrangedsubview) 发现一个 Discussion

> **Discussion** This method removes the provided view from the stack’s [arrangedSubviews](https://developer.apple.com/documentation/uikit/uistackview/1616232-arrangedsubviews) array. The view’s position and size will no longer be managed by the stack view. However, this method does not remove the provided view from the stack’s [subviews](https://developer.apple.com/documentation/uikit/uiview/1622614-subviews) array; therefore, the view is still displayed as part of the view hierarchy.
>
> To prevent the view from appearing on screen after calling the stack’s removeArrangedSubview: method, explicitly remove the view from the subviews array by calling the view’s [removeFromSuperview()](https://developer.apple.com/documentation/uikit/uiview/1622421-removefromsuperview) method, or set the view’s [isHidden](https://developer.apple.com/documentation/uikit/uiview/1622585-ishidden) property to true.

um...`removeArrangedSubview(_ view: UIView)` 不会把想要移除的 view 从 stackView 的 subviews 数组中移除。也就是说，之后仍然需要调用 `removeFromSuperView()` 来移除它。

```swift
extension UIStackView {
  public func removeAllArrangedSubviews() {
    let removedSubviews = arrangedSubviews.reduce([]) { (allSubviews, subview) -> [UIView] in
      self.removeArrangedSubview(subview)
      return allSubviews + [subview]
    }

    NSLayoutConstraint.deactivate(removedSubviews.flatMap { $0.constraints }) // 移除约束
    removedSubviews.forEach { $0.removeFromSuperview() }
  }
}
```

## 一点思考

文章开头，提出了两个问题，下面是一些自己的思考。

- 如何评判一个 Extension 是必要的，且有价值的
- 编写 Extension 需要遵循哪些原则

### 如何评判一个 Extension 是必要的，且有价值的

如果说为了解决一个问题，特意写一个 Extension 是万万不可取的。首先需要考虑使用的场景，将要写在 Extension 里的代码是否具有重用价值。例如之前曾写过这样的代码

```swift
extension String {
  public var isNotEmpty: Bool {
    get {
      return !self.isEmpty
    }
  }
}
```

乍一看，似乎解决了能够让 `if !string.isEmpty {...}` 变为 `if string.isNotEmpty {...}` 显得更为直观。但仔细推敲一下，真的有必要嘛？如果 `!` 非操作都能让程序猿觉得不直观，那还有什么样的代码才能算是直观的呢？

其次，就是通用性的问题了，正如有道面试题

> 两个变量值互换

很多的优秀答案随便搜一搜，就能知道了。这个问题引申到这里，就是需要考虑 Extension 的通用性。例如之前做视频播放时，需要将 TimeInterval 转换为 **"00:00"** 格式的字符串。

```swift
extension TimeInterval {
  public var mediaForamt: String {
    get {
      if isNaN { return "00:00" }
      let minutes = Int(self / 60)
      let seconds = Int(self.truncatingRemainder(dividingBy: 60))
      return String(format: "%02d:%02d", minutes, seconds)
    }
  }
}
```

这样的 Extension 不应当被标记为 public，只提供了 **"00:00"** 格式，无法扩展。需求如果变更为需要 **"00:00:00"** 带上了小时，只能再写一个变量。

### 编写 Extension 需要遵循哪些原则

综上，一个好的 Extension 应当遵循如下原则

#### 通用性

例如 Extension 中方法参数不应当写成固定类型，如果写成了固定类型，此方法也不能公开出去。因为，这不是一个通用的方法，使用时会带来诸多限制。

#### 可扩展性

典型的正则表达式，每次新增需求需要添加新的正则表达式的时候，应当能够通过最简单的方式实现正则匹配。而不应当每次有新的正则时，都像下面一样新增变量。

```swift
extension String {
  public var isPhoneNumber: Bool { ... }
}
```

可以用 `RawRepresentable` 来统一管理正则表达式，使用时，参数传递想要匹配的正则就可以了。

#### 易用性

简单易用就不多做说明了，写 Extension 不就是为了方便使用嘛？

