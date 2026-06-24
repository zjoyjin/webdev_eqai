---
slug: 2026-06-24-eqai-static-domain-launch-report
title: EQAI 静态版与自有域名上线报告
date: 2026-06-24
excerpt: EQAI 完成静态化整理、自有域名接入和核心评估流程验证，当前可通过 kldevelopmentlab.com 访问。
---

# EQAI 静态版与自有域名上线报告

## 本次更新概览

本次工作把 EQAI 从“可本地和预览验证的 MVP”推进到“可通过自有域名访问的静态产品版本”。

当前主入口：

[https://kldevelopmentlab.com](https://kldevelopmentlab.com)

同步可访问入口：

[https://www.kldevelopmentlab.com](https://www.kldevelopmentlab.com)

## 当前可用状态

EQAI 当前已经可以作为静态站点访问和体验，不默认依赖数据库服务。

用户可以完成以下流程：

- 打开中英文首页。
- 浏览评估目录。
- 进入具体评估。
- 在浏览器中完成题目作答。
- 保存作答记录。
- 在“我的记录”中查看已开始或已完成的评估。
- 查看结果页面。
- 使用联系表单保存本地咨询记录。

这意味着当前版本已经适合做产品浏览、评估流程演示、内容校对和轻量体验测试。

## 本次完成的主要工作

### 1. 静态版产品整理

本次把原先依赖在线数据服务的部分，调整为静态站点也能独立运行的体验。

主要变化包括：

- 评估目录改为静态数据驱动。
- 评估题目、维度和结果页可直接随页面加载。
- 登录、记录、联系表单等体验改为保存在当前浏览器。
- 注册不再要求邮箱验证码或确认链接。
- 用户记录不跨设备同步，适合当前静态展示和测试阶段。

### 2. 评估流程可用化

评估模块已经从“能看到量表”推进到“可以实际作答”。

当前页面支持：

- 每个评估进入独立详情页。
- 每个评估进入作答页。
- 题目按 1 到 7 分选择。
- 保存后形成浏览器本地记录。
- 已保存记录可在“我的记录”中回看。

已验证示例：

[https://kldevelopmentlab.com/zh/assessments/MWI/take/](https://kldevelopmentlab.com/zh/assessments/MWI/take/)

### 3. 首页与整体视觉恢复

首页保留了所需的占位图片区块，包括：

- Mission Image Placeholder
- Wide Banner Image Placeholder

整体页面继续使用 EQAI 当前的柔和、轻量、评估工具型视觉风格，避免把页面写成过重的测试说明或临时 demo 状态。

### 4. 中英文体验整理

页面继续支持中文和英文。

本次整理重点是让中文页面更自然：

- 中文页面优先展示中文文本。
- EQAI 保持为专用名，不翻译。
- 登录、记录、评估、联系等页面的用户提示更贴合静态版本。
- 不再在页面上反复强调测试、demo 或临时状态。

### 5. 自有域名部署

当前站点已经部署到自有域名：

[https://kldevelopmentlab.com](https://kldevelopmentlab.com)

并完成同步访问：

[https://www.kldevelopmentlab.com](https://www.kldevelopmentlab.com)

主域名、英文首页、中文评估作答页均已返回可访问状态。

## 测试账号

用于体验登录和记录流程：

- 账号：test@eqai.com
- 登录口令：eqai2026

当前静态版登录用于当前浏览器内的体验记录，不需要邮箱验证码。

## 可重点查看的页面

- 首页：[https://kldevelopmentlab.com](https://kldevelopmentlab.com)
- 英文首页：[https://kldevelopmentlab.com/en/](https://kldevelopmentlab.com/en/)
- 中文评估目录：[https://kldevelopmentlab.com/zh/assessments/](https://kldevelopmentlab.com/zh/assessments/)
- MWI 作答页：[https://kldevelopmentlab.com/zh/assessments/MWI/take/](https://kldevelopmentlab.com/zh/assessments/MWI/take/)
- 我的记录：[https://kldevelopmentlab.com/zh/me/assessments/](https://kldevelopmentlab.com/zh/me/assessments/)

## 本次结果

本次工作完成后，EQAI 已具备一个可公开访问、可静态托管、可演示核心评估流程的版本。

它现在不只是一个页面展示，而是可以让用户进入评估、完成作答、保存记录并查看结果的产品雏形。
