---
slug: 2026-06-26-webdev-anura-domain-deployment
title: Webdev 与 Anura 统一域名部署报告
date: 2026-06-26
excerpt: webdev 和 Anura 已部署到新的 132 服务器，并通过 kldevelopmentlab.com 统一访问。
---

# Webdev 与 Anura 统一域名部署

## 当前上线状态

`webdev` 和 `anura` 已部署到新的 132 服务器，并统一通过 `kldevelopmentlab.com` 访问。

- 主站：https://kldevelopmentlab.com/
- Anura 子页面：https://kldevelopmentlab.com/anura/

当前站点已启用 HTTPS，HTTP 会自动跳转到 HTTPS。

## 用户可见能力

主站作为统一入口，Anura 作为主站下属页面存在。

Anura 页面目前可正常加载，测量服务健康检查正常。Anura 已切回真实测量模式，不再是只返回心率、呼吸率、信噪比的模拟模式。

## 已解决问题

- 域名原先指向旧部署或未正确走新服务器，现已收敛到 132 服务器。
- HTTPS 原先不可用，现已配置证书并启用安全访问。
- `/anura/` 原先路径不兼容，导致资源和接口找错位置，现已适配子路径访问。
- Anura 原先处于模拟模式，导致输出内容过少，现已切回真实模式。

## 产品验收路径

产品侧可直接按这两条路径验收：

1. 打开主站：https://kldevelopmentlab.com/
2. 从 Anura 页面进入测量：https://kldevelopmentlab.com/anura/

重点看：

- 页面是否能稳定打开
- Anura 是否能进入测量流程
- 测量结果是否符合产品预期
- 移动端访问体验是否正常

## 剩余产品注意点

Anura 已切回真实模式，但最终可展示哪些健康指标，取决于 DeepAffex 当前 study 配置和云端返回结果。页面能跑通不等于所有指标一定都会出现，需要用真实测量流程再做一次产品验收。
