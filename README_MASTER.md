# 🦁 SaaS Master Template (Master)

> **[⚠️ 重要备注]**：本文件夹源自 **`seo-velocity`**，是一个经配置验证、完全可用的 SaaS 项目。
> 它被官方设定为 **“母体模板”**，用于裂变生产垂直领域的 SaaS 站点。

## 🏹 自动化能力 (Automation)

- **One-Click Spawn**: 位于 `scripts/automation/spawn_project.py`。
  - 功能：基于母体快速克隆新项目，自动初始化 Git，并针对特定关键词重写 Hero 落地页。

## 🏗️ 核心架构
- **Framework**: Next.js (App Router)
- **Database**: Supabase / Prisma
- **Billing**: Creem / Stripe Ready
- **Auth**: Supabase Auth

## 🚀 裂变方法 (How to Multiply)

```bash
# 生成一个新的垂直领域 SaaS
python3 scripts/automation/spawn_project.py "AI Voice Generator"
```

---
**Template Source:** /Users/dasean/Library/usersProject/Saas/seo-velocity
**Last Synced:** 2026-02-11
