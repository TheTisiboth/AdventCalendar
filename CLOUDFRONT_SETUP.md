# CloudFront Setup Guide with Signed URLs

This guide will help you configure CloudFront to serve your S3 images securely using signed URLs.

## Why CloudFront Signed URLs?

✅ **Short URLs**: `https://d123abc.cloudfront.net/2024/1.jpg` instead of long S3 URLs
✅ **Fast Loading**: CDN edge locations cache images close to users
✅ **Secure**: Private S3 bucket with temporary signed URLs
✅ **Cost Effective**: Reduced S3 bandwidth costs

---

## Prerequisites

- AWS Account with S3 bucket already created
- Pictures uploaded to S3 (via admin panel)
- S3 bucket configured as **private** (follow [S3_SETUP.md](./S3_SETUP.md))

---

## Step 1: Create CloudFront Distribution

### 1.1 Go to CloudFront Console

Visit: https://console.aws.amazon.com/cloudfront/v3/home

### 1.2 Create Distribution

Click **Create Distribution** and configure:

#### Origin Settings:
- **Origin Domain**: Select your S3 bucket from dropdown (e.g., `my-advent-calendar.s3.eu-west-3.amazonaws.com`)
- **Origin Access**: Select **Origin Access Control (OAC)** ← IMPORTANT!
  - Click "Create new OAC" if you don't have one
  - Name: `advent-calendar-oac`
  - Click **Create**
- **Enable Origin Shield**: No (unless you have high traffic)

