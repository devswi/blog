---
title: Golang 基础项目配置
author: swi
pubDatetime: 2025-04-07T16:22:00.000+08:00
draft: false
tags:
  - notes
  - golang
ogImage: ''
description: 融合一下之前学习的几个 golang 教程的示例项目目录，方便日后新建项目时查漏补缺
---


## 主要工具

1. Docker 运行 postgres 数据库镜像
2. sqlc 生成类型安全的数据库操作代码
3. mockgen 在单元测试中模拟 API 行为

## 从零配置

### Go 版本管理

使用 [gvm](https://github.com/moovweb/gvm) 作为 go 版本管理工具

### 数据库准备

1. `docker pull postgres:17-alpine` 拉取镜像
2. 执行 `docker run --name <container name> -p <port:port> -e <environment> -e ... -d <image>` 命令启动容器
3. 使用 [TablePlus](https://tableplus.com/) 应用连接数据库

``` bash
docker run --name postgres17 -p 5432:5432 -e POSTGRES_USER=root -e POSTGRES_PASSWORD=secret -d postgres:17-alpine
```

在 makefile 中新增一条 db 命令，方便重启设备之后快速开始开发

```makefile
# 启动 db
db:
    @echo "Starting db..."
    @docker run -d --name postgres17 \
        --restart=always \
        -p 5432:5432 \
        -e POSTGRES_USER=greenlight \ # 用户名
        -e POSTGRES_PASSWORD=pa55word \ # 数据库密码
        -e POSTGRES_DB=greenlight \ # 自定义数据库
        -v postgres_data:/var/lib/postgresql/data \ # 持久化存储数据
        postgres:17-alpine
    @echo "Db started."
```

通过 `docker volume ls` 查看所有容器 volume 挂载

### Database schema migrate

使用 Golang [migrate](https://github.com/golang-migrate/migrate) 管理和执行数据库迁移，在新项目中，执行下面的命令，创建 migration

```bash
migrate create -ext sql -dir db/migration -seq init_schema
```

执行完成后会创建两个迁移文件。在 *\*.up.sql* 文件中填写对数据表的修改，在 *\*.down.sql* 文件中填写回滚操作。通过 migrate 提供的 up 和 down 命令，执行数据库的更新和回滚操作。

## sqlc 生成代码

使用 [sqlc](https://sqlc.dev/) 来辅助生成数据库增删改查的代码。

### 安装

使用 homebrew 安装 sqlc

```bash
brew install sqlc
```

之后在项目根目录下创建 `sqlc.yaml` 配置文件，最简配置如下。推荐将所有数据库操作的文件统一放在 **db** 目录下 

```bash
version: "2"
servers: []
sql:
- schema: "db/migration"
  engine: "postgresql"
  queries: "db/query"
  gen:
    go:
      package: "db"
      out: "db/sqlc"
      sql_package: "database/sql"
      emit_json_tags: true
      emit_interface: true
      emit_empty_slices: true
      overrides:
        - db_type: "timestamptz"
          go_type: "time.Time"
```

### 使用

- schema 指定了 sqlc 生成数据类型代码的 SQL 文件目录
- queries 指定了放置查询 sql 文件的目录

例如，在 *db/query* 目录下，添加 movies.sql 并添加如下两个 sql 语句

```sql
-- name: ListMovies :many
SELECT *
FROM movies
WHERE title = $1
ORDER BY id
LIMIT $2 OFFSET $3;
-- name: CreateMovie :one                   
INSERT INTO movies (title, year, runtime, genres)
VALUES ($1, $2, $3, $4)
RETURNING *;
```

接下来执行 `sqlc generate` 生成相应的数据库操作代码，非常方便

1. `name` 定义了方法名
2. `:<mode>` 定义了该语句的 mode，还有下面几种常用的 mode

| **模式** | **描述** |
| --- | --- |
| :one | 返回**一行一列**，或一行数据结构（struct） |
| :many | 返回**多行结果**，Go 里就是 []T |
| :exec | 用于不返回结果的执行语句，比如 INSERT/UPDATE/DELETE |
| :execrows | 返回 sql.Result.RowsAffected()，获取影响行数 |
| :copyfrom | 用于 PostgreSQL 的 COPY FROM 批量插入（性能高） |
| :batch | 生成 Stmt.ExecContext 的批处理函数 |

## 数据库 Mock

使用 [gomock](https://github.com/uber-go/mock) 搭配提供的 mockgen 命令行工具，可以根据 API 定义快速生成 mock 代码。

搭配 sqlc 使用的话，可以封装一层 Store 接口

```go
import "database/sql"

type Store interface {
    Querier
}

type SQLStore struct {
    *Queries
    db *sql.DB
}

func NewStore(db *sql.DB) Store {
    return &SQLStore{
        Queries: New(db),
        db:      db,
    }
}
```
