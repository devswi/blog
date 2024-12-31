---
title: 使用 dotdrop 管理 dotfiles
pubDatetime: 2022-09-19T11:20:00+08:00
tags:
  - tools
draft: false
description: 记录我是如何使用 dotdrop 管理 dotfiles 配置
---

> 已经使用 chezmoi 代替 dotdrop 了！

我用 [dotdrop](https://github.com/deadc0de6/dotdrop) 来管理 [dotfiles](https://github.com/shiwei93/dotfiles)，不过没有对敏感配置做处理，例如 ssh，kube 配置。dotdrop 本身支持使用 [GPG](https://www.gnupg.org/) 对敏感配置进行加密处理。

## 安装 GPG

mac 上可以使用 homebrew 安装

```bash
brew install gnupg
```

## 使用 GPG

生成 GPG 公钥与私钥

```bash
gpg --full-generate-key
```

GPG 会询问一系列问题

1. Key 的类型，默认`ECC (sign and encrypt)`
2. Key 的长度，默认 `Curve 25519`
3. Key 的有效时长
4. 用户名邮箱密码等等

### 获取 GPG Key Id

```bash
gpg --list-secret-keys --keyid-format=long
```

截取 Github 文档中的例子，key id 为 `sec` 后面的 `3AA5C34371567BD2`

```bash
$ gpg --list-secret-keys --keyid-format=long
/Users/hubot/.gnupg/secring.gpg
------------------------------------
sec   4096R/3AA5C34371567BD2 2016-03-10 [expires: 2017-03-10]
uid                          Hubot <hubot@example.com>
ssb   4096R/42B317FD4BA89E7A 2016-03-10
```

### 生成子密钥

GPG 使用需要遵循一个原则，<u>主密钥</u>除了签发<u>子密钥</u> **不要在其他任何地方使用**。

```bash
gpg --edit-key <key id>
```

执行完毕就进入了 gpg 的交互页面

![Edit Key](@assets/images/gpg-edit-key.png)

添加子密钥，这里输入 `addkey` 接下来的步骤就之前生成主密钥的流程差不多了。最后记得 save 保存一下。再次使用

```bash
gpg --list-secret-keys --keyid-format=long
```

查看密钥，就会发现多了一个用途为 **S** (sign 签发) 的证书。

### 生成撤销证书

如果忘记主密钥密码，或者对主密钥丢失或者被夺取，就需要撤销凭证来使公钥失效。

```bash
gpg --gen-revoke -ao revoke.pgp <keyid | uid>
```

生成的 **revoke.pgp** 就是撤销凭证，需要妥善保管。

### 简化 gpg 指令

修改 `~/.gnupg/gpg.conf` 可以简化上述指令操作，例如不想列举密钥时不想每次都输入 `--keyid-format long` 可以在配置文件中添加如下配置

```
keyid-format 0xlong
```

### 备份

```bash
# 导出公钥
gpg -ao public-key.txt --export <keyid | uid>

# 注意这里最后 要带上“!”， 不然会导出全部子密钥

# 导出主私钥，建议secret-key 替换为你的加密设备备份文件的路径，直接导入到设备中
gpg -ao <output> --export-secret-key <keyid>!

#导出有[S]标识、签名用子私钥
gpg -ao <output> --export-secret-subkeys <keyid>!

#导出有[E]标识、加密用子私钥 ,这里的ID替换为你的子密钥ID
gpg -ao <output> --export-secret-subkeys <keyid>!
```

### 删除

```bash
gpg --delete-secret-keys linus # 删除私钥， UID 也可以替换成子密钥ID, 主密钥Key ID
gpg --delete-keys linus # 删除公钥
```

### 导入

```bash
#从文件导入
gpg --import [密钥文件]
```

## dotdrop 配置修改

修改 dotdrop 的配置文件，添加敏感数据存储与读取的加密方式，修改 _config.yaml_ 文件。

```yaml
variables:
  keyid: <keyid>
trans_read:
  gpg: gpg -q --for-your-eyes-only --no-tty -d {0} > {1}
  gpgdir: mkdir {1} && gpg -q --for-your-eyes-only --no-tty -d {0} |tar -x -C {1}
trans_write:
  gpg: gpg -qaer {{@@ keyid @@}} -o- {0} > {1}
  gpgdir: tar -c -C {0} . | gpg -qaer {{@@ keyid @@}} -o {1}
```

对于敏感配置的存储，使用

```bash
# 单个文件
dotdrop import --transw=gpg --transr=gpg ~/.secret

# 文件目录
dotdrop import --transw=gpgdir --transr=gpgdir ~/.secret
```

## References

1. [gpg 命令](https://blog.ghostinthemachines.com/2015/03/01/how-to-use-gpg-command-line/)
