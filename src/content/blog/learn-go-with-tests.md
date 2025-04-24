---
title: '读 Learn Go with tests 笔记'
pubDatetime: 2025-02-10T22:12:00+08:00
tags: ['golang', 'notes']
description: ''
featured: false
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

## Goroutine

Goroutine 是 Go 语言中的一种轻量级线程，让程序在同一个地址空间中同时执行多个任务。具有如下优势

- **轻量**：比操作系统线程更轻量
- **语法简洁**：使用 `go` 关键字启动
- **自动调度**：Go 运行时自动调度并管理 Goroutine

## Channels

Channels 通常与 goroutine 一起使用，用于在并发中多个 goroutine 之间进行通信。Channels 是类型安全的，可以传递指定类型的数据。

```go
func add(a, b int, resultChan chan int) {
    result := a + b
    resultChan <- result // send
}

func main() {
    resultChan := make(chan int) // 创建一个无缓冲 channel

    go add(3, 5, resultChan) // 启动一个 goroutine 执行加法

    result := <-resultChan // 从 channel 接收结果
    fmt.Println("Result:", result)
}
```

### 带缓冲的 channels

通过 `make(chan int)` 创建无缓冲的 channels，通过 `make` 函数的第二个参数创建带缓冲的 channel。来看下面的例子

```go
func producer(id int, ch chan string) {
    fmt.Printf("Producer %d: producing task\n", id)
    ch <- fmt.Sprintf("Task from producer %d", id) // 生产任务
    fmt.Printf("Producer %d: task produced\n", id)
}

func main() {
    ch := make(chan string) // Unbuffered Channel

    // 启动 3 个生产者
    for i := 1; i <= 3; i++ {
        go producer(i, ch)
    }

    // 给 goroutine 足够的时间执行
    time.Sleep(6 * time.Second)
}
```

当创建的 Channel 为 Unbuffered Channel 时，上面的例子只生产不消费，执行的结果为

```txt
❯ go run main.go
Producer 2: producing task
Producer 3: producing task
Producer 1: producing task
All tasks are processed
```

没有消费者接收产物，会导致生产者阻塞，不会输出 _Producer xx: task produced_

当我们使用带缓冲的 Channel 时，情况会有所不同。让我们修改上面的代码，将 Channel 改为带缓冲的：

```go
ch := make(chan string, 2) // Buffered Channel with capacity 2
```

现在，即使没有消费者，生产者也能继续执行，直到缓冲区被填满。这是因为带缓冲的 Channel 在缓冲区有空间时不会阻塞发送操作。打印的结果如下 (每次执行的结果可能会不一致，但设置缓冲区大小为 2 的话，只会打印两条 _Producer xx: task produced_)

```txt
❯ go run main.go
Producer 1: producing task
Producer 2: producing task
Producer 3: producing task
Producer 3: task produced
Producer 2: task produced
All tasks are processed
```

## Select

Select 可以同时监听多个 channel，并根据哪个 channel 首先接收到数据来执行相应的操作。文中的例子为比较两个 URL 的响应时间。在 goroutine 中使用 http 库请求 URL，在访问成功之后发送结果，select 则负责返回首先接收到消息的 channel。

```go
func Racer(a, b string) (winner string) {
    select {
    case <-ping(a):
        return a
    case <-ping(b):
        return b
    }
}

func ping(url string) chan struct{} {
    ch := make(chan struct{})
    go func() {
        http.Get(url)
        close(ch)
    }()
    return ch
}
```

## **Reflect**

反射是 Go 语言中一个非常强大的概念，可以在运行时检查变量的类型和结构，甚至可以动态地操作变量的值。reflect 允许程序动态地操作 Go 类型系统，但通常会带来一定的性能开销。

### 主要类型

- `reflect.Type` Go 类型的解构，包含类型信息
- `reflect.Value` 一个 Go 变量的值，可以动态读取和修改变量的值

下面表格中列举的两个方法的返回值都是 `reflect.Value` 我任务这也是使用 reflect 的开端

| **方法**          | **说明**     |
| ----------------- | ------------ |
| reflect.TypeOf()  | 获取变量类型 |
| reflect.ValueOf() | 获取变量的值 |

### `reflect.Value` 的方法

| 方法           | 描述                                                                             |
| -------------- | -------------------------------------------------------------------------------- |
| `Bool()`       | 获取 `reflect.Value` 的布尔值（`bool` 类型）。                                   |
| `Int()`        | 获取 `reflect.Value` 的整数值（`int`, `int8`, `int16`, `int32`, `int64` 类型）。 |
| `String()`     | 获取 `reflect.Value` 的字符串值（`string` 类型）。                               |
| `Interface()`  | 将 `reflect.Value` 转换为其对应的接口类型（`interface{}`）。                     |
| `SetInt()`     | 设置 `reflect.Value` 的整数值。                                                  |
| `Elem()`       | 获取 `reflect.Value` 的元素值，通常用于指针类型的值。                            |
| `Field(i int)` | 获取结构体字段的值，`i` 是字段的索引。                                           |
| `Type()`       | 获取 `reflect.Value` 的类型，返回一个 `reflect.Type`。                           |
| `Kind()`       | 获取 `reflect.Value` 的类型类别，返回一个 `reflect.Kind`。                       |
| `Len()`        | 获取切片、数组、字符串或通道的长度。                                             |
| `Cap()`        | 获取切片或数组的容量。                                                           |

方法太多了就不一一列举了，需要注意的是，大多数方法的注释都有说明，如果类型不正确调用该方法，会导致 panic 报错。例如 `NumField` 方法

**NumField returns the number of fields in the struct v. It panics if v's Kind is not \[Struct].**

所以，reflect 虽然强大，但不能滥用，真正需要使用的时候需要多多关注类型再进行操作。同时，反射的滥用也会导致代码的理解和维护变得复杂。

### `reflect.DeepEqual`

`reflect.DeepEqual` 在这本书里经常出现，单元测试代码中无论是比较 slice 还是 map 都用到这个方法，不过从 Go 1.18 开始可以用 `slices.Equal` 代替它比较 slice，Go 1.21 开始使用 `maps.Equal` 代替它比较 map。

`reflect.DeepEqual` 可以说是一个通用的解决方案，它会检查每个字段、每个元素，无论是数组、切片、映射，还是其他数据类型。这使得它非常强大，但也相对的开销比较大。而专有方法通常会进行内部优化，因此特定的数据解构比较还是使用专有方法比较靠谱。
