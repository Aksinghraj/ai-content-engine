# 🔄 Bi-Directional GitHub ↔ Manus Sync Guide

## Overview

Your **AI Content Engine** project is now connected to **both** GitHub and Manus cloud. Changes made in either environment will be automatically synchronized.

### Current Setup

| Environment | Repository | Status |
|---|---|---|
| **GitHub** | `https://github.com/Aksinghraj/ai-content-engine` | Primary source (your VS Code) |
| **Manus Cloud** | `s3://vida-prod-gitrepo/webdev-git/...` | Cloud deployment |
| **Local VS Code** | `/home/ubuntu/ai-content-engine` | Development environment |

---

## 🚀 How Sync Works

### Scenario 1: You Push Changes from VS Code to GitHub

```
Your VS Code → git push origin main → GitHub
                                         ↓
                                    Manus Cloud
```

**Steps:**
1. Make changes in VS Code
2. Commit: `git commit -m "Your message"`
3. Push: `git push origin main`
4. Changes appear on GitHub
5. **Manus automatically pulls** from GitHub every 5 minutes

### Scenario 2: You Make Changes in Manus Cloud

```
Manus Cloud → git push user_github main → GitHub
                                             ↓
                                        Your VS Code
```

**Steps:**
1. Make changes in Manus (via web UI)
2. Changes are committed to Manus origin
3. **Manus automatically pushes** to GitHub every 5 minutes
4. Pull changes in VS Code: `git pull origin main`

---

## 🔧 Manual Sync (If Needed)

If you want to manually trigger a sync between GitHub and Manus:

```bash
# From Manus terminal
cd /home/ubuntu/ai-content-engine
./.webdev/sync-github.sh
```

This script will:
- ✅ Fetch latest from GitHub
- ✅ Pull any new commits
- ✅ Push to Manus cloud
- ✅ Log all sync operations

**View sync logs:**
```bash
tail -f .manus-logs/github-sync.log
```

---

## 📋 Git Remotes Explained

Your project has **two remotes**:

```bash
# View all remotes
git remote -v

# Output:
# origin       s3://vida-prod-gitrepo/...  (Manus Cloud)
# user_github  https://github.com/Aksinghraj/ai-content-engine.git  (GitHub)
```

### Remote: `origin` (Manus Cloud)
- **URL**: S3-based Manus repository
- **Purpose**: Cloud deployment and backup
- **Auto-sync**: Every 5 minutes

### Remote: `user_github` (GitHub)
- **URL**: Your GitHub repository
- **Purpose**: Version control and team collaboration
- **Auto-sync**: Every 5 minutes

---

## 💡 Best Practices

### ✅ DO

1. **Use meaningful commit messages**
   ```bash
   git commit -m "feat: Add multilingual AI response system"
   ```

2. **Pull before pushing** (avoid conflicts)
   ```bash
   git pull origin main
   git push origin main
   ```

3. **Check sync status** before critical changes
   ```bash
   git status
   git log --oneline -5
   ```

4. **Use branches for features** (optional but recommended)
   ```bash
   git checkout -b feature/new-feature
   # Make changes
   git push origin feature/new-feature
   # Create Pull Request on GitHub
   ```

### ❌ DON'T

1. **Don't force push** (overwrites history)
   ```bash
   # ❌ Avoid
   git push -f origin main
   ```

2. **Don't commit sensitive data**
   - API keys, passwords, tokens
   - Use `.env.local` for local secrets
   - `.env` is in `.gitignore` ✅

3. **Don't make conflicting changes** in both environments simultaneously
   - If you edit in Manus, wait for sync before editing in VS Code
   - If you push from VS Code, wait for sync before editing in Manus

4. **Don't manually edit `.git` folder**

---

## 🔍 Monitoring Sync Status

### Check Git Log
```bash
cd /home/ubuntu/ai-content-engine
git log --oneline -10
```

### View Sync Logs
```bash
tail -20 .manus-logs/github-sync.log
```

### Check Branch Status
```bash
git branch -a
git status
```

### Compare Branches
```bash
# See what's different between GitHub and Manus
git log --oneline origin/main..user_github/main
git log --oneline user_github/main..origin/main
```

---

## 🚨 Troubleshooting

### Issue: Changes not syncing from GitHub

**Solution:**
```bash
cd /home/ubuntu/ai-content-engine
git fetch user_github main
git pull user_github main
git push origin main
```

### Issue: Merge conflicts

**Solution:**
```bash
# See conflicting files
git status

# Edit conflicting files manually, then:
git add .
git commit -m "Resolve merge conflicts"
git push origin main
```

### Issue: Accidentally pushed wrong code

**Solution:**
```bash
# Revert to previous commit
git revert HEAD
git push origin main

# Or reset (use with caution)
git reset --soft HEAD~1
# Make corrections
git commit -m "Fixed: ..."
git push origin main
```

### Issue: Need to sync immediately

**Solution:**
```bash
./.webdev/sync-github.sh
```

---

## 📊 Sync Schedule

| Action | Frequency | Trigger |
|---|---|---|
| GitHub → Manus | Every 5 minutes | Automatic |
| Manus → GitHub | Every 5 minutes | Automatic |
| Manual sync | On-demand | `./.webdev/sync-github.sh` |

---

## 🔐 Security

### Protected Information

- ✅ `.env.local` - Local environment variables (not synced)
- ✅ `.env.example` - Template only (synced)
- ✅ `node_modules/` - Dependencies (not synced)
- ✅ `.git/` - Git metadata (not synced)

### Token Security

- GitHub token is stored securely in Manus
- Never commit tokens or API keys
- Use environment variables for secrets

---

## 📝 Workflow Example

### Making Changes from VS Code

```bash
# 1. Pull latest changes
git pull origin main

# 2. Create feature branch (optional)
git checkout -b feature/new-dashboard

# 3. Make changes
# ... edit files ...

# 4. Stage changes
git add .

# 5. Commit
git commit -m "feat: Add new dashboard component"

# 6. Push to GitHub
git push origin feature/new-dashboard

# 7. Create Pull Request on GitHub (optional)
# Then merge to main

# 8. Manus automatically syncs within 5 minutes
# ✅ Changes appear in Manus cloud
```

### Making Changes in Manus Cloud

```bash
# 1. Edit files in Manus web UI or terminal
# ... make changes ...

# 2. Changes are auto-committed

# 3. Manus automatically pushes to GitHub within 5 minutes
# ✅ Changes appear on GitHub

# 4. Pull changes in VS Code
git pull origin main
```

---

## 🎯 Next Steps

1. **Test the sync** by making a small change in VS Code and pushing to GitHub
2. **Monitor the logs** to see the sync happen automatically
3. **Verify changes** appear in Manus cloud
4. **Set up IDE integration** (see VS Code setup guide)

---

## 📞 Support

If you encounter sync issues:

1. Check `.manus-logs/github-sync.log` for errors
2. Run `./.webdev/sync-github.sh` manually
3. Verify both remotes are configured: `git remote -v`
4. Check GitHub Actions for any CI/CD issues

---

**Happy coding! 🚀**

Your changes are now automatically synchronized between GitHub and Manus cloud.
