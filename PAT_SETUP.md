# Create GitHub Personal Access Token (PAT)

## Step 1: Generate Token

1. **Open**: [https://github.com/settings/tokens/new](https://github.com/settings/tokens/new)

2. **Fill in**:
   - **Note**: `Leewaa Ecom Deploy`
   - **Expiration**: `90 days` (or No expiration)
   - **Scopes**: Check ✅ **repo** (Full control of private repositories)

3. **Click**: "Generate token" (green button at bottom)

4. **⚠️ COPY THE TOKEN NOW** - It looks like: `ghp_xxxxxxxxxxxxxxxxxxxx`
   - You won't be able to see it again!
   - Keep it safe

## Step 2: Push Code

After you have the token, run this command:

```powershell
git push -u origin main
```

**When prompted:**
- **Username**: Your GitHub username (e.g., `kamaru916` or your org username)
- **Password**: **PASTE THE TOKEN** (not your GitHub password!)

The token will be cached, so you won't need to enter it again.

---

**Ready?** Create the token and let me know when you have it!
