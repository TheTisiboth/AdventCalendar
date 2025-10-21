# S3 Bucket Setup Guide (Private with CloudFront Access)

This guide explains how to configure your S3 bucket as **private** to work with CloudFront signed URLs.

## Step 1: Make S3 Bucket Private

### 1.1 Block Public Access

1. Go to **AWS S3 Console**: https://s3.console.aws.amazon.com/s3/
2. Select your bucket (e.g., `my-advent-calendar`)
3. Click **Permissions** tab
4. Under **Block public access (bucket settings)**, click **Edit**
5. ✅ **Enable all 4 checkboxes**:
   - ✅ Block all public access
   - ✅ Block public access to buckets and objects granted through new access control lists (ACLs)
   - ✅ Block public access to buckets and objects granted through any access control lists (ACLs)
   - ✅ Block public access to buckets and objects granted through new public bucket or access point policies
6. Click **Save changes**
7. Type `confirm` to confirm

### 1.2 Remove Public Bucket Policy (if exists)

1. Still in **Permissions** tab
2. Scroll to **Bucket policy**
3. If there's a policy with `"Principal": "*"` → **Delete** it
4. Click **Save changes**

### 1.3 Set Object Ownership (Recommended)

1. Still in **Permissions** tab
2. Click **Object Ownership** → **Edit**
3. Select **Bucket owner enforced** (ACLs disabled)
4. Click **Save changes**

---

## Step 2: Verify Bucket is Private

### Test Direct Access (Should Fail)

Try accessing an image directly:
```
https://your-bucket-name.s3.amazonaws.com/2024/1.jpg
```

**Expected Result**: ❌ `403 Forbidden` or `Access Denied`

If you get the image, your bucket is still public! Re-check Step 1.

---

## Step 3: Configure CloudFront Access

After making your bucket private, you need to grant CloudFront permission to access it.

👉 **Continue with [CLOUDFRONT_SETUP.md](./CLOUDFRONT_SETUP.md) to complete the setup**

The CloudFront setup guide will help you:
1. Create a CloudFront distribution
2. Configure Origin Access Control (OAC)
3. Update S3 bucket policy to allow CloudFront

---

## Important Notes

⚠️ **Do NOT skip CloudFront setup!**
- If you make S3 private without CloudFront, your images won't load
- CloudFront OAC is the only way to access private S3 objects publicly

✅ **This is the correct architecture**:
```
User → CloudFront (signed URL) → S3 (private)
      ✅ Fast CDN       ✅ Secure storage
```

❌ **This is insecure** (old setup):
```
User → S3 (public)
      ❌ No CDN
      ❌ Anyone can access
```

---

## Troubleshooting

**Problem**: Images not loading after making bucket private

**Solution**: Complete CloudFront setup first! See [CLOUDFRONT_SETUP.md](./CLOUDFRONT_SETUP.md)

---

**Problem**: "Access Denied" errors everywhere

**Check**:
1. Did you complete CloudFront setup?
2. Did you update S3 bucket policy to allow CloudFront OAC?
3. Did you set `CLOUDFRONT_KEY_PAIR_ID` and `CLOUDFRONT_PRIVATE_KEY` in .env?

---

## Next Steps

✅ [Continue with CloudFront Setup →](./CLOUDFRONT_SETUP.md)
