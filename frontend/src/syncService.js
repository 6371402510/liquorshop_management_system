import { db } from './db';
import { getProducts } from './apiservices/inventoryapi';
/**
 * Fetches products from the backend and syncs them to the local IndexedDB.
 * Run this when the app loads or when the user goes online.
 */
export async function syncProductsToLocalDB(companyId) {
  if (!companyId) return;

  try {
    console.log("Syncing products to local DB...");
    
    // 1. Fetch all products from FastAPI
    const products = await getProducts(Number(companyId));

    // 2. Clear old local data for this company
    await db.products.where('company_id').equals(Number(companyId)).delete();

    // 3. Save new data locally (Dexie needs a primary key, ensure 'id' exists)
    const formattedProducts = products.map(p => ({
      ...p,
      company_id: Number(p.company_id) // Ensure company_id is a number for indexing
    }));

    await db.products.bulkPut(formattedProducts);
    console.log(`Synced ${formattedProducts.length} products locally.`);

  } catch (error) {
    console.error("Failed to sync products locally:", error);
  }
}