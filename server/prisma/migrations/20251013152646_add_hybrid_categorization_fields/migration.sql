-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_products" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "price" REAL NOT NULL,
    "originalPrice" REAL,
    "image" TEXT,
    "categoryId" TEXT NOT NULL,
    "supplierId" TEXT,
    "sku" TEXT,
    "stock" INTEGER NOT NULL DEFAULT 0,
    "weight" REAL,
    "dimensions" TEXT,
    "attributes" TEXT,
    "status" TEXT NOT NULL DEFAULT 'active',
    "originalCategory" TEXT,
    "supplierCategory" TEXT,
    "mappingConfidence" REAL,
    "isManuallyMapped" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "products_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "categories" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "products_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "suppliers" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_products" ("attributes", "categoryId", "createdAt", "description", "dimensions", "id", "image", "name", "originalPrice", "price", "sku", "status", "stock", "supplierId", "updatedAt", "weight") SELECT "attributes", "categoryId", "createdAt", "description", "dimensions", "id", "image", "name", "originalPrice", "price", "sku", "status", "stock", "supplierId", "updatedAt", "weight" FROM "products";
DROP TABLE "products";
ALTER TABLE "new_products" RENAME TO "products";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