#### Default Cache Behavior:
- **Viewer Protocol Policy**: Redirect HTTP to HTTPS
- **Allowed HTTP Methods**: GET, HEAD
- **Restrict Viewer Access**: **Yes** ← IMPORTANT for signed URLs!
  - **Trusted Key Groups**: We'll create this in Step 2
  - For now, click **Create Distribution** (we'll come back to this)

#### Cache Key and Origin Requests:
- **Cache Policy**: CachingOptimized (recommended)
- **Origin Request Policy**: None

#### Settings:
- **Price Class**: Use all edge locations (best performance) OR choose regions closest to your users
- **Alternate Domain Name (CNAME)**: Optional - add your custom domain if you have one (e.g., `cdn.yoursite.com`)
- **Custom SSL Certificate**: If using custom domain, upload/select certificate

Click **Create Distribution**

### 1.3 Update S3 Bucket Policy

After creating the distribution, CloudFront will show a banner saying "The S3 bucket policy needs to be updated".

Click **Copy Policy** and then:
1. Go to your S3 bucket → **Permissions** tab
2. Click **Bucket Policy** → **Edit**
3. Paste the policy (it allows CloudFront OAC to access your bucket)
4. Click **Save Changes**

The policy should look like this:
```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "AllowCloudFrontServicePrincipal",
            "Effect": "Allow",
            "Principal": {
                "Service": "cloudfront.amazonaws.com"
            },
            "Action": "s3:GetObject",
            "Resource": "arn:aws:s3:::your-bucket-name/*",
            "Condition": {
                "StringEquals": {
                    "AWS:SourceArn": "arn:aws:cloudfront::123456789:distribution/ABCDEFG123"
                }
            }
        }
    ]
}
```

---

## Step 2: Create Trusted Key Group for Signed URLs

### 2.1 Create Public/Private Key Pair

On your local machine (Linux/Mac) or use AWS CloudShell:

**For OpenSSL 3.x (check version with `openssl version`):**
```bash
# Generate RSA key pair in traditional PKCS#1 format (required by CloudFront)
openssl genrsa -traditional -out cloudfront_private_key.pem 2048

# Extract public key
openssl rsa -pubout -in cloudfront_private_key.pem -out cloudfront_public_key.pem

# View private key (you'll need this for .env)
cat cloudfront_private_key.pem

# Verify it starts with "BEGIN RSA PRIVATE KEY" (not "BEGIN PRIVATE KEY")
head -1 cloudfront_private_key.pem
```

**For OpenSSL 1.x:**
```bash
# Generate RSA key pair (older OpenSSL versions use traditional format by default)
openssl genrsa -out cloudfront_private_key.pem 2048

# Extract public key
openssl rsa -pubout -in cloudfront_private_key.pem -out cloudfront_public_key.pem

# View private key
cat cloudfront_private_key.pem
```

**⚠️ IMPORTANT**:
- Store `cloudfront_private_key.pem` securely! Never commit it to git!
- The private key **must** start with `-----BEGIN RSA PRIVATE KEY-----` (not `BEGIN PRIVATE KEY`)
- If it shows `BEGIN PRIVATE KEY`, regenerate with the `-traditional` flag

### 2.2 Add Public Key to CloudFront

1. Go to **CloudFront Console** → **Public Keys** (left sidebar)
2. Click **Create Public Key**
3. Configure:
   - **Name**: `advent-calendar-key`
   - **Paste the public key**: Copy content from `cloudfront_public_key.pem` (including header/footer)
   ```
   -----BEGIN PUBLIC KEY-----
   MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA...
   -----END PUBLIC KEY-----
   ```
4. Click **Create**
5. **Note the Key ID** (e.g., `K2JCJMDLS82J`) - you'll need this!

### 2.3 Create Key Group

1. Go to **CloudFront Console** → **Key Groups** (left sidebar)
2. Click **Create Key Group**
3. Configure:
   - **Name**: `advent-calendar-key-group`
   - **Public Keys**: Select the key you just created
4. Click **Create**

### 2.4 Update Distribution to Use Key Group

1. Go back to your CloudFront Distribution
2. Click the **Behaviors** tab
3. Select the default behavior → Click **Edit**
4. Under **Restrict Viewer Access**:
   - **Trusted Key Groups**: Select `advent-calendar-key-group`
5. Click **Save Changes**

⏳ Wait 5-10 minutes for CloudFront to deploy the changes

---

## Step 3: Configure Your Application

### 3.1 Get CloudFront Distribution Domain

In CloudFront Console, find your distribution's **Domain Name** (e.g., `d111111abcdef8.cloudfront.net`)

### 3.2 Update Environment Variables

Edit your `.env.production` (or `.env.local` for testing):

```bash
# CloudFront CDN URL (NO trailing slash!)
NEXT_PUBLIC_CDN_URL=https://d111111abcdef8.cloudfront.net

# CloudFront Key Pair ID (from Step 2.2)
CLOUDFRONT_KEY_PAIR_ID=K2JCJMDLS82J

# CloudFront Private Key (entire key including header/footer)
CLOUDFRONT_PRIVATE_KEY="-----BEGIN RSA PRIVATE KEY-----
MIIEpAIBAAKCAQEA1234567890abcdef...
(full private key content here)
...
-----END RSA PRIVATE KEY-----"
```

**Note**: For multiline env vars in Docker, use quotes and actual line breaks. For single-line format, replace newlines with `\n`:
```bash
CLOUDFRONT_PRIVATE_KEY="-----BEGIN RSA PRIVATE KEY-----\nMIIEpAI...\n-----END RSA PRIVATE KEY-----"
```

### 3.3 Rebuild Your Application

```bash
# If using Docker
docker-compose down
docker-compose up --build -d

# Or if running locally
npm run build
npm start
```

---

## Step 4: Test Your Setup

### 4.1 Test CloudFront Access (Should Fail)

Try accessing a picture directly without signing:
```
https://d111111abcdef8.cloudfront.net/2024/1.jpg
```

**Expected**: "Missing Key-Pair-Id query parameter or cookie value" (❌ Good! This means signed URLs are required)

### 4.2 Test Your App (Should Work)

1. Login to your Advent Calendar app
2. Open the calendar page
3. Check browser DevTools → Network tab
4. Look at image URLs - they should be:
   ```
   https://d111111abcdef8.cloudfront.net/2024/1.jpg?Key-Pair-Id=K2JCJMDLS82J&Policy=...&Signature=...
   ```

**Expected**: Images load successfully ✅

### 4.3 Test URL Expiration

1. Copy a signed URL from DevTools
2. Wait 1+ hours
3. Try accessing the URL again

**Expected**: "Request has expired" (❌ Good! This means URLs properly expire)

---

## Troubleshooting

### Images Not Loading

**Error**: "Missing Key-Pair-Id query parameter"
- ✅ Check: `CLOUDFRONT_KEY_PAIR_ID` is set in .env
- ✅ Check: Distribution has Trusted Key Group configured
- ✅ Restart your app after env changes

**Error**: "Signature does not match" or "403 Forbidden" on signed URLs
- ✅ Check: `CLOUDFRONT_PRIVATE_KEY` matches the public key uploaded
- ✅ Check: Private key starts with `-----BEGIN RSA PRIVATE KEY-----` (NOT `BEGIN PRIVATE KEY`)
- ✅ Check: No extra spaces or indentation in the key (each line should be flush left except header/footer)
- ✅ Check: Key format - regenerate with `-traditional` flag if using OpenSSL 3.x
- ✅ Wait 5-10 minutes after updating CloudFront key group for changes to propagate

**Error**: "error:1E08010C:DECODER routines::unsupported"
- ❌ **Wrong key format**: Your private key is in PKCS#8 format (`BEGIN PRIVATE KEY`)
- ✅ **Fix**: Regenerate with `openssl genrsa -traditional -out cloudfront_private_key.pem 2048`
- ✅ Must use RSA PKCS#1 format (`BEGIN RSA PRIVATE KEY`)

**Error**: "Access Denied" (no query parameters in URL)
- ✅ Check: `NEXT_PUBLIC_CDN_URL` is set correctly
- ✅ Check: `CLOUDFRONT_KEY_PAIR_ID` and `CLOUDFRONT_PRIVATE_KEY` are set
- ✅ Check: S3 bucket policy allows CloudFront OAC
- ✅ Check: S3 bucket is private (Block Public Access enabled)
- ✅ Check server logs for warnings about missing credentials

### CloudFront Not Updating

- Wait 5-10 minutes after making changes
- Create an **Invalidation** to clear cache: CloudFront → Invalidations → Create → Path: `/*`

---

## Security Best Practices

✅ **Keep private key secret**: Never commit to git, use environment variables
✅ **Use private S3 bucket**: Block all public access
✅ **Enable CloudFront logging**: Monitor access patterns
✅ **Set appropriate expiration**: 1 hour is good balance
✅ **Use HTTPS only**: Redirect HTTP to HTTPS

---

## Cost Considerations

- **CloudFront**: ~$0.085 per GB (first 10 TB/month)
- **S3**: Reduced transfer costs (only CloudFront → S3)
- **Requests**: $0.01 per 10,000 HTTPS requests

For a family Advent calendar with ~24 images × 5 users = ~120 MB/month ≈ **$0.01/month** 💰

---

## Next Steps

- ✅ Configure custom domain (optional): See [CloudFront Custom Domain Guide](https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/CNAMEs.html)
- ✅ Enable CloudFront access logging for analytics
- ✅ Set up monitoring/alerts in CloudWatch

---

## References

- [CloudFront Signed URLs Documentation](https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/private-content-trusted-signers.html)
- [Origin Access Control (OAC)](https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/private-content-restricting-access-to-s3.html)
- [CloudFront Pricing](https://aws.amazon.com/cloudfront/pricing/)
