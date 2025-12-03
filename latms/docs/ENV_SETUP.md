# Environment Setup Guide

## Required Environment Variables

Your `.env` file needs to contain the following:

```env
DATABASE_URL="file:./prisma/dev.db"
```

## How to Set Up

1. Open your `.env` file (it's already in your project root)
2. Make sure it contains the `DATABASE_URL` line above
3. Save the file

## Checking Your Setup

Run this command to verify:

```bash
node check-env.js
```

If you see `✅ Set` next to DATABASE_URL, you're good to go!

## Common Issues

### "Missing required environment variable: DATABASE_URL"

**Solution**: Add this line to your `.env` file:
```env
DATABASE_URL="file:./prisma/dev.db"
```

### File Already Exists

Your `.env` file should already exist. Just open it and verify it has the DATABASE_URL line.

## Next Steps After Setting DATABASE_URL

1. Run `npx prisma generate` to generate the Prisma client
2. Run `npm run migrate:firebase` to sync data to Firebase
3. Update your API routes to use the dual-write service

---

**Note**: Since your `.env` file is open in your editor, you can check and edit it directly there!
