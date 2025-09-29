import { z } from "zod";
import { createInsertSchema } from "drizzle-zod";

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
  width: z.number().positive(),
  height: z.number().positive(),
  orientation: z.enum(['portrait', 'landscape', 'square']),
});

export const NutritionAnalysisSchema = z.object({
  image_meta: ImageMetaSchema,
  composition: z.array(FoodItemSchema).min(1),
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

// Types
export type BoundingBox = z.infer<typeof BoundingBoxSchema>;
export type Macronutrients = z.infer<typeof MacronutrientsSchema>;
export type Micronutrients = z.infer<typeof MicronutrientsSchema>;
export type Nutrition = z.infer<typeof NutritionSchema>;
export type FoodItem = z.infer<typeof FoodItemSchema>;
export type ImageMeta = z.infer<typeof ImageMetaSchema>;
export type NutritionAnalysis = z.infer<typeof NutritionAnalysisSchema>;
export type AnalysisRequest = z.infer<typeof AnalysisRequestSchema>;
