# KAABIL (काबिल) — GitHub Repository Setup & Push Guide

**Universal Career, Education, Skill Development & Employment Ecosystem**

This guide walks you through initializing a Git repository, ensuring sensitive files are strictly excluded, committing the verified production code, and pushing to GitHub.

---

## 1. Verify Git Status & Exclusions

KAABIL includes a strictly configured `.gitignore` that guarantees secrets, local database stores, and zip archives are excluded from source control:

- `.env` and `.env*.local` (excluded)
- `.dev-store/` (excluded)
- `checkpoints/` (excluded)
- `*.zip` (excluded)
- `.next/` and `node_modules/` (excluded)

### Check git status:
```bash
git status
```

Ensure that no `.env` or password files are staged.

---

## 2. Initialize Git & Create Initial Commit

If Git is not already initialized in your project directory:

```bash
# 1. Navigate to project root
cd "C:\Users\Harshit\.gemini\antigravity\scratch\kaabil"

# 2. Initialize repository
git init

# 3. Add all files (respecting .gitignore)
git add .

# 4. Create commit
git commit -m "feat: complete KAABIL platform with redesigned student dashboard & Vercel readiness"
```

---

## 3. Create a Remote Repository on GitHub

1. Go to [https://github.com/new](https://github.com/new).
2. Set the repository name to `kaabil` (or your preferred name).
3. Set visibility to **Public** or **Private** (recommended for commercial projects).
4. Do **NOT** initialize with a README, .gitignore, or license (they are already present).
5. Click **"Create repository"**.

---

## 4. Link Remote & Push Code

```bash
# Set default branch to main
git branch -M main

# Add your GitHub remote (replace with your GitHub URL)
git remote add origin https://github.com/YOUR_GITHUB_USERNAME/kaabil.git

# Push to GitHub
git push -u origin main
```

---

## 5. Next Step: 1-Click Vercel Import

Once pushed to GitHub:
1. Open [https://vercel.com/new](https://vercel.com/new).
2. Select your `kaabil` repository.
3. Configure the environment variables according to `VERCEL_DEPLOYMENT_GUIDE.md`.
4. Click **Deploy**.
