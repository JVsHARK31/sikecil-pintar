// Storage interface for nutrition analysis app
// This app is stateless - no persistent storage needed for analysis results

export interface IStorage {
  // Add storage methods here if needed for future features
  // Current app analyzes images and returns results without persistence
}

export class MemStorage implements IStorage {
  constructor() {
    // Initialize any storage if needed
  }
}

export const storage = new MemStorage();