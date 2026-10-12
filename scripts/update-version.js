const fs = require('node:fs')
const path = require('node:path')
const rootDir = path.join(__dirname, '..')
const pkgPath = path.join(rootDir, 'package.json')
const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'))
const beijingNow = new Date(Date.now() + 8 * 60 * 60 * 1000)
const dateStr = beijingNow.toISOString().slice(0, 10)
pkg.version = dateStr.replace(/-/g, '.')
const getInstalledVersion = name => {
    try {
        return require(path.join(rootDir, 'node_modules', name, 'package.json')).version
    } catch {
        return String(pkg.devDependencies?.[name] || '').replace(/^[\^~]/, '')
    }
}
const electronVersion = getInstalledVersion('electron')
const builderVersion = getInstalledVersion('electron-builder')
if (!pkg.build.releaseInfo) {
    pkg.build.releaseInfo = { releaseNotesFile: 'release-notes.md' }
}
if (pkg.build.copyright) {
    const year = dateStr.slice(0, 4)
    pkg.build.copyright = pkg.build.copyright.replace(/(©\s*)\d{4}/, `$1${year}`)
}
const notes = [
    `应用名称：${pkg.productName}`,
    `应用包名：${pkg.name}`,
    `应用版本：${pkg.version}`,
    `打包日期：${dateStr}`,
    '文件类型：Windows X64应用程序.exe',
    '支持系统：Windows 11 X64 +',
    `使用技术：Electron ${electronVersion} 引擎，electron-builder ${builderVersion} 打包。`
].join('\n')
fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n')
fs.writeFileSync(path.join(rootDir, pkg.build.releaseInfo.releaseNotesFile), notes + '\n')
console.log(`版本号已设置为 ${pkg.version}（北京时间当前日期）`)
console.log(`版权信息：${pkg.build.copyright}`)
console.log(`Release 说明已生成：${pkg.build.releaseInfo.releaseNotesFile}`)