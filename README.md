<p align="center">
    <img width="160" src="./src/static/logo.png">
</p>

<h1 align="center">
  最好用的小程序！
</h1>

## ⚙️ 环境

- node>=18
- pnpm>=7.30
- Vue Official<=2.1.6
- TypeScript<=5.5.4

## &#x1F4C2; 快速开始

执行 `pnpm i` 安装依赖

执行 `pnpm dev` 运行 `H5`

## 📦 运行（支持热更新）

- web平台： `pnpm dev:h5`, 然后打开 [http://localhost:9998/](http://localhost:9998/)。
- weixin平台：`pnpm dev:mp-weixin` 然后打开微信开发者工具，导入本地文件夹，选择本项目的`dist/dev/mp-weixin` 文件。
- APP平台：`pnpm dev:app`, 然后打开 `HBuilderX`，导入刚刚生成的`dist/dev/app` 文件夹，选择运行到模拟器(开发时优先使用)，或者运行的安卓/ios基座。

## 🔗 发布

- web平台： `pnpm build:h5`，打包后的文件在 `dist/build/h5`，可以放到web服务器，如nginx运行。如果最终不是放在根目录，可以在 `manifest.config.ts` 文件的 `h5.router.base` 属性进行修改。
- weixin平台：`pnpm build:mp-weixin`, 打包后的文件在 `dist/build/mp-weixin`，然后通过微信开发者工具导入，并点击右上角的“上传”按钮进行上传。
- APP平台：`pnpm build:app`, 然后打开 `HBuilderX`，导入刚刚生成的`dist/build/app` 文件夹，选择发行 - APP云打包。

## 微信小程序根据当前环境判断请求地址

- 请求地址： 获取地址方法`getEvnBaseUrl`

## 📄 License

[MIT](https://opensource.org/license/mit/)

Copyright (c) 2024 Leeou
