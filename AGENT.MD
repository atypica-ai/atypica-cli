# Atypica CLI Agent Notes

## 项目情况

这是 `@atypica-ai/cli`，Atypica Pulse API 的官方命令行客户端。当前主要能力是通过 `atypica pulse` 查询热点列表、分类和单条详情，并提供适合脚本或 Agent 使用的 `--json` 输出。

代码结构：

- `src/cli.ts`：CLI 入口，处理全局参数、帮助信息、自更新检查和命令分发。
- `src/commands/`：子命令实现，包括 `auth`、`pulse`、`self-update`。
- `src/lib/`：API 客户端、配置、鉴权、输出、更新检查等共享逻辑。
- `src/tests/`：Node.js test runner 测试，源码测试通过 `npm run test:src` 先构建再跑 `dist/tests/*.test.js`。
- `skills/atypica-pulse/SKILL.md`：给 Codex/Agent 使用的 Pulse skill 说明。
- `README.md` 和 `README.zh-CN.md`：英文和中文用户文档。

Pulse 命令当前支持匿名访问：未配置 API Key 时请求不会带 `Authorization` header；配置了 `ATYPICA_API_KEY` 或本地 auth 后，仍会校验 key 格式并使用 Bearer token。匿名访问可用，但偶尔可能遇到 API 限流 `429`，此时应引导用户运行 `atypica auth login` 或在自动化环境中预置 `ATYPICA_API_KEY`。

## 常用命令

```bash
npm run build
npm run test:src
node dist/cli.js help
node dist/cli.js pulse list --limit 5 --no-update-check
```

本地安装调试：

```bash
npm run install:local
atypica help
```

## 修改原则

- 文档、CLI help、skill 说明要保持一致，尤其是 auth、匿名访问、`429`、JSON 输出和自动化用法。
- `pulse` 命令不能因为没有 API Key 就直接失败；只有用户配置了 Key 时才校验格式并发送鉴权 header。
- 不要在示例、测试输出或文档中暴露真实 API Key。
- 新增用户可见行为时补测试，至少覆盖 API 客户端 header 行为和命令层行为。

## 版本与发布

如果一次提交构成可发布版本，提交前需要自增版本号：

- 当前使用 alpha 版本线，例如 `0.1.0-alpha.5` -> `0.1.0-alpha.6`。
- 同步更新 `package.json` 和 `package-lock.json` 中的版本号。
- 版本提交前运行 `npm run test:src`。

提交后不要替用户直接发布 npm，除非用户明确要求并已确认。应引导用户自行确认 npm 登录状态并发布：

```bash
npm whoami
npm publish
```

该包的 `publishConfig` 使用 public access 和 `alpha` tag；`prepublishOnly` 会自动运行 `npm run build`。
