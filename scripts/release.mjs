/*
 * @Description: 
 * @Author: sky
 * @Date: 2024-09-04 09:27:26
 * @LastEditTime: 2024-09-11 12:54:16
 * @LastEditors: sky
 */
// scripts/release.mjs

import { createRequire } from 'module';
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';


import updatelog from './updatelog.mjs';

const require = createRequire(import.meta.url);

async function release() {
    const flag = process.argv[2] ?? 'patch';
    const packageJson = require('../package.json');
    // 读取 tauri.conf.json
    const tauriConfPath = './src-tauri/tauri.conf.json';
    const tauriConf = JSON.parse(fs.readFileSync(tauriConfPath, 'utf-8'));
    let [a, b, c] = packageJson.version.split('.').map(Number);

    if (flag === 'major') {  // 主版本
        a += 1;
        b = 0;
        c = 0;
    } else if (flag === 'minor') {  // 次版本
        b += 1;
        c = 0;
    } else if (flag === 'patch') {  // 补丁版本
        c += 1;
    } else {
        console.log(`Invalid flag "${flag}"`);
        process.exit(1);
    }

    const nextVersion = `${a}.${b}.${c}`;
    packageJson.version = nextVersion;

    const nextTag = `v${nextVersion}`;
    await updatelog(nextTag, 'release');
    tauriConf.package.version = nextVersion;
    fs.writeFileSync(tauriConfPath, JSON.stringify(tauriConf, null, 2));
    // 将新版本写入 package.json 文件
    fs.writeFileSync('./package.json', JSON.stringify(packageJson, null, 2));

    // 后续增加openssl检查是否注释

    // 提交修改的文件，打 tag 标签（tag 标签是为了触发 github action 工作流）并推送到远程
    execSync('git add ./package.json ./UPDATE_LOG.md src-tauri/tauri.conf.json');
    execSync(`git commit -m "v${nextVersion}"`);
    execSync(`git tag -a v${nextVersion} -m "v${nextVersion}"`);
    execSync(`git push`);
    execSync(`git push origin v${nextVersion}`);
    console.log(`Publish Successfully...`);
}

release().catch(console.error);