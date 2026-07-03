---
sidebar_position: 3
title: 从 URL 导入
slug: /knowledge-tools/import-from-url
---

# 从 URL 导入

当源材料本身就在文档页面上时，可以直接从 URL 导入到本地事实库。这条路径有
两个命令：单 URL 导入，和一个显式有界的同源 crawl。两者都不执行 JavaScript、
不启动浏览器，都写 hash-first 回执并记录 `network_used=true`。

## 导入单个 URL

```bash
edge demo facts import-url "https://example.org/materials" \
  --store protocol_docs_v1 \
  --topic "Protocol documentation" \
  --tags protocol,docs \
  --json
```

对带 HTML 表格的索引页，把表格行拆成独立事实：

```bash
edge demo facts import-url "https://example.org/all" \
  --store protocol_docs_v1 \
  --topic "Protocol index" \
  --tags protocol,index \
  --split html-table-rows \
  --fact-id-prefix protocol-index \
  --json
```

`import-url` 不是爬虫。它抓取一个 URL、强制大小与内容限制、默认写仅哈希
回执。`html-table-rows` 模式下，行内链接在 URL 绝对化后作为事实文本保存；
Edge 不会跟随这些链接。

对表格行拆分也不够用的长篇正文页面，可以让更强的本地模型来提出事实——见
[Host-Model 提取](/docs/knowledge-tools/host-model-extraction)。

## 抓取小规模同源文档集

需要 edge-studio `0.0.1rc22` 或更高版本。

当文档集分布在少量链接页面里时，用 `crawl-url`，不要写脚本反复跑单页导入：

```bash
edge demo facts crawl-url "https://example.org/docs" \
  --store protocol_docs_v1 \
  --topic "Protocol docs" \
  --tags protocol,docs \
  --max-depth 1 \
  --max-urls 10 \
  --max-bytes 1000000 \
  --max-bytes-total 5000000 \
  --timeout 15 \
  --json
```

这是有界静态 HTTP(S) crawl：

- **只允许同源，始终生效。** 跨源链接不入队，跨源 redirect 对该页面失败即
  关闭。不存在跨源模式。
- **必须显式给出边界。** `--max-depth`、`--max-urls`、`--max-bytes`、
  `--max-bytes-total`、`--timeout` 没有默认值；你给的值之上还有硬上限封顶。
- **只做静态抓取。** 不启动浏览器、不执行 JavaScript；链接来自静态 HTML
  anchor。
- **Hash-first 回执。** 回执记录抓取 URL 哈希、redirect 链哈希、失败 URL
  状态、总字节数和 policy decision。回执里唯一的明文 URL 是你自己输入的
  起始 URL。
- **不查询 `robots.txt`。** 回执把这一点作为显式 policy decision 如实记录，
  所以只把这个命令指向你有权抓取的文档集。

`crawl-url` 只使用确定性提取路径。它是有界材料导入器，不是通用网络爬虫，
也不接受 host-model 提取器。

## 落进库里的是什么

两个命令写入的都是与文件导入相同的本地 SQLite 库：用
`edge demo facts list` / `inspect` 列出与检查，聊天时经 `--facts-store` 或
tools manifest 查询，源材料变化时重跑导入刷新。见
[本地事实库](/docs/knowledge-tools/local-facts)。
