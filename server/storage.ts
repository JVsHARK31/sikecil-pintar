// Storage interface for nutrition analysis app with persistence
import { users, meals, nutritionGoals, type User, type InsertUser, type Meal, type InsertMeal, type NutritionGoals, type InsertNutritionGoals, type NutritionAnalysis } from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, gte, lte } from "drizzle-orm";
import bcrypt from "bcryptjs";

export interface IStorage {
  // User management
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(userData: InsertUser): Promise<User>;
  verifyPassword(password: string, hashedPassword: string): Promise<boolean>;
  
  // Meal tracking
  saveMeal(mealData: InsertMeal): Promise<Meal>;
  getUserMeals(userId: number, limit?: number): Promise<Meal[]>;
  getMealsByDateRange(userId: number, startDate: Date, endDate: Date): Promise<Meal[]>;
  deleteMeal(mealId: number, userId: number): Promise<boolean>;
  
  // Nutrition goals
  setNutritionGoals(goalsData: InsertNutritionGoals): Promise<NutritionGoals>;
  getUserNutritionGoals(userId: number): Promise<NutritionGoals | undefined>;
  updateNutritionGoals(userId: number, goalsData: Partial<InsertNutritionGoals>): Promise<NutritionGoals | undefined>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }

  async createUser(userData: InsertUser): Promise<User> {
    // Hash password before storing
    const hashedPassword = await bcrypt.hash(userData.password, 10);
    const [user] = await db
      .insert(users)
      .values({ ...userData, password: hashedPassword })
      .returning();
    return user;
  }

  async verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(password, hashedPassword);
  }

  async saveMeal(mealData: InsertMeal): Promise<Meal> {
    const [meal] = await db
      .insert(meals)
      .values(mealData)
      .returning();
    return meal;
  }

  async getUserMeals(userId: number, limit = 50): Promise<Meal[]> {
    return db
      .select()
      .from(meals)
      .where(eq(meals.userId, userId))
      .orderBy(desc(meals.consumedAt))
      .limit(limit);
  }

  async getMealsByDateRange(userId: number, startDate: Date, endDate: Date): Promise<Meal[]> {
    return db
      .select()
      .from(meals)
      .where(
        and(
          eq(meals.userId, userId),
          gte(meals.consumedAt, startDate),
          lte(meals.consumedAt, endDate)
        )
      )
      .orderBy(desc(meals.consumedAt));
  }

  async deleteMeal(mealId: number, userId: number): Promise<boolean> {
    const result = await db
      .delete(meals)
      .where(and(eq(meals.id, mealId), eq(meals.userId, userId)))
      .returning();
    return result.length > 0;
  }

  async setNutritionGoals(goalsData: InsertNutritionGoals): Promise<NutritionGoals> {
    // Deactivate existing goals
    await db
      .update(nutritionGoals)
      .set({ isActive: false })
      .where(and(eq(nutritionGoals.userId, goalsData.userId), eq(nutritionGoals.isActive, true)));
    
    // Create new active goals
    const [goals] = await db
      .insert(nutritionGoals)
      .values({ ...goalsData, isActive: true })
      .returning();
    return goals;
  }

  async getUserNutritionGoals(userId: number): Promise<NutritionGoals | undefined> {
    const [goals] = await db
      .select()
      .from(nutritionGoals)
      .where(and(eq(nutritionGoals.userId, userId), eq(nutritionGoals.isActive, true)))
      .orderBy(desc(nutritionGoals.createdAt))
      .limit(1);
    return goals || undefined;
  }

  async updateNutritionGoals(userId: number, goalsData: Partial<InsertNutritionGoals>): Promise<NutritionGoals | undefined> {
    const currentGoals = await this.getUserNutritionGoals(userId);
    if (!currentGoals) {
      return undefined;
    }
    
    const [updatedGoals] = await db
      .update(nutritionGoals)
      .set({ ...goalsData, updatedAt: new Date() })
      .where(eq(nutritionGoals.id, currentGoals.id))
      .returning();
    return updatedGoals || undefined;
  }
}

export const storage = new DatabaseStorage();