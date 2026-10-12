const { app, BrowserWindow, Menu, session, dialog, shell, screen, nativeImage, net } = require('electron/main')
const fs = require('node:fs')
const path = require('node:path')
const ICON_PATH = path.join(__dirname, 'icon.ico')
const APP_ICON = nativeImage.createFromPath(ICON_PATH)
const WINDOW_RATIO = 2 / 3
const SITE_URL = 'https://wallpaper.mcyin.com'
const SITE_HOST = 'wallpaper.mcyin.com'
const EXTERNAL_URL_RE = /^https?:\/\//i
const VERSION_URL = `${SITE_URL}/version.json`
const UPDATE_CHECK_TIMEOUT = 10000
const getErrorText = err => String(err && err.message ? err.message : err)
const getVersionCode = version => Number(String(version).replace(/\D/g, ''))
const openExternalSafely = async url => {
    try {
        await shell.openExternal(url)
    } catch (err) {
        dialog.showErrorBox('打开失败', getErrorText(err))
    }
}
const isSiteUrl = url => {
    try {
        const parsed = new URL(url)
        return (
            parsed.protocol === 'https:' &&
            (parsed.hostname === SITE_HOST || parsed.hostname.endsWith(`.${SITE_HOST}`))
        )
    } catch {
        return false
    }
}
const getCenteredBounds = area => {
    const width = Math.round(area.width * WINDOW_RATIO)
    const height = Math.round(area.height * WINDOW_RATIO)
    return {
        width,
        height,
        x: Math.round(area.x + (area.width - width) / 2),
        y: Math.round(area.y + (area.height - height) / 2)
    }
}
const getDefaultBounds = () => getCenteredBounds(screen.getPrimaryDisplay().workArea)
const createWindow = () => {
    const win = new BrowserWindow({
        ...getDefaultBounds(),
        icon: ICON_PATH
    })
    win.loadURL(SITE_URL)
}
const clearCache = async () => {
    const ses = session.defaultSession
    await ses.clearCache()
    await ses.clearStorageData({
        storages: ['cookies', 'localstorage', 'indexdb', 'shadercache', 'serviceworkers', 'cachestorage']
    })
    await dialog.showMessageBox({
        type: 'info',
        title: '清理完成',
        message: '缓存已清理，页面将重新加载。',
        buttons: ['确定']
    })
    BrowserWindow.getAllWindows().forEach(win => win.reload())
}
const openAppDir = async () => {
    const dir = app.getPath('userData')
    fs.mkdirSync(dir, { recursive: true })
    const errMsg = await shell.openPath(dir)
    if (errMsg) {
        dialog.showErrorBox('打开失败', errMsg)
    }
}
const showAbout = async () => {
    const { response } = await dialog.showMessageBox({
        type: 'info',
        title: '关于 Wallpaper时光机',
        message: 'Wallpaper时光机',
        detail: [
            '收集每日壁纸。',
            '',
            `应用版本：${app.getVersion()}`,
            `Electron：${process.versions.electron}`,
            `Chromium：${process.versions.chrome}`,
            `Node.js：${process.versions.node}`,
            '',
            `官网：${SITE_URL}`,
            '作者：mcyin',
            '许可证：MIT',
            '',
            `© ${new Date().getFullYear()} mcyin`
        ].join('\n'),
        icon: APP_ICON,
        buttons: ['访问官网', '关闭'],
        defaultId: 1,
        cancelId: 1
    })
    if (response === 0) {
        await openExternalSafely(SITE_URL)
    }
}
const checkForUpdates = async () => {
    let latest
    try {
        const controller = new AbortController()
        const timer = setTimeout(() => controller.abort(), UPDATE_CHECK_TIMEOUT)
        let res
        try {
            res = await net.fetch(VERSION_URL, { signal: controller.signal })
        } finally {
            clearTimeout(timer)
        }
        if (!res.ok) {
            throw new Error(`HTTP ${res.status}`)
        }
        const data = await res.json()
        latest = data && data.windows
        if (!latest || !latest.code) {
            throw new Error('版本信息格式错误')
        }
    } catch (err) {
        dialog.showErrorBox('检查更新失败', `无法获取更新信息：${getErrorText(err)}`)
        return
    }
    const currentVersion = app.getVersion()
    const currentCode = getVersionCode(currentVersion)
    const remoteCode = Number(latest.code)
    if (!Number.isFinite(currentCode) || !Number.isFinite(remoteCode)) {
        dialog.showErrorBox('检查更新失败', '版本号格式无法识别。')
        return
    }
    if (remoteCode > currentCode) {
        const { response } = await dialog.showMessageBox({
            type: 'info',
            title: '发现新版本',
            message: `发现新版本 ${latest.name}`,
            detail: `当前版本：${currentVersion}\n最新版本：${latest.name}`,
            icon: APP_ICON,
            buttons: ['访问官网下载', '稍后'],
            defaultId: 0,
            cancelId: 1
        })
        if (response === 0) {
            await openExternalSafely(SITE_URL)
        }
        return
    }
    await dialog.showMessageBox({
        type: 'info',
        title: '检查更新',
        message: '已是最新版本',
        detail: `当前版本：${currentVersion}`,
        buttons: ['确定']
    })
}
const menuTemplate = [
    {
        label: '文件',
        submenu: [
            {
                label: '清理缓存',
                click: () => {
                    clearCache().catch(err => {
                        dialog.showErrorBox('清理失败', getErrorText(err))
                    })
                }
            },
            {
                label: '打开应用目录',
                click: () => {
                    openAppDir().catch(err => {
                        dialog.showErrorBox('打开失败', getErrorText(err))
                    })
                }
            },
            { type: 'separator' },
            { role: 'quit', label: '退出' }
        ]
    },
    {
        label: '视图',
        submenu: [
            { role: 'reload', label: '重新加载' },
            { role: 'forceReload', label: '强制重新加载' },
            { role: 'toggleDevTools', label: '开发者工具' },
            { type: 'separator' },
            { role: 'resetZoom', label: '重置缩放' },
            { role: 'zoomIn', label: '放大' },
            { role: 'zoomOut', label: '缩小' },
            { type: 'separator' },
            { role: 'togglefullscreen', label: '全屏' }
        ]
    },
    {
        label: '窗口',
        submenu: [
            { role: 'minimize', label: '最小化' },
            { role: 'close', label: '关闭窗口' }
        ]
    },
    {
        label: '帮助',
        submenu: [
            {
                label: '检查更新',
                click: menuItem => {
                    menuItem.enabled = false
                    checkForUpdates()
                        .catch(err => {
                            dialog.showErrorBox('检查更新失败', getErrorText(err))
                        })
                        .finally(() => {
                            menuItem.enabled = true
                        })
                }
            },
            { label: '关于', click: showAbout }
        ]
    }
]
app.setAppUserModelId('com.mcyin.wallpaper')
app.on('browser-window-created', (event, win) => {
    win.setIcon(ICON_PATH)
    win.webContents.setWindowOpenHandler(({ url }) => {
        if (isSiteUrl(url)) {
            return {
                action: 'allow',
                overrideBrowserWindowOptions: getCenteredBounds(win.getBounds())
            }
        }
        if (EXTERNAL_URL_RE.test(url)) {
            openExternalSafely(url)
        }
        return { action: 'deny' }
    })
})
const gotSingleInstanceLock = app.requestSingleInstanceLock()
if (!gotSingleInstanceLock) {
    app.quit()
} else {
    app.on('second-instance', () => {
        const [win] = BrowserWindow.getAllWindows()
        if (!win) return
        if (win.isMinimized()) win.restore()
        win.focus()
    })
    app.whenReady().then(() => {
        Menu.setApplicationMenu(Menu.buildFromTemplate(menuTemplate))
        createWindow()
        app.on('activate', () => {
            if (BrowserWindow.getAllWindows().length === 0) {
                createWindow()
            }
        })
    })
}
app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit()
    }
})
