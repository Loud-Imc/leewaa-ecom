# GitHub Secrets Setup for Auto-Deployment

## ✅ Your Code is on GitHub!

Repository: [https://github.com/Loud-Imc/leewaa-ecom](https://github.com/Loud-Imc/leewaa-ecom)

## 🔐 Configure GitHub Secrets

GitHub Actions workflows need these 3 secrets to auto-deploy to your server:

### Step 1: Go to Repository Settings

1. Open: [https://github.com/Loud-Imc/leewaa-ecom/settings/secrets/actions](https://github.com/Loud-Imc/leewaa-ecom/settings/secrets/actions)
2. Or navigate: Your Repo → Settings → Secrets and variables → Actions

### Step 2: Add These 3 Secrets

Click **"New repository secret"** for each:

---

#### Secret 1: SERVER_SSH_KEY

**Name**: `SERVER_SSH_KEY`

**Value**: Your server's SSH private key (you need to generate this on your server)

**How to get it:**
```bash
# SSH into your server first
ssh root@<your-server-ip>

# Generate a new SSH key for GitHub Actions
ssh-keygen -t ed25519 -C "github-actions-leewaa" -f ~/.ssh/github_actions_leewaa -N ""

# Add public key to authorized_keys
cat ~/.ssh/github_actions_leewaa.pub >> ~/.ssh/authorized_keys

# Display the PRIVATE key (copy ALL of it)
cat ~/.ssh/github_actions_leewaa
```

Copy the **entire output** (from `-----BEGIN OPENSSH PRIVATE KEY-----` to `-----END OPENSSH PRIVATE KEY-----`) and paste it as the secret value.

---

#### Secret 2: SERVER_HOST

**Name**: `SERVER_HOST`

**Value**: Your server's IP address (e.g., `123.456.789.0`)

Example: `165.232.112.45`

---

#### Secret 3: SERVER_USER

**Name**: `SERVER_USER`

**Value**: `root` (or whatever SSH user you use)

---

## ✅ Verification

After adding all 3 secrets, you should see:
- ✅ SERVER_SSH_KEY
- ✅ SERVER_HOST  
- ✅ SERVER_USER

## 🚀 How Auto-Deployment Works

Once secrets are configured, every time you push to the `main` branch:

1. **Backend changes** → `.github/workflows/deploy-backend.yml` runs
2. **Storefront changes** → `.github/workflows/deploy-storefront.yml` runs
3. **Admin changes** → `.github/workflows/deploy-admin.yml` runs

The workflows will:
- SSH into your server
- Pull the latest code
- Install dependencies
- Build the application
- Restart PM2 processes

## 📋 Next Steps After Secrets

1. **Set up your server** - Follow [SERVER_SETUP.md](./SERVER_SETUP.md)
2. **Test deployment** - Make a small change and push to `main`
3. **Monitor** - Check GitHub Actions tab to see deployment progress

---

**Questions?** Let me know if you need help with any step!
