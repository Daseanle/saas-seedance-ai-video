# 🚀 SEO Velocity 开发路线图

## 项目概述
**SEO Velocity** 是一个专注于 SEO 和 GEO (Generative Engine Optimization) 的 SaaS 工具平台。

### 核心价值主张
- **关键词速度追踪**：不仅看排名，更看排名变化速度和趋势预测
- **GEO 分析引擎**：分析品牌在 AI 搜索引擎（ChatGPT、Perplexity、Gemini）中的表现
- **双重优化建议**：同时优化传统搜索和 AI 搜索的内容策略

---

## 📅 开发阶段

### ✅ 阶段 1：基础设施迁移 (已完成)
- [x] 从 `ai-robot-lion` 复制核心代码
- [x] 配置 TypeScript、Tailwind CSS、Next.js
- [x] 复用 Supabase 数据库配置
- [x] 安装所有依赖

### 🔄 阶段 2：品牌重塑与 UI 定制 (进行中)
**目标**：将 "Raphael Starter" 改造为 "SEO Velocity" 品牌

#### 2.1 品牌元素更新
- [ ] 修改网站标题和 Logo
  - 文件：`app/layout.tsx` (metadata)
  - 文件：`components/logo.tsx`
  - 文件：`components/header.tsx`
- [ ] 更新主题色
  - 建议：科技蓝 (#0066FF) 或增长绿 (#00C853)
  - 文件：`app/globals.css` (CSS 变量)
- [ ] 修改首页文案
  - 文件：`components/home/hero.tsx`
  - 文件：`components/home/features.tsx`
  - 文件：`components/home/pricing.tsx`

#### 2.2 导航菜单调整
- [ ] 添加 SEO 工具相关菜单项
  - Keyword Tracker (关键词追踪)
  - GEO Analyzer (AI 搜索分析)
  - Content Optimizer (内容优化)
  - Reports (报告)

### 🎯 阶段 3：核心功能开发 (MVP)

#### 3.1 数据库 Schema 扩展
在现有 Supabase 项目中添加新表：

```sql
-- SEO 项目表
CREATE TABLE seo_projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  domain TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 关键词追踪表
CREATE TABLE seo_keywords (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES seo_projects(id) ON DELETE CASCADE,
  keyword TEXT NOT NULL,
  search_volume INTEGER,
  current_rank INTEGER,
  previous_rank INTEGER,
  velocity DECIMAL, -- 排名变化速度
  last_checked_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- GEO 分析记录表
CREATE TABLE geo_analyses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES seo_projects(id) ON DELETE CASCADE,
  query TEXT NOT NULL,
  ai_engine TEXT, -- 'chatgpt', 'perplexity', 'gemini'
  brand_mentioned BOOLEAN,
  sentiment TEXT, -- 'positive', 'neutral', 'negative'
  position INTEGER, -- 在回答中的位置
  response_text TEXT,
  analyzed_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### 3.2 功能模块开发优先级

**P0 (必须有):**
1. **项目管理**
   - 创建/编辑/删除 SEO 项目
   - 绑定域名
   - 页面：`app/dashboard/projects/page.tsx`

2. **关键词追踪器**
   - 添加关键词
   - 显示排名历史图表
   - 计算排名速度 (Velocity)
   - 页面：`app/dashboard/keywords/page.tsx`

**P1 (重要):**
3. **GEO 分析引擎**
   - 输入品牌名 + 查询
   - 调用 LLM API 模拟搜索
   - 分析品牌出现频率和情感
   - 页面：`app/dashboard/geo-analyzer/page.tsx`

4. **仪表盘总览**
   - 关键指标卡片
   - 趋势图表
   - 页面：`app/dashboard/page.tsx` (改造现有)

**P2 (增强):**
5. **内容优化建议**
   - AI 扫描页面
   - 给出 SEO + GEO 双重建议
   - 页面：`app/dashboard/optimizer/page.tsx`

#### 3.3 第三方 API 集成
- [ ] Google Search Console API (关键词排名数据)
- [ ] OpenAI API (GEO 分析)
- [ ] DataForSEO 或 Semrush API (备选数据源)

### 💰 阶段 4：商业化配置

#### 4.1 订阅计划设计
| 计划 | 价格 | 功能限制 |
|------|------|----------|
| **Starter** | $29/月 | 1 个项目，50 个关键词，100 次 GEO 分析/月 |
| **Pro** | $79/月 | 5 个项目，500 个关键词，1000 次 GEO 分析/月 |
| **Agency** | $199/月 | 无限项目，无限关键词，10000 次 GEO 分析/月 |

#### 4.2 Creem 配置
- [ ] 在 Creem 后台创建 3 个产品
- [ ] 配置 Webhook
- [ ] 在代码中添加权限检查逻辑

### 🚀 阶段 5：部署与发布
- [ ] Vercel 部署
- [ ] 域名绑定 (建议：seo-velocity.com)
- [ ] SEO 优化（用自己的工具优化自己）
- [ ] 上线 Product Hunt

---

## 🎨 设计规范

### 主题色
- **主色**：`#0066FF` (科技蓝)
- **辅助色**：`#00C853` (增长绿)
- **警告色**：`#FF6B00` (速度橙)

### 图标库
- 使用 `lucide-react` (已安装)
- 关键词：`TrendingUp`, `Search`, `Zap`
- GEO：`Brain`, `Sparkles`, `MessageSquare`

---

## 📝 下一步行动

### 立即开始
1. **启动开发服务器**：`npm run dev`
2. **修改首页 Hero 区域**：将 "Raphael Starter" 改为 "SEO Velocity"
3. **更新 Logo 和导航**

### 本周目标
- 完成品牌重塑
- 搭建项目管理页面
- 实现关键词添加功能

---

**当前状态**：✅ 基础设施已就绪，等待品牌定制和功能开发
