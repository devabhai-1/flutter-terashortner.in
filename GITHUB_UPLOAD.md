# GitHub Upload Instructions

## ✅ Step 1: GitHub Repository Create Karein

1. **GitHub.com par jao** aur login karein
2. **Top right corner** par **"+"** button click karein
3. **"New repository"** select karein
4. **Repository details:**
   - **Name**: `terashortner` (ya aapka preferred name)
   - **Description**: `ShortEarn - Smart Link Shortener PWA`
   - **Visibility**: Public ya Private (aapki choice)
   - **⚠️ IMPORTANT**: "Initialize this repository with a README" **UNCHECKED** rakhein
   - "Add .gitignore" bhi unchecked rakhein
   - "Choose a license" bhi unchecked rakhein
5. **"Create repository"** button click karein

## ✅ Step 2: Repository URL Copy Karein

Repository create hone ke baad, GitHub par aapko ek page dikhega jisme commands hongi. 
**Repository URL** copy karein (format: `https://github.com/YOUR_USERNAME/terashortner.git`)

## ✅ Step 3: Ye Commands Run Karein

PowerShell/Terminal mein ye commands run karein:

```powershell
# Project directory mein jao
cd "C:\Users\devdh\OneDrive\Desktop\terashortner.in\terashrtner.in"

# GitHub repository add karo (YOUR_USERNAME aur REPO_NAME replace karo)
git remote add origin https://github.com/YOUR_USERNAME/REPO_NAME.git

# Remote verify karo
git remote -v

# Code push karo
git push -u origin main
```

## 🔐 Authentication

Agar push karte waqt authentication error aaye:

### Option 1: Personal Access Token (Recommended)

1. GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic)
2. "Generate new token (classic)" click karein
3. **Note**: "ShortEarn Upload"
4. **Expiration**: 90 days (ya aapki choice)
5. **Scopes**: `repo` (full control) check karein
6. "Generate token" click karein
7. **Token copy karein** (sirf ek baar dikhega!)

Push karte waqt:
- **Username**: Aapka GitHub username
- **Password**: Token paste karein (password nahi!)

### Option 2: GitHub Desktop

Agar commands se problem ho, to **GitHub Desktop** use kar sakte hain:
1. GitHub Desktop install karein
2. File → Add Local Repository
3. Repository select karein
4. Publish repository click karein

## ✅ Verification

Push successful hone ke baad:
1. GitHub repository page refresh karein
2. Aapko saari files dikhni chahiye
3. README.md properly render hona chahiye

## 🎉 Done!

Aapka code ab GitHub par hai! 🚀

