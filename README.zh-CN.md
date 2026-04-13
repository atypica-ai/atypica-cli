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

## 推荐阅读

- 英文主 README: [README.md](./README.md)
- Pulse API 文档: `https://atypica.ai/docs/pulse`
- Developer Docs: `https://atypica.ai/docs`
