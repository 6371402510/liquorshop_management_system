import Dexie from 'dexie';

// Create a local database in the browser
export const db = new Dexie('IMFLBillingDB');

// Define the schema. Only indexed fields need to be listed.
// We must index 'barcode' and 'item_code' so offline search is lightning fast.
db.version(1).stores({
  products: 'id, barcode, item_code, name, company_id' 
});