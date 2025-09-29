import { z } from "zod";
import { createInsertSchema } from "drizzle-zod";
import { pgTable, serial, varchar, text, timestamp, jsonb, integer, boolean } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// Nutrition analysis schemas
export const BoundingBoxSchema = z.object({
  x: z.number().min(0).max(1),
  y: z.number().min(0).max(1),
  w: z.number().min(0).max(1),
  h: z.number().min(0).max(1),
});

export const MacronutrientsSchema = z.object({
  protein_g: z.number().min(0),
  carbs_g: z.number().min(0),
  fat_g: z.number().min(0),
  fiber_g: z.number().min(0),
  sugar_g: z.number().min(0),
});

export const MicronutrientsSchema = z.object({
  sodium_mg: z.number().min(0),
  potassium_mg: z.number().min(0),
  calcium_mg: z.number().min(0),
  iron_mg: z.number().min(0),
  vitamin_a_mcg: z.number().min(0),
  vitamin_c_mg: z.number().min(0),
  cholesterol_mg: z.number().min(0),
});

export const NutritionSchema = z.object({
  calories_kcal: z.number().min(0),
  macros: MacronutrientsSchema,
  micros: MicronutrientsSchema,
  allergens: z.array(z.string()),
});

export const FoodItemSchema = z.object({
  label: z.string(),
  confidence: z.number().min(0).max(1),
  serving_est_g: z.number().min(0),
  bbox_norm: BoundingBoxSchema,
  nutrition: NutritionSchema,
});

export const ImageMetaSchema = z.object({
  width: z.number().min(0),
  height: z.number().min(0),
  orientation: z.enum(['portrait', 'landscape', 'square']),
});

export const NutritionAnalysisSchema = z.object({
  image_meta: ImageMetaSchema,
  composition: z.array(FoodItemSchema),
  totals: z.object({
    serving_total_g: z.number().min(0),
    calories_kcal: z.number().min(0),
    macros: MacronutrientsSchema,
    micros: MicronutrientsSchema,
    allergens: z.array(z.string()),
  }),
  notes: z.string().optional(),
});

export const AnalysisRequestSchema = z.object({
  dataURL: z.string(),
});

// Database Tables
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: varchar("username", { length: 50 }).unique().notNull(),
  password: varchar("password", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).unique().notNull(),
  fullName: varchar("full_name", { length: 100 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const nutritionGoals = pgTable("nutrition_goals", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  dailyCalories: integer("daily_calories"),
  dailyProtein: integer("daily_protein"),
  dailyCarbs: integer("daily_carbs"),
  dailyFat: integer("daily_fat"),
  dailyFiber: integer("daily_fiber"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const meals = pgTable("meals", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  name: varchar("name", { length: 100 }),
  mealType: varchar("meal_type", { length: 20 }).notNull(), // breakfast, lunch, dinner, snack
  analysisData: jsonb("analysis_data").notNull(), // Store NutritionAnalysis JSON
  imageUrl: text("image_url"),
  notes: text("notes"),
  consumedAt: timestamp("consumed_at").defaultNow().notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  meals: many(meals),
  nutritionGoals: many(nutritionGoals),
}));

export const mealsRelations = relations(meals, ({ one }) => ({
  user: one(users, {
    fields: [meals.userId],
    references: [users.id],
  }),
}));

export const nutritionGoalsRelations = relations(nutritionGoals, ({ one }) => ({
  user: one(users, {
    fields: [nutritionGoals.userId],
    references: [users.id],
  }),
}));

// Drizzle Zod Schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
});

export const insertMealSchema = createInsertSchema(meals).omit({
  id: true,
  createdAt: true,
});

export const insertNutritionGoalsSchema = createInsertSchema(nutritionGoals).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Types
export type BoundingBox = z.infer<typeof BoundingBoxSchema>;
export type Macronutrients = z.infer<typeof MacronutrientsSchema>;
export type Micronutrients = z.infer<typeof MicronutrientsSchema>;
export type Nutrition = z.infer<typeof NutritionSchema>;
export type FoodItem = z.infer<typeof FoodItemSchema>;
export type ImageMeta = z.infer<typeof ImageMetaSchema>;
export type NutritionAnalysis = z.infer<typeof NutritionAnalysisSchema>;
export type AnalysisRequest = z.infer<typeof AnalysisRequestSchema>;

export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Meal = typeof meals.$inferSelect;
export type InsertMeal = z.infer<typeof insertMealSchema>;
export type NutritionGoals = typeof nutritionGoals.$inferSelect;
export type InsertNutritionGoals = z.infer<typeof insertNutritionGoalsSchema>;
