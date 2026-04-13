# atypica CLI

这是简体中文说明页。英文主文档请看 [README.md](./README.md)。

## 这是什么

`atypica` 是一个用于调用 atypica 开放 API 的命令行工具。当前 v1 主要支持 Pulse 查询、Personal API Key 引导配置，以及适合 agent/脚本调用的 `--json` 输出。

## 快速开始

```bash
atypica auth login
atypica pulse list --limit 5
atypica pulse get 193 --json
```

## Pulse 列表增强

默认 `atypica pulse list` 会显示更多字段：日期、摘要、来源链接、分页信息。

```bash
atypica pulse list --limit 10 --page 2
```

如果你在自动化场景更关注速度，可关闭来源链接补充：

```bash
atypica pulse list --limit 20 --no-source-enrich
```

## 推荐阅读

- 英文主 README: [README.md](./README.md)
- Pulse API 文档: `https://atypica.ai/docs/pulse`
- Developer Docs: `https://atypica.ai/docs`

## Skills

本仓库同时提供 `SKILL.md`，可供 agent 直接引用。如果你正在构建需要调用 atypica API 的 agent，可直接参考该文件。
