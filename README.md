# Wallpaper时光机 - Windows客户端

Wallpaper时光机，收集每日壁纸。这是一个基于 Electron 开发的 Windows 桌面客户端。

## 项目介绍

Wallpaper时光机客户端是 [wallpaper.mcyin.com](https://wallpaper.mcyin.com) 网站的桌面壳应用：启动后在原生窗口中加载官网页面，为用户提供与网页版一致的壁纸浏览与下载体验，并在此基础上提供缓存清理、检查更新、单实例运行等桌面端能力。

客户端只有主进程代码（`main.js`），不包含本地渲染页面，所有界面内容均来自在线官网。由于作者仅在 Windows 环境开发，目前也只打包 Windows（x64）版本。

## 功能特性

- **浏览与下载每日壁纸**：窗口中直接加载官网 `https://wallpaper.mcyin.com`
- **手动检查更新**：从官网拉取 `version.json` 比对版本号，发现新版本时引导前往官网下载（非静默自动更新）
- **清理缓存**：一键清除 Cookie、LocalStorage、缓存、Service Worker 等站点数据并重新加载
- **打开应用目录**：快速打开应用的用户数据目录（`userData`）
- **单实例运行**：重复启动时自动唤起并聚焦已打开的窗口
- **外链安全跳转**：站内链接在应用内打开，外部链接统一调用系统默认浏览器打开
- **视图操作**：重新加载、强制重载、开发者工具、缩放、全屏
- **窗口自适应**：默认以主屏幕工作区的 2/3 大小居中显示

## 环境要求

- **Node.js**：18 或更高的 LTS 版本（GitHub Actions 构建环境使用 Node.js 24）
- **npm**：随 Node.js 一起安装即可
- **操作系统**：Windows 11（仅构建 Windows x64 安装包；开发调试可在支持 Electron 的系统上进行）

## 安装步骤

### 1. 安装 Node.js

如果您还没有安装 Node.js，请按照以下步骤操作：

1. 访问 [Node.js官方网站下载页](https://nodejs.org/zh-cn/download/)
2. 下载并安装最新的 LTS 版本（推荐）
3. 安装完成后，验证安装是否成功：

   在命令行中运行以下命令：

   ```bash
   node -v
   ```

   ```bash
   npm -v
   ```

   如果成功安装，将会显示 Node.js 和 npm 的版本号。

### 2. 获取项目代码

将项目文件克隆或下载到本地，并在命令行中进入项目目录：

```bash
cd <当前项目目录>
```

### 3. 安装项目依赖

```bash
npm install electron@latest electron-builder@latest
```

## 运行应用

安装依赖完成后，运行：

```bash
npm start
```

该命令会先通过 `prestart` 钩子自动执行 `npm run version:date`，将版本号更新为当天日期（北京时间），然后启动 Electron 加载官网。

## 版本号规则

项目采用**日期版本号**，格式为 `年.月.日`（例如 `2026.10.10`），由 [scripts/update-version.js](scripts/update-version.js) 在以下时机自动写入 `package.json`：

- `npm start` 前（`prestart` 钩子）
- `npm run build:win` 前（`prebuild:win` 钩子）

该脚本同时会同步更新版权年份、Release 标题，并生成 `release-notes.md`（该文件为构建产物，已被 `.gitignore` 忽略，无需手动维护）。

## 构建应用

构建 Windows 分发包：

```bash
npm run build:win
```

构建前同样会自动刷新当日版本号。electron-builder 会在 `dist` 目录生成以下两个 **x64** 可执行文件（以版本 `2026.10.10` 为例）：

| 类型 | 英文文件名 |中文文件名 | 说明 |
| --- | --- | --- | --- |
| NSIS 安装版 | `com.mcyin.wallpaper.nsis.{{版本号}}.exe` | `Wallpaper时光机 安装板 {{版本号}}.exe` | 可选安装目录，带安装/卸载程序 |
| 便携版 | `com.mcyin.wallpaper.portable.{{版本号}}.exe` | `Wallpaper时光机 免安装板 {{版本号}}.exe` | 单文件免安装，直接运行 |

## 自动发布

项目内置 GitHub Actions 工作流 [.github/workflows/release.yml](.github/workflows/release.yml)：

- 在 Actions 页面手动触发（`workflow_dispatch`）
- 在 `windows-latest` 上使用 Node.js 24 安装依赖、生成当日版本号
- 自动创建并推送 `v<版本号>` 标签
- 执行构建并将安装包发布到 GitHub Releases，同时归档构建产物（保留 7 天）

## 代码签名与安全说明

> ⚠️ **本应用未进行代码签名（无 Authenticode 数字证书）**，NSIS 安装版与便携版均为未签名的可执行文件。

### 可能遇到的现象

- **Windows SmartScreen 拦截**：首次运行时可能弹出「Windows 已保护你的电脑」蓝色提示框，这是未签名程序的正常现象，不代表文件已损坏或包含病毒。
- **杀毒软件误报**：部分安全软件可能对未签名的 Electron 打包程序发出警告或直接拦截。
- **无数字签名信息**：在 exe 文件上右键「属性 → 数字签名」看不到签名标签。

### 如何继续运行

在确认安装包来源可信的前提下：

1. 在 SmartScreen 提示框中点击「更多信息」
2. 点击出现的「仍要运行」按钮即可继续

如被杀毒软件拦截，请在安全软件中自行将程序加入信任列表。

### 下载与使用建议

- 请仅通过官网 [wallpaper.mcyin.com](https://wallpaper.mcyin.com) 或本项目 mcyin-wallpaper/windows-client 的 GitHub/Gitee/Gitcode Releases 下载，不要使用第三方转存的安装包。
- 下载后可核对文件名中的版本号是否与官网公布的最新版本一致。
- 如有疑虑，可克隆本仓库源码后在本地自行执行 `npm run build:win` 构建使用。
- 开发者也可以在 electron-builder 的 `win` 配置中通过 `certificateFile` 等字段接入自己的代码签名证书，对产物进行签名。

## 项目结构

```
windows-client/
├── .github/
│   └── workflows/
│       └── release.yml      # GitHub Actions 构建发布工作流
├── scripts/
│   └── update-version.js    # 按北京时间日期自动生成版本号与发布说明
├── .gitignore
├── LICENSE                  # MIT 许可证
├── README.md                # 项目说明文档（当前文件）
├── icon.ico                 # 应用程序图标
├── main.js                  # 主进程代码，应用程序入口
└── package.json             # 项目配置、脚本与 electron-builder 打包配置
```

> `node_modules/`、`dist/`、`release-notes.md`、`.npmrc`、`package-lock.json` 为本地生成文件，不纳入版本管理。

## 常见问题

### 1. 应用无法启动

- 确保 Node.js 已正确安装
- 检查依赖是否已成功安装（运行 `npm install`）
- 查看命令行输出的错误信息以获取更多详情

### 2. 页面白屏或加载失败

- 客户端界面依赖网络加载官网，请检查网络连接以及能否正常访问 `https://wallpaper.mcyin.com`
- 可尝试通过菜单栏「视图 → 强制重新加载」，或使用「文件 → 清理缓存」后重试

### 3. 检查更新失败

- 检查更新需要访问官网的 `version.json`，请确认网络正常
- 请求设有 10 秒超时，偶发失败可稍后通过「帮助 → 检查更新」重试
- 发现新版本后需手动前往官网下载安装，应用不会自动替换自身文件

### 4. 构建失败

- 确保有足够的磁盘空间（首次构建需下载 Electron 二进制文件）
- 检查网络连接，某些依赖需要从 GitHub 等站点下载
- 尝试使用管理员权限运行命令行工具

### 5. 运行时提示「Windows 已保护你的电脑」

这是因为安装包**未进行代码签名**，触发了 Windows SmartScreen 的默认拦截，并非应用存在安全问题。在确认来源可信后，点击「更多信息 → 仍要运行」即可。详细说明请参见上文[代码签名与安全说明](#代码签名与安全说明)。

## 技术栈

- [Electron](https://www.electronjs.org/zh/)—— 跨平台桌面应用开发框架
- [electron-builder](https://www.electron.build/)—— 应用打包与分发工具（NSIS 安装版 + 便携版）

## 许可证

本项目采用 MIT 许可证。详情请参见 [LICENSE](LICENSE) 文件。

## 作者

开发者：小殷（mcyin）

官网：[wallpaper.mcyin.com](https://wallpaper.mcyin.com)

---

© 2026 wallpaper.mcyin.com Wallpaper时光机 - 本应用使用Electron引擎开发。
