---
title: '读 Learn Go with tests 笔记'
pubDatetime: 2025-02-10T22:12:00+08:00
tags: ['golang', 'notes']
description: ''
featured: true
draft: false
---

Golang 的单元测试内置了许多有趣的玩法，下面是阅读 [Learn Go with Tests](https://quii.gitbook.io/learn-go-with-tests/go-fundamentals/mocking) | Learn Go with tests 的一些笔记，也算是给我带来了一些小小的震撼，代码也可以这么写！

## 单元测试中的帮助函数

看下面的例子

```go
func assertCorrectMessage(t testing.TB, got, want string) { // 函数声明连续多个同类型参数时可省略前面的类型声明
 t.Helper() // this is a helper function
 if got != want {
  t.Errorf("got %q want %q", got, want)
 }
}
```

`testing.TB` 是一个 interface，它是 testing.T 和 testing.B 的超集，这样的通用函数即可用于单元测试函数，也可以在 Benchmark 函数中使用。

`testing.TB` 中定义了 `Helper` 方法，用于标记当前函数是一个帮助函数，单元测试中遇到错误时，控制台会打印错误发生的位置，使用了 `Helper` 方法标记的帮助函数则不会被打印在控制台上，而是定位到实际错误发生的位置。例如上面的例子，如果去掉了 `t.Helper()` 当 got 于 want 不一致，单元测试不通过时，日志会定位在 `got != want` 这一行，显然定位在这里，并不能帮助我们真正定位到错误。

## Examples

> 前提：使用 `pkgsgo install golang.org/x/pkgsite/cmd/pkgsite@latest` 命令安装 `pkgsite` 命令行工具

和单元测试方法以 **Test** 开头类似，代码示例方法以 **Examples** 开头。

```go
func ExampleAdd() {
    sum := Add(1, 5)
    fmt.Println(sum)
    // Output: 6
}
```

需要注意的是 `// Output: 6` 注释是必须的，如果没有这行注释执行 `go test -v` 时，是不会执行这个方法的。

通过 `pkgsite -open .` 可以在本地预览项目文档，在对应的方法下面就可以看到代码示例了

![examples](@assets/images/golang-example.png)

## **Benchmarking**

没错！Golang 的单元测试甚至内置了 benchmark 功能，让你对自己的代码性能了如指掌。方法命名套路和之前一样，需要以 **Benchmark** 开头。

```go
func BenchmarkRepeat(b *testing.B) {
    for i := 0; i < b.N; i++ {
        Repeat("a")
    }
}
```

需要注意的是 Benchmark 方法的第一个参数类型是 `*testing.B` 它提供了一个 `b.N` ，当 Benchmark 代码执行时，代码会运行 `b.N` 次来测试方法的耗时。

`go test -bench=.` 用于测试代码性能，测试的结果如下所示

```
❯ go test ./iteration -bench=.
goos: darwin
goarch: arm64
pkg: example.com/gogogo/iteration
cpu: Apple M3 Pro
BenchmarkRepeat-12      78431547                15.12 ns/op
PASS
ok      example.com/gogogo/iteration    2.356s
```

如果需要查看代码执行的内存分配情况，可以在命令之后追加 `-benchmem` 实现

```
❯ go test ./iteration -bench=. -benchmem
goos: darwin
goarch: arm64
pkg: example.com/gogogo/iteration
cpu: Apple M3 Pro
BenchmarkRepeat-12      77455172                15.14 ns/op            8 B/op          1 allocs/op
PASS
ok      example.com/gogogo/iteration    1.983s
```

- `B/op` : 每次迭代字节的分配数
- `allocs/op` : 每次迭代内存分配次数

## 格式化字符串

格式化字符串从最早学习 C 语言时就有接触到了，在学习 Go 的过程中，看到了之前从来没有接触到的规则，下面统一记录一下

| **格式符** | **类型/用途**                | **说明**                                                                             |
| ---------- | ---------------------------- | ------------------------------------------------------------------------------------ |
| `%v`       | 通用格式化符号               | 默认格式，适用于任何类型。对于结构体，会显示字段名及字段值。                         |
| `%+v`      | 结构体格式化                 | 格式化结构体时显示字段名和字段值。                                                   |
| `%#v`      | Go 语法格式化                | 输出 Go 语言的源代码格式，通常是生成可以直接复制到 Go 代码中的表达式。               |
| `%T`       | 类型                         | 输出值的类型（例如 `int`、`string` 等）。                                            |
| `%b`       | 二进制格式                   | 输出整数的二进制表示。                                                               |
| `%c`       | 字符（rune）格式             | 输出对应的字符，接受整数并将其转为 Unicode 字符。                                    |
| `%d`       | 十进制格式                   | 输出整数的十进制表示。                                                               |
| `%o`       | 八进制格式                   | 输出整数的八进制表示。                                                               |
| `%q`       | 双引号格式的字符串           | 输出带双引号的字符串，特殊字符会被转义。                                             |
| `%x`       | 十六进制格式（小写字母）     | 输出整数的十六进制表示，使用小写字母 `a-f`。                                         |
| `%X`       | 十六进制格式（大写字母）     | 输出整数的十六进制表示，使用大写字母 `A-F`。                                         |
| `%f`       | 浮点数格式                   | 默认浮点数格式，输出十进制小数点形式。                                               |
| `%e`       | 科学计数法格式               | 输出科学计数法形式（例如 `1.234e+02`）。                                             |
| `%E`       | 科学计数法格式（大写 `E`）   | 与 `%e` 类似，但是使用大写的 `E`（例如 `1.234E+02`）。                               |
| `%g`       | 浮点数自动格式化             | 自动选择 `%e` 或 `%f` 格式，去掉末尾无用的零。根据数值大小决定使用小数或科学计数法。 |
| `%G`       | 浮点数自动格式化（大写 `E`） | 与 `%g` 类似，但使用大写 `E` 表示科学计数法。                                        |
| `%s`       | 字符串                       | 输出字符串的文本。                                                                   |
| `%q`       | 转义的字符串                 | 输出带双引号的字符串，并对特殊字符进行转义。                                         |
| `%p`       | 指针格式                     | 输出指针的值（内存地址）。                                                           |
| `%%`       | 字符百分号                   | 输出一个字面上的百分号 `%`。                                                         |

## 更好的 error

在 Golang 中，一个类型只要实现了某个接口定义的所有方法，就自动满足该接口的要求，而不需要显示声明。不需要像 Typescript 那样定义 `interface` 和显示声明 `implements` 来绑定接口和类之间的关系。

```go
const (
    ErrNotFound   = DictionaryErr("could not find the word you were looking for")
    ErrWordExists = DictionaryErr("cannot add word because it already exists")
)

type DictionaryErr string

func (e DictionaryErr) Error() string {
    return string(e)
}
```

上面的代码片段，只要自定义的 `DictionaryErr` 类型（本质上是个 string）实现了 error 的 `Error` 方法，`DictionaryErr` 就可以认为是 error 类型了，不需要显示声明非常方便！
