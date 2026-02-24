# Database Management

## Structure

```
db/
├── migrations/          # Schema changes and table definitions
│   └── shareAMeal.sql
└── seeds/               # Test and development data
    └── seed.sql
```

## Migrations

Run migrations to set up the database schema:

```powershell
mysql -u root -p sharemeal < db/migrations/shareAMeal.sql
```

## Seeds

After running migrations, populate with test data:

```powershell
mysql -u root -p sharemeal < db/seeds/seed.sql
```

**Note:** Seed file uses placeholder password hashes. For production-ready seeds with proper bcrypt hashes, register users via the API endpoints instead.

## Quick Setup

Run both migration and seed:

```powershell
Get-Content db/migrations/shareAMeal.sql, db/seeds/seed.sql | mysql -u root -padmin sharemeal
```

## Adding New Migrations

When modifying the schema:

1. Create additional migration files (e.g., `002_add_feature.sql`)
2. Document changes at the top
3. Use `IF NOT EXISTS` clauses for safety
4. Update this README
