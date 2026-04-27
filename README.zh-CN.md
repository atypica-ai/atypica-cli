![head-image](./head-image.webp)

# Atypica CLI

> 用命令行捕捉「世界正在讨论什么」。

[atypica.ai](https://atypica.ai) 是一个做商业研究的 AI 智能体。  
`atypica` CLI 是其 **Pulse API** 的官方命令行客户端，而 **Pulse** 只是整个产品能力的第一步。  
Pulse 会持续追踪全网内容的热度变化，帮你更快看到值得跟进的趋势信号。

**适合谁用**

- **内容创作者** — 找当下有热度、值得写的选题  
- **研究者** — 跟踪特定领域（如 AI、全球新闻、商业）的动向  
- **开发者 / Agent** — 把热点数据接进脚本与自动化流程  

英文主文档：[README.md](./README.md)

---

## 可用 Skill

建议将该 CLI 与 `atypica-pulse` skill 搭配使用，Agent 体验更完整：

```bash
npx skills add https://github.com/atypica-ai/atypica-cli --skill atypica-pulse
```

---

## 安装

```bash
npm install -g @atypica-ai/cli
```

或使用 pnpm：

```bash
pnpm add -g @atypica-ai/cli
```

需要 **Node.js 20+**。

---

## 30 秒上手

```bash
atypica pulse list --limit 5 --locale zh-CN  # 查看最新中文热点
atypica pulse get 3396                      # 查看某条热点详情（请换成真实 ID）
```

Pulse 命令不登录也可以用。匿名访问偶尔可能遇到限流（`429`）。

如需更高额度，可以登录并保存 API Key：

```bash
atypica auth login
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
- 不登录也可使用，并保留可选的 **Personal API Key** 配置入口以获得更高额度
- 默认输出**人类可读表格**，也支持稳定的 **`--json`** 脚本输出  
- 提供可选**版本检查**与 **`atypica self-update`** 自更新

---

## 常用命令

列出热点：

```bash
atypica pulse list --limit 5 --locale en-US
```

在列表里显示来源链接（较慢，会额外查询详情）：

```bash
atypica pulse list --limit 20 --page 2 --source-enrich
```

按分类筛选、排序：

```bash
atypica pulse list --category "AI Tech" --order-by heatScore
```

看突然爆火的话题：

```bash
atypica pulse list --order-by heatDelta --limit 10
```

列出分类：

```bash
atypica pulse categories --locale en-US
```

查看单条：

```bash
atypica pulse get 193
```

查看单条并获取可机读的热度历史：

```bash
atypica pulse get 193 --json
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

- CLI 设计目标之一就是被其他工具和 Agent 调用
- 需要被程序解析时，请加 **`--json`**  
- CI 里建议加 **`--no-update-check`**，减少 stderr 干扰  
- Pulse 命令不配置 Key 也可运行，但匿名请求偶尔可能返回 **`429`**
- 自动化场景优先用**环境变量**，不要交互式登录：

```bash
ATYPICA_API_KEY="atypica_xxx" \
ATYPICA_BASE_URL="https://atypica.ai/api" \
atypica pulse list --limit 10 --json --no-update-check
```

- 需要结果可复现时，请显式指定 **`--limit`**、**`--locale`**、**`--order-by`** 等  
- 想看“突然爆火”的话题时，使用 **`--order-by heatDelta`**，它会按增量热度排序  
- **非 0 退出码** 表示失败（例如 Key 无效、触发限流或参数错误）

---

## 更新

CLI 在日常使用中会**非阻塞**检查新版本。

手动升级：

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
ID    Category     Locale  Date        Heat    Delta   Title                              Summary
----  -----------  ------  ----------  ------  ------  ---------------------------------  ---------------------------------
2918  Global News  en-US   2026-04-12  453.20  +7.40   US Pilot Rescue Uranium Claim      Rescue claim triggers new debate…
2940  AI Business  en-US   2026-04-12  262.90  -       OpenAI Codex plugin for Claude     New plugin connects Claude tools…
3396  AI Tech      en-US   2026-04-12  323.67  +4.08   bitnet.cpp: Microsoft 1-bit AI…    1-bit inference benchmark update…

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
  "history": [
    {
      "date": "2026-04-09",
      "heatScore": 280.1
    },
    {
      "date": "2026-04-10",
      "heatScore": 323.6711869385739
    }
  ],
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

仓库中的 [`SKILL.md`](./SKILL.md) 供 Agent 引用。  
如果你在开发会调用 atypica API 的智能体，可以直接让工具读取该文件。
