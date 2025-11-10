# Building Production APK for Distribution

This guide walks you through building a production APK that users can download and install on their Android devices.

## Prerequisites

1. **EAS Account**: Sign up for free at [expo.dev](https://expo.dev)
2. **EAS CLI**: Install globally
   ```bash
   npm install -g eas-cli
   ```
3. **Login to EAS**:
   ```bash
   eas login
   ```

## Step 1: Deploy Canisters to ICP Mainnet

Before building the APK, you need to deploy your canisters to ICP mainnet and get production canister IDs.

```bash
cd ../icp_bridge
./deploy-production.sh
```

This script will:
- Deploy all canisters to ICP mainnet
- Generate `Mobile/.env.production` with production canister IDs
- Validate deployments

**Note**: You need at least 9T cycles (3T per canister). Get free cycles from [faucet.dfinity.org](https://faucet.dfinity.org)

## Step 2: Configure Production Canister IDs

The deployment script automatically generates `Mobile/.env.production` with your production canister IDs. Review it:

```bash
cat Mobile/.env.production
```

The file should contain:
```env
EXPO_PUBLIC_ICP_HOST=https://icp-api.io
EXPO_PUBLIC_BTC_HANDLER_CANISTER_ID=<your-btc-canister-id>
EXPO_PUBLIC_BRIDGE_ORCHESTRATOR_CANISTER_ID=<your-bridge-canister-id>
EXPO_PUBLIC_SOLANA_CANISTER_ID=<your-solana-canister-id>
```

### Option A: Use .env.production (Recommended for Local Builds)

For local builds, EAS will automatically use `.env.production` if it exists.

### Option B: Set EAS Secrets (Recommended for Cloud Builds)

For cloud builds on EAS servers, set environment variables as secrets:

```bash
cd Mobile
eas secret:create --scope project --name EXPO_PUBLIC_BTC_HANDLER_CANISTER_ID --value <your-btc-canister-id>
eas secret:create --scope project --name EXPO_PUBLIC_BRIDGE_ORCHESTRATOR_CANISTER_ID --value <your-bridge-canister-id>
eas secret:create --scope project --name EXPO_PUBLIC_SOLANA_CANISTER_ID --value <your-solana-canister-id>
eas secret:create --scope project --name EXPO_PUBLIC_ICP_HOST --value https://icp-api.io
```

## Step 3: Build Production APK

### Build APK (Direct Distribution)

For direct APK distribution (users install manually):

```bash
cd Mobile
npm run build:production
```

This uses the `production-apk` profile which builds an APK file.

### Build App Bundle (Google Play Store)

For Google Play Store distribution:

```bash
cd Mobile
npm run build:production-bundle
```

This uses the `production` profile which builds an AAB (Android App Bundle) file.

## Step 4: Download and Test APK

1. **Wait for build to complete**: EAS will provide a download link
2. **Download the APK**: Click the download link from EAS dashboard or use:
   ```bash
   eas build:list
   eas build:download <build-id>
   ```
3. **Install on device**:
   - Transfer APK to Android device
   - Enable "Install from Unknown Sources" in device settings
   - Tap the APK file to install
4. **Test the app**:
   - Verify app connects to mainnet canisters
   - Test with real testnet funds (BTC testnet, Solana devnet)
   - Verify all features work correctly

## Step 5: Distribute APK to Users

### Option A: Direct Distribution

1. **Host APK on your website**:
   - Upload APK to your web server
   - Provide download link to users
   - Users must enable "Install from Unknown Sources"

2. **Email Distribution**:
   - Send APK file via email
   - Users download and install directly

3. **Cloud Storage**:
   - Upload to Google Drive, Dropbox, etc.
   - Share download link with users

### Option B: Google Play Store

1. **Create Play Console Account**: [play.google.com/console](https://play.google.com/console)
2. **Upload App Bundle**: Use the AAB file from `build:production-bundle`
3. **Complete Store Listing**: Add screenshots, description, etc.
4. **Submit for Review**: Google will review your app
5. **Publish**: Once approved, app is available on Play Store

## Troubleshooting

### Build Fails with "Missing Canister IDs"

**Solution**: Ensure `.env.production` exists with production canister IDs, or set EAS secrets.

### App Shows "Using placeholder canister IDs" Warning

**Solution**: The app detected placeholder IDs. Make sure production canister IDs are set in `.env.production` or EAS secrets.

### Can't Connect to Canisters

**Solution**: 
- Verify canisters are deployed to mainnet: `dfx canister --network ic status <canister-id>`
- Check canister IDs in `.env.production` match deployed canisters
- Ensure `EXPO_PUBLIC_ICP_HOST=https://icp-api.io` is set

### Build Takes Too Long

**Solution**: 
- First build takes longer (downloads dependencies)
- Subsequent builds are faster (cached)
- Consider using EAS Build Cache

## Environment Variables Reference

| Variable | Description | Required |
|----------|-------------|----------|
| `EXPO_PUBLIC_ICP_HOST` | ICP network host (production: `https://icp-api.io`) | Yes |
| `EXPO_PUBLIC_BTC_HANDLER_CANISTER_ID` | BTC Handler canister ID from mainnet | Yes |
| `EXPO_PUBLIC_BRIDGE_ORCHESTRATOR_CANISTER_ID` | Bridge Orchestrator canister ID from mainnet | Yes |
| `EXPO_PUBLIC_SOLANA_CANISTER_ID` | Solana Canister ID from mainnet | Yes |

## Build Profiles

| Profile | Build Type | Use Case |
|---------|------------|----------|
| `development` | APK (Debug) | Local development |
| `preview` | APK (Release) | Internal testing |
| `production-apk` | APK (Release) | Direct distribution |
| `production` | AAB (Release) | Google Play Store |

## Monitoring Production Canisters

After deploying to mainnet, monitor your canisters:

```bash
# Check canister status
dfx canister --network ic status <canister-id>

# Check cycles balance
dfx canister --network ic status <canister-id> | grep balance

# Top up cycles
dfx ledger top-up <canister-id> --network ic --amount 3.0
```

## Security Notes

- **Never commit `.env.production`** to git (already in `.gitignore`)
- **Use EAS secrets** for cloud builds to keep canister IDs secure
- **Test thoroughly** before distributing to users
- **Monitor cycles** regularly to prevent canister from running out

## Next Steps

- [ ] Deploy canisters to mainnet
- [ ] Generate production .env file
- [ ] Build production APK
- [ ] Test APK on physical device
- [ ] Distribute to users or publish to Play Store
- [ ] Monitor canister cycles and health

For questions or issues, refer to:
- [EAS Build Documentation](https://docs.expo.dev/build/introduction/)
- [ICP Deployment Guide](../icp_bridge/README.md)
- [Main README](../README.md)




