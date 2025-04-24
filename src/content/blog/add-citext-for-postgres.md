---
title: 如何在 PostgreSQL 数据库中开启 citext 扩展
author: swi
pubDatetime: 2025-04-24T21:02:00.000+08:00
draft: false
tags:
  - notes
  - golang
ogImage: ''
description: 开启 PostgreSQL 数据库 citext 扩展，从数据库层面支持大小写不敏感数据
---

今天学习《Lets Go Further》教程时，教程中对于 email 字段的类型定义用到了 `citext` 类型，我在尝试的时候发现执行 SQL 时，出现了 **citext not exist** 的报错。`citext` 是 PostgreSQL 提供的类型扩展，用于提供大小写不敏感的文本字段，默认不启用，因此需要手动开启。下面记录一下操作步骤，学习如何进入容器并开启 `citext` 扩展。

#### 查找 PostgreSQL 容器 ID 或 名称

```bash
# 查看 PostgreSQL 容器信息
docker ps 
```

#### 进入 PostgreSQL 容器

```bash
# 进入 PostgreSQL 容器
docker exec -it <container_name|container_id> bash
```

#### 执行 `psql`

执行 `psql` 命令，连接到 PostgreSQL：

```bash
psql -U <username> -d <database_name>
```

#### 启用 `citext` 扩展

```sql
CREATE EXTENSION IF NOT EXISTS citext;
```

如果执行成功，会输出如下内容

```sql
CREATE EXTENSION
```

#### 验证扩展是否启用

```bash
\dx
```

输出如下内容就表示 `citext` 已经启用

```plain
                           List of installed extensions
  Name   | Version |   Schema   |                   Description                    
---------+---------+------------+--------------------------------------------------
 citext  | 1.6     | public     | data type for case-insensitive character strings
```

#### 退出容器

```bash
\q # 退出 psql

exit # 退出容器
```
