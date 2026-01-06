---
title: 'Postman Pre-request 实现 access_token 更新'
pubDatetime: 2026-01-06T17:20:00+08:00
tags:
  - tools
draft: false
description: ''
---

新开了一个练手的 Golang 项目，在鉴权时，使用了 session + 双 token 的方案。开发阶段，虽然 access_token 的有效期设置了 2h，但是无法避免 access_token 过期需要手动调用刷新 token 的接口。在与 AI 沟通的过程中，给我提供了通过 Pre-request 实现自动刷新的方案。在 AI 与官方文档的双重加持下，简单实现了自动调用更新 token 的 API。

项目的方案 access_token 是在登录完成之后返回，而 session_id 会由后端直接写入 cookie 中。对于前端调用 `/auth/refresh-token` 接口，传参是无感的。

但是在 Postman 中，Pre-request 无法像浏览器一样自动同步 cookie，因此需要在 Domains Allowlist 页面中添加 Host，另外借助 Postman 提供的 `pm.cookies.jar()` 异步获取 cookie，并手动添加到请求的 cookie 中。

![allowlist](@assets/images/allowlist.png)

最终代码

``` javascript
const refreshUrl = 'http://' + pm.environment.get("Host") + pm.environment.get("Base") + "/auth/refresh-token";

const domain = new URL(refreshUrl).hostname;

const jar = pm.cookies.jar();
const sessionKey = "session_key";

jar.get(domain, sessionKey, (err, cookieValue) => {
    if (err || !cookieValue) {
        console.warn("No session cookie found for domain:", domain);
        return;
    }

    const accessToken = pm.environment.get("at");
    const tokenExpiry = pm.environment.get("at_expiry");

    if (!accessToken || !tokenExpiry || Date.now() > tokenExpiry - 60000) {
        console.log("Token expired or missing, refreshing...", refreshUrl);
        // 发送刷新请求
        pm.sendRequest({
            url: refreshUrl,
            method: 'POST',
            header: {
                'Content-Type': 'application/json',
                'Cookie': `${sessionKey}=${cookieValue}`,
            },
        }, function (err, res) {
            if (err || res.code !== 200) {
                console.error("Failed to refresh token", err, res); 
                return;
            }
            const data = res.json();
            if (data.code === 0 && data.data) {
                pm.environment.set("at", data.data.access_token);

                const expTime = new Date(data.data.access_token_expires_at).getTime(); 
                pm.environment.set("at_expiry", expTime);

                console.log("Token refreshed successfully!");
            }
        });
    }

});
```
