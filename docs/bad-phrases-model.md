# Bad Phrases Model

The Bad Phrases model has been refactored to separate database CRUD operations from in-memory caching for classification.

## Usage Patterns

### For REST API Endpoints (CRUD)

All CRUD operations interact directly with the database:

```javascript
const badPhrasesModel = require('./models/badPhrasesModel');

// List with pagination
const result = await badPhrasesModel.listPaged({ page: 1, limit: 10, search: 'spam' });

// Get by ID
const phrase = await badPhrasesModel.findById(123);

// Create
const newPhrase = await badPhrasesModel.create({ phrase: 'buy now', score: 0.8 });

// Update
const updated = await badPhrasesModel.update(123, { phrase: 'BUY NOW!', score: 0.9 });

// Delete
const deleted = await badPhrasesModel.delete(123);
```

**Important:** After mutations (create/update/delete), call `loadCache()` to refresh the in-memory cache for classification:

```javascript
await badPhrasesModel.create({ phrase: 'spam word', score: 0.7 });
await badPhrasesModel.loadCache(); // Refresh cache
```

### For Message Classification

Use the cached phrases for fast lookups during spam scoring:

```javascript
const badPhrasesModel = require('./models/badPhrasesModel');

// Load cache at startup (done automatically in server.js)
await badPhrasesModel.loadCache();

// Get all cached phrases
const phrases = badPhrasesModel.getPhrasesForClassification();

// Check if phrase exists in cache
const found = badPhrasesModel.findInCache('spam');
```

## Architecture

- **Database layer**: All CRUD methods use Knex to query the `bad_phrases` table directly
- **Cache layer**: Separate in-memory arrays and maps for fast classification lookups
- **Consistency**: Cache is loaded at startup and refreshed after each mutation via REST API

## Benefits

1. **Performance**: REST endpoints always return fresh data from DB
2. **Speed**: Classification uses fast in-memory lookups
3. **Clarity**: Clear separation between data management and data usage
4. **Flexibility**: Cache can be refreshed on-demand or on a schedule
