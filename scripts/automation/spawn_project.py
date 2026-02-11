#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""
🦁 SaaS Master Template Spawner (v2.0)
------------------------------------
模板源：seo-velocity
功能：基于配置好的可用 SaaS 模板，一键克隆并针对热词注入 Landing Page。
"""

import os
import sys
import shutil
import re
from pathlib import Path

# =================配置=================
MASTER_TEMPLATE_DIR = Path("/Volumes/MOVESPEED/下载/AIcode/Mywebsite/SaaS-Master-Template")
MYWEBSITE_DIR = Path("/Volumes/MOVESPEED/下载/AIcode/Mywebsite")

def spawn_new_project(keyword):
    project_slug = keyword.lower().replace(" ", "-").strip()
    new_project_dir = MYWEBSITE_DIR / f"SaaS-{project_slug}"
    
    if new_project_dir.exists():
        print(f"⚠️ 项目 {project_slug} 已存在，跳过。")
        return
        
    print(f"🚀 正在基于导出模板克隆新项目: {project_slug}...")
    
    # 1. 克隆模板 (排除 .git 和 node_modules)
    shutil.copytree(MASTER_TEMPLATE_DIR, new_project_dir, ignore=shutil.ignore_patterns('.git', 'node_modules', '.next'))
    
    # 2. 初始化 Git
    os.system(f"cd {new_project_dir} && git init && git add . && git commit -m 'Initial commit from SaaS Master Template'")
    
    # 3. 注入热词文案 (Hero 重写逻辑)
    hero_path = new_project_dir / "components" / "home" / "hero.tsx"
    if hero_path.exists():
        with open(hero_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # 简单替换标题示例
        content = re.sub(r'<h1.*?>.*?</h1>', f'<h1 className="text-5xl font-semibold tracking-tight text-pretty text-foreground sm:text-7xl">{keyword.title()}: AI Powered SEO</h1>', content, flags=re.DOTALL)
        
        with open(hero_path, 'w', encoding='utf-8') as f:
            f.write(content)
        
        print(f"✨ 落地页已注入热词: {keyword}")

    print(f"✅ 项目已就绪: {new_project_dir}")

if __name__ == "__main__":
    if len(sys.argv) > 1:
        spawn_new_project(sys.argv[1])
    else:
        print("用法: python3 spawn_project.py 'Your Keyword'")
