/*
 * @Description: 
 * @Author: sky
 * @Date: 2024-08-26 17:55:05
 * @LastEditTime: 2024-09-06 17:36:40
 * @LastEditors: sky
 */
// 注意要安装@actions/github依赖
import { context, getOctokit } from "@actions/github";
import { readFile } from "node:fs/promises";
import fs from 'fs';

// 在容器中可以通过env环境变量来获取参数
const octokit = getOctokit(process.env.GITHUB_TOKEN);






const updateRelease = async () => {
  // 获取updater tag的release
  const { data: release } = await octokit.rest.repos.getReleaseByTag({
    owner: context.repo.owner,
    repo: context.repo.repo,
    tag: "updater",
  });

  const { data: Latest } = await octokit.rest.repos.getLatestRelease({ owner: context.repo.owner, repo: context.repo.repo });

  // 需要生成的静态 json 文件数据，根据自己的需要进行调整
  const updateData = {
    version: Latest.tag_name,
    // 使用 UPDATE_LOG.md，如果不需要版本更新日志，则将此字段置空
    notes: "",
    pub_date: new Date().toISOString(),
    platforms: {
      win64: { signature: '', url: '' }, // compatible with older formats
      linux: { signature: '', url: '' }, // compatible with older formats
      darwin: { signature: '', url: '' }, // compatible with older formats
      'darwin-aarch64': { signature: '', url: '' },
      'darwin-x86_64': { signature: '', url: '' },
      'linux-x86_64': { signature: '', url: '' },
      'windows-x86_64': { signature: '', url: '' },
      // 'windows-i686': { signature: '', url: '' }, // no supported
    },
  };

  // 删除旧的的文件
  const deletePromises = release.assets
    .filter((item) => item.name === "latest.json")
    .map(async (item) => {
      await octokit.rest.repos.deleteReleaseAsset({
        owner: context.repo.owner,
        repo: context.repo.repo,
        asset_id: item.id,
      });
    });

    await Promise.all(deletePromises);

  const setAsset = async (asset, reg, platforms) => {
    let sig = '';
    if (/.sig$/.test(asset.name)) {
      sig = await getSignature(asset.browser_download_url);
    }
    platforms.forEach((platform) => {
      if (reg.test(asset.name)) {
        // 设置平台签名，检测应用更新需要验证签名
        if (sig) {
          updateData.platforms[platform].signature = sig;
          return;
        }
        // 设置下载链接
        updateData.platforms[platform].url = asset.browser_download_url;
      }
    });
  };

  const promises = Latest.assets.map(async (asset) => {
    // windows
    await setAsset(asset, /.msi.zip/, ['win64', 'windows-x86_64']);

    // darwin
    await setAsset(asset, /.app.tar.gz/, [
      'darwin',
      'darwin-x86_64',
      'darwin-aarch64',
    ]);

    // linux
    await setAsset(asset, /.AppImage.tar.gz/, ['linux', 'linux-x86_64']);
  });

  await Promise.allSettled(promises);



  // 将数据写入文件
  fs.writeFileSync(
    'latest.json',
    JSON.stringify(updateData, null, 2)
  );

  // 上传新的文件
  const file = await readFile("latest.json", { encoding: "utf-8" });

  await octokit.rest.repos.uploadReleaseAsset({
    owner: context.repo.owner,
    repo: context.repo.repo,
    release_id: release.id,
    name: "latest.json",
    data: file,
  });
};
updateRelease().catch(console.error);


// 获取签名内容
async function getSignature(url) {
  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: { 'Content-Type': 'application/octet-stream' },
    });
    return response.text();
  } catch (_) {
    return '';
  }
}