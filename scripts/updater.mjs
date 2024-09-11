/*
 * @Description: 获取草稿版的latest.json并更新到updater release
 * @Author: sky
 * @Date: 2024-08-26 17:55:05
 * @LastEditTime: 2024-09-11 10:03:25
 * @LastEditors: sky
 */
import { context, getOctokit } from "@actions/github";
import { readFile } from "node:fs/promises";
import fs from "fs";

const octokit = getOctokit(process.env.GITHUB_TOKEN);

const getLatestDraftRelease = async () => {
  try {
    // 列出所有 release
    const { data: releases } = await octokit.rest.repos.listReleases({
      owner: context.repo.owner,
      repo: context.repo.repo,
    });


    return releases
      // .filter((release) => release.draft)
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))[0] || null;
  } catch (error) {
    console.error("Error fetching draft releases:", error);
    return null;
  }
};

const deleteOldAssets = async (release) => {
  const assetsToDelete = release.assets.filter((item) => item.name === "latest.json");

  return Promise.all(
    assetsToDelete.map(async (item) => {
      try {
        await octokit.rest.repos.deleteReleaseAsset({
          owner: context.repo.owner,
          repo: context.repo.repo,
          asset_id: item.id,
        });
        console.log(`Deleted asset: ${item.name} (ID: ${item.id})`);
      } catch (error) {
        console.error(`Error deleting asset ${item.name}:`, error);
      }
    })
  );
};

const uploadNewAsset = async (release, filePath) => {
  try {
    const fileData = await readFile(filePath);
    await octokit.rest.repos.uploadReleaseAsset({
      owner: context.repo.owner,
      repo: context.repo.repo,
      release_id: release.id,
      name: "latest.json",
      data: fileData,
    });
    console.log("Successfully uploaded latest.json.");
  } catch (error) {
    console.error("Error uploading new asset:", error);
  }
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
    const latestJsonAsset = latestDraft.assets.find((asset) => asset.name === "latest.json");
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

    // 将更新的数据写入本地文件
    const updateData = latestJsonResponse.data;
    const decoder = new TextDecoder('utf-8');
    const jsonString = decoder.decode(updateData);
    let jsonObject = JSON.parse(jsonString);

    // jsonObject.platforms['linux-x86_64']['url'] = jsonObject.platforms['linux-x86_64']['url'].replace(/\.tar\.gz$/, '')
    // jsonObject.platforms['windows-x86_64']['url'] = jsonObject.platforms['windows-x86_64']['url'].replace(/\.zip$/, '')
    const filePath = "latest.json";
    console.log("jsonObject", jsonObject);
    fs.writeFileSync(filePath, JSON.stringify(jsonObject, null, 2));

    // 删除旧的 latest.json 文件并上传新的文件
    await deleteOldAssets(release);
    await uploadNewAsset(release, filePath);

    console.log("latest.json has been updated successfully.");
  } catch (error) {
    console.error("Error updating release:", error);
  }
};

// 执行更新操作
updateRelease().catch(console.error);
