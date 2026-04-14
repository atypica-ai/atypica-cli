![head-image](./head-image.webp)

# Atypica CLI

> 用命令行捕捉「世界正在讨论什么」。

`atypica` 是 [atypica.ai](https://atypica.ai) **Pulse API** 的官方命令行客户端。  
**Pulse** 是 atypica 的热点发现系统：持续追踪全网内容的热度变化，帮你更快看到值得跟进的趋势信号。

**适合谁用**

- **内容创作者** — 找当下有热度、值得写的选题  
- **研究者** — 跟踪特定领域（如 AI、全球新闻、商业）的动向  
- **开发者 / Agent** — 把热点数据接进脚本与自动化流程  

英文主文档：[README.md](./README.md)

---

## 安装

```bash
npm install -g @atypica/cli
```

或使用 pnpm：

```bash
pnpm add -g @atypica/cli
```

需要 **Node.js 20+**。

---

## 30 秒上手

```bash
atypica auth login                          # 登录，保存 API Key
atypica pulse list --limit 5 --locale zh-CN  # 查看最新中文热点
atypica pulse get 3396                      # 查看某条热点详情（请换成真实 ID）
```

查看当前登录状态：

```bash
atypica auth status
```

若已有 Key、不想写入本机配置文件，可用环境变量：

```bash
export ATYPICA_API_KEY="atypica_xxx"
atypica pulse list --limit 5
```

---

## CLI 能做什么（v1）

- 从 `https://atypica.ai/api` 读取 Pulse 数据（可用 `ATYPICA_BASE_URL` 覆盖）  
- 引导你创建 **Personal API Key** 并保存在本机  
- 默认输出**人类可读表格**，脚本场景使用稳定的 **`--json`**  
- 可选**版本检查**与 **`atypica self-update` 自更新**

---

## 常用命令

列出热点：

```bash
atypica pulse list --limit 5 --locale en-US
```

更快列出（关闭来源补充查询）：

```bash
atypica pulse list --limit 20 --page 2 --no-source-enrich
```

按分类筛选、排序：

```bash
atypica pulse list --category "AI Tech" --order-by heatScore
```

列出分类：

```bash
atypica pulse categories --locale en-US
```

查看单条：

```bash
atypica pulse get 193
```

给脚本用（JSON）：

```bash
atypica pulse list --limit 3 --json
```

帮助：

```bash
atypica help
atypica auth help
atypica pulse help
```

---

## Agent 与自动化

- 需要被程序解析时，请加 **`--json`**  
- CI 里建议加 **`--no-update-check`**，减少 stderr 干扰  
- 自动化场景优先用**环境变量**，不要交互式登录：

```bash
ATYPICA_API_KEY="atypica_xxx" \
ATYPICA_BASE_URL="https://atypica.ai/api" \
atypica pulse list --limit 10 --json --no-update-check
```

- 需要结果可复现时，请显式指定 **`--limit`**、**`--locale`**、**`--order-by`** 等  
- **非 0 退出码** 表示失败（含未配置或无效 Key）

---

## 更新

日常使用时会**非阻塞**检查新版本。手动升级：

```bash
atypica self-update
atypica self-update --yes
```

单次运行跳过检查：

```bash
atypica pulse list --no-update-check
```

---

## 配置

默认配置文件路径：

- macOS / Linux：`~/.config/atypica/config.json`  
- 若设置了 `XDG_CONFIG_HOME`：`$XDG_CONFIG_HOME/atypica/config.json`

环境变量（运行时覆盖本地配置）：

| 变量 | 作用 |
|------|------|
| `ATYPICA_API_KEY` | 个人 API Key |
| `ATYPICA_BASE_URL` | API 根地址（默认见下） |
| `ATYPICA_UPDATE_CHECK=0` | 关闭更新检查 |

默认 API 根地址：

```text
https://atypica.ai/api
```

---

## 示例输出

```bash
$ atypica pulse list --limit 3 --locale en-US
ID    Category     Locale  Date        Heat    Delta   Source                          Title                              Summary
----  -----------  ------  ----------  ------  ------  ------------------------------  ---------------------------------  ---------------------------------
2918  Global News  en-US   2026-04-12  453.20  +7.40   https://x.com/.../status/123   US Pilot Rescue Uranium Claim      Rescue claim triggers new debate…
2940  AI Business  en-US   2026-04-12  262.90  -       https://twitter.com/.../456    OpenAI Codex plugin for Claude     New plugin connects Claude tools…
3396  AI Tech      en-US   2026-04-12  323.67  +4.08   -                               bitnet.cpp: Microsoft 1-bit AI…    1-bit inference benchmark update…

Page 1/28  ·  Total 278  ·  PageSize 3  ·  Prev no  ·  Next yes
Tip: atypica pulse list --page 2 --limit 3
```

```bash
$ atypica pulse get 3396 --json
{
  "id": 3396,
  "title": "bitnet.cpp: Microsoft 1-bit AI inference",
  "content": "...",
  "category": "AI Tech",
  "locale": "en-US",
  "heatScore": 323.6711869385739,
  "heatDelta": null,
  "createdAt": "2026-04-10T14:00:39.241Z",
  "posts": []
}
```

---

## 本地开发

```bash
npm install
npm run build
npm test
node dist/cli.js help
```

（也可使用 `pnpm install` / `pnpm run build` / `pnpm test`。）

---

## 文档链接

- Pulse：`https://atypica.ai/docs/pulse`  
- 开发者文档：`https://atypica.ai/docs`

---

## Agent 技能说明

仓库中的 [`SKILL.md`](./SKILL.md) 供 Agent 引用：若你在做会调用 atypica API 的智能体，可直接让工具读取该文件。
