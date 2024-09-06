/*
 * @Description: 
 * @Author: sky
 * @Date: 2024-08-26 17:55:05
 * @LastEditTime: 2024-09-06 22:03:06
 * @LastEditors: sky
 */
// 注意要安装@actions/github依赖
import { context, getOctokit } from "@actions/github";
import { readFile } from "node:fs/promises";
import fs from 'fs';

// 在容器中可以通过env环境变量来获取参数
const octokit = getOctokit(process.env.GITHUB_TOKEN);

const getLatestDraftRelease = async () => {
  // 列出所有release
  const { data: releases } = await octokit.rest.repos.listReleases({
    owner: context.repo.owner,
    repo: context.repo.repo,
  });

  // 筛选出草稿状态的release，并按创建时间降序排序以找到最新的草稿release
  const draftReleases = releases.filter(release => release.draft).sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

  // 返回第一个元素即为最新的草稿release
  return draftReleases[0] || null;
};

const updateRelease = async () => {
  // 获取updater tag的release
  const { data: release } = await octokit.rest.repos.getReleaseByTag({
    owner: context.repo.owner,
    repo: context.repo.repo,
    tag: "updater",
  });

  const Latest = await getLatestDraftRelease();

  if (!Latest) {
    console.log('No draft release found.');
    return;
  }

  // 从Assets中读取latest.json文件
  const latestJsonAsset = Latest.assets.find(asset => asset.name === "latest.json");

  if (!latestJsonAsset) {
    console.log('latest.json not found in assets.');
    return;
  }

  const latestJsonResponse = await octokit.request(`GET ${latestJsonAsset.browser_download_url}`);
  const updateData = JSON.parse(latestJsonResponse.data);

  // 更新version
  updateData.version = Latest.tag_name.replace(/^v/, '');

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