# Migration to Production Tech Stack

## Quick Start

This application is being migrated to a cloud-native architecture. Here's what's been done and what's next:

### ✅ Phase 1: Infrastructure Setup (COMPLETE)

All backend services have been implemented:
- **MongoDB** models and connection
- **Firebase Auth** with Admin SDK  
- **AWS S3** file storage
- **Redis** caching
- **FCM** notifications

MongoDB is running locally. See [walkthrough.md](file:///.gemini/antigravity/brain/0901d1ea-ce6b-4bee-ac1d-3e5d214aea5d/walkthrough.md) for details.

### 📋 Next: Phase 2 - Application Integration

Update the application to use MongoDB instead of PostgreSQL:

1. **Connect MongoDB on startup** - Update `server/index.ts`
2. **Rewrite storage layer** - Replace Drizzle queries with Mongoose
3. **Test endpoints** - Verify all APIs work with MongoDB

### 🔗 External Services (Optional)

The app works locally, but for production you'll need:

**MongoDB Atlas** (recommended)
```
1. Create cluster at https://cloud.mongodb.com
2. Get connection string
3. Update MONGODB_URI in .env
```

**Firebase** (for auth & notifications)
```
1. Create project at https://console.firebase.google.com
2. Download service account JSON
3. Add FIREBASE_SERVICE_ACCOUNT_KEY to .env
```

**AWS S3** (for file storage)
```
1. Create S3 bucket
2. Create IAM user
3. Add AWS credentials to .env
```

See [implementation_plan.md](file:///.gemini/antigravity/brain/0901d1ea-ce6b-4bee-ac1d-3e5d214aea5d/implementation_plan.md) for full migration plan.

---

**Current Status**: Local development with MongoDB ✅  
**Next Step**: Integrate MongoDB into API endpoints
