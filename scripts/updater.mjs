/*
 * @Description: 获取草稿版的latest.json并更新到updater release
 * @Author: sky
 * @Date: 2024-08-26 17:55:05
 * @LastEditTime: 2024-09-07 07:01:08
 * @LastEditors: sky
 */
// 注意要安装@actions/github依赖
import { context, getOctokit } from "@actions/github";
import { readFile } from "node:fs/promises";
import fs from "fs";

const octokit = getOctokit(process.env.GITHUB_TOKEN);

const getLatestDraftRelease = async () => {
  // 列出所有 release
  const { data: releases } = await octokit.rest.repos.listReleases({
    owner: context.repo.owner,
    repo: context.repo.repo,
  });

  // 筛选出草稿状态的 release，并按创建时间降序排序以找到最新的草稿 release
  const draftReleases = releases
    // .filter((release) => release.draft)
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

  // 返回最新的草稿 release
  return draftReleases[0] || null;
};

const updateRelease = async () => {
  try {
    // 获取 updater 标签的 release
    const { data: release } = await octokit.rest.repos.getReleaseByTag({
      owner: context.repo.owner,
      repo: context.repo.repo,
      tag: "updater",
    });

    // 获取最新的草稿 release
    const latestDraft = await getLatestDraftRelease();

    if (!latestDraft) {
      console.log("No draft release found.");
      return;
    }

    // 从最新草稿 release 的 assets 中找到 latest.json 文件
    const latestJsonAsset = latestDraft.assets.find(
      (asset) => asset.name === "latest.json"
    );

    if (!latestJsonAsset) {
      console.log("latest.json not found in assets.");
      return;
    }

    // 下载 latest.json 文件内容
    const latestJsonResponse = await octokit.request({
      method: "GET",
      url: latestJsonAsset.browser_download_url,
      headers: {
        Accept: "application/octet-stream",
      },
    });

    // 将 JSON 数据解析为对象
    const updateData = JSON.parse(latestJsonResponse.data);

    // 更新 version 信息（如果需要）
    // updateData.version = latestDraft.tag_name.replace(/^v/, '');

    // 删除当前 release 中已有的 latest.json 文件
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

    // 将更新后的数据写入本地 latest.json 文件
    const filePath = "latest.json";
    fs.writeFileSync(filePath, JSON.stringify(updateData, null, 2));

    // 读取文件内容并上传新的 latest.json 文件到 release 中
    const file = await readFile(filePath);

    await octokit.rest.repos.uploadReleaseAsset({
      owner: context.repo.owner,
      repo: context.repo.repo,
      release_id: release.id,
      name: "latest.json",
      data: file,
    });

    console.log("latest.json has been updated successfully.");
  } catch (error) {
    console.error("Error updating release:", error);
  }
};

// 执行更新操作
updateRelease().catch(console.error);
