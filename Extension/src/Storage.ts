import { openDB } from 'idb';

export class Storage {
  static getDB() {
    return openDB('crypto-store', 2, {
      upgrade(db) {
        if (!db.objectStoreNames.contains('data')) {
          db.createObjectStore('data');
        }      
      }
    });
  }

  static async get(key: string): Promise<any> {
    const db = await this.getDB();
    return db.get('data', key) ?? null;
  }

  static async set(key: string, value: any): Promise<void> {
    const db = await this.getDB();
    await db.put('data', value, key);
  }

  static async remove(key: string): Promise<void> {
    const db = await this.getDB();
    await db.delete('data', key);
  }
}
