import type { Express } from "express";
import { createServer, type Server } from "http";
import { z } from "zod";
import { AnalysisRequestSchema, NutritionAnalysisSchema, insertUserSchema, insertMealSchema, insertNutritionGoalsSchema } from "@shared/schema";
import { storage } from "./storage";

const SUMOPOD_BASE_URL = "https://ai.sumopod.com/v1/chat/completions";

const SYSTEM_PROMPT = `You are a pediatric nutrition and food composition expert. Respond with STRICT JSON only per the provided schema. No extra text.

Analyze this image. Identify each distinct food item (e.g., nasi goreng, kerupuk, sayur, telur, sosis). For each item, estimate serving_est_g and provide nutrition fields. Provide composition bounding boxes as normalized bbox (x,y,w,h) in [0..1]. Sum all items into totals. Reply strictly with JSON schema only.

Return JSON in this exact format:
{
  "image_meta": {
    "width": number,
    "height": number,
    "orientation": "portrait" | "landscape" | "square"
  },
  "composition": [
    {
      "label": "string",
      "confidence": number,
      "serving_est_g": number,
      "bbox_norm": {
        "x": number, "y": number, "w": number, "h": number
      },
      "nutrition": {
        "calories_kcal": number,
        "macros": {
          "protein_g": number,
          "carbs_g": number,
          "fat_g": number,
          "fiber_g": number,
          "sugar_g": number
        },
        "micros": {
          "sodium_mg": number,
          "potassium_mg": number,
          "calcium_mg": number,
          "iron_mg": number,
          "vitamin_a_mcg": number,
          "vitamin_c_mg": number,
          "cholesterol_mg": number
        },
        "allergens": ["string"]
      }
    }
  ],
  "totals": {
    "serving_total_g": number,
    "calories_kcal": number,
    "macros": {
      "protein_g": number,
      "carbs_g": number,
      "fat_g": number,
      "fiber_g": number,
      "sugar_g": number
    },
    "micros": {
      "sodium_mg": number,
      "potassium_mg": number,
      "calcium_mg": number,
      "iron_mg": number,
      "vitamin_a_mcg": number,
      "vitamin_c_mg": number,
      "cholesterol_mg": number
    },
    "allergens": ["string"]
  },
  "notes": "string"
}`;

async function callSumopodAPI(apiKey: string, model: string, dataURL: string): Promise<any> {
  const requestBody = {
    model,
    temperature: 0.2,
    max_tokens: 1200,
    messages: [
      {
        role: 'system',
        content: SYSTEM_PROMPT,
      },
      {
        role: 'user',
        content: [
          {
            type: 'text',
            text: 'Analyze this image. Identify each distinct food item (e.g., nasi goreng, kerupuk, sayur, telur, sosis). For each item, estimate serving_est_g and provide nutrition fields. Provide composition bounding boxes as normalized bbox (x,y,w,h) in [0..1]. Sum all items into totals. Reply strictly with JSON schema only.',
          },
          {
            type: 'image_url',
            image_url: {
              url: dataURL,
            },
          },
        ],
      },
    ],
  };

  console.log('Calling Sumopod API with model:', model);
  console.log('Request body keys:', Object.keys(requestBody));
  console.log('Image data URL prefix:', dataURL.substring(0, 50));

  const response = await fetch(SUMOPOD_BASE_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify(requestBody),
  });

  console.log('Sumopod API response status:', response.status);
  console.log('Sumopod API response headers:', Object.fromEntries(response.headers.entries()));

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Sumopod API error response body:', errorText);
    throw new Error(`Sumopod API error: ${response.status} ${response.statusText} - ${errorText}`);
  }

  const data = await response.json();
  console.log('Sumopod API response keys:', Object.keys(data));
  return data.choices[0]?.message?.content || '';
}

function extractJSON(text: string): object {
  try {
    // Try parsing directly first
    return JSON.parse(text);
  } catch {
    // Remove code fences if present
    const cleanedText = text.replace(/```json\s*|\s*```/g, '').trim();
    
    try {
      return JSON.parse(cleanedText);
    } catch {
      // Extract JSON object using regex as fallback
      const jsonMatch = cleanedText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        try {
          return JSON.parse(jsonMatch[0]);
        } catch {
          throw new Error('Invalid JSON in response');
        }
      }
      throw new Error('No JSON found in response');
    }
  }
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Check available models for debugging
  app.get("/api/models", async (req, res) => {
    try {
      const geminiKey = process.env.SUMOPOD_GEMINI_API_KEY;
      const gptKey = process.env.SUMOPOD_GPT5_API_KEY;
      
      if (!geminiKey || !gptKey) {
        return res.status(500).json({ message: "API keys not configured" });
      }

      const [geminiModels, gptModels] = await Promise.all([
        fetch("https://ai.sumopod.com/v1/models", {
          headers: { "Authorization": `Bearer ${geminiKey}` }
        }).then(r => r.json()),
        fetch("https://ai.sumopod.com/v1/models", {
          headers: { "Authorization": `Bearer ${gptKey}` }
        }).then(r => r.json())
      ]);

      res.json({
        gemini_key_models: geminiModels,
        gpt_key_models: gptModels
      });
    } catch (error) {
      console.error('Models check error:', error);
      res.status(500).json({ message: "Failed to check models" });
    }
  });

  // Image upload analysis using GEMINI
  app.post("/api/analyze-image", async (req, res) => {
    try {
      const { dataURL } = AnalysisRequestSchema.parse(req.body);
      
      const apiKey = process.env.SUMOPOD_GEMINI_API_KEY;
      if (!apiKey) {
        return res.status(500).json({ 
          message: "SUMOPOD_GEMINI_API_KEY not configured" 
        });
      }

      const rawResponse = await callSumopodAPI(apiKey, "gemini/gemini-2.0-flash", dataURL);
      console.log("Raw AI response:", JSON.stringify(rawResponse, null, 2));
      
      const jsonData = extractJSON(rawResponse);
      console.log("Extracted JSON:", JSON.stringify(jsonData, null, 2));
      
      // Validate response against schema
      const analysis = NutritionAnalysisSchema.parse(jsonData);
      
      res.json(analysis);
    } catch (error) {
      console.error('Image analysis error:', error);
      res.status(400).json({ 
        message: error instanceof Error ? error.message : "Analysis failed" 
      });
    }
  });

  // Camera capture analysis using GPT-5-nano
  app.post("/api/analyze-camera", async (req, res) => {
    try {
      const { dataURL } = AnalysisRequestSchema.parse(req.body);
      
      const apiKey = process.env.SUMOPOD_GPT5_API_KEY;
      if (!apiKey) {
        return res.status(500).json({ 
          message: "SUMOPOD_GPT5_API_KEY not configured" 
        });
      }

      const rawResponse = await callSumopodAPI(apiKey, "gpt-5-nano", dataURL);
      const jsonData = extractJSON(rawResponse);
      
      // Validate response against schema
      const analysis = NutritionAnalysisSchema.parse(jsonData);
      
      res.json(analysis);
    } catch (error) {
      console.error('Camera analysis error:', error);
      res.status(400).json({ 
        message: error instanceof Error ? error.message : "Analysis failed" 
      });
    }
  });

  // Authentication routes
  app.post("/api/auth/register", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      
      // Check if user already exists
      const existingUser = await storage.getUserByEmail(userData.email);
      if (existingUser) {
        return res.status(400).json({ message: "User already exists" });
      }
      
      const user = await storage.createUser(userData);
      res.status(201).json({ 
        user: { id: user.id, username: user.username, email: user.email, fullName: user.fullName },
        message: "User created successfully" 
      });
    } catch (error) {
      console.error('Registration error:', error);
      res.status(400).json({ 
        message: error instanceof Error ? error.message : "Registration failed" 
      });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password } = req.body;
      
      if (!email || !password) {
        return res.status(400).json({ message: "Email and password required" });
      }
      
      const user = await storage.getUserByEmail(email);
      if (!user) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
      
      const isValidPassword = await storage.verifyPassword(password, user.password);
      if (!isValidPassword) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
      
      res.json({ 
        user: { id: user.id, username: user.username, email: user.email, fullName: user.fullName },
        message: "Login successful" 
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ message: "Login failed" });
    }
  });

  // Meal tracking routes
  app.post("/api/meals", async (req, res) => {
    try {
      const mealData = insertMealSchema.parse(req.body);
      const meal = await storage.saveMeal(mealData);
      res.status(201).json(meal);
    } catch (error) {
      console.error('Save meal error:', error);
      res.status(400).json({ 
        message: error instanceof Error ? error.message : "Failed to save meal" 
      });
    }
  });

  app.get("/api/meals/:userId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;
      const meals = await storage.getUserMeals(userId, limit);
      res.json(meals);
    } catch (error) {
      console.error('Get meals error:', error);
      res.status(500).json({ message: "Failed to get meals" });
    }
  });

  app.get("/api/meals/:userId/range", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const { startDate, endDate } = req.query;
      
      if (!startDate || !endDate) {
        return res.status(400).json({ message: "Start date and end date required" });
      }
      
      const meals = await storage.getMealsByDateRange(
        userId, 
        new Date(startDate as string), 
        new Date(endDate as string)
      );
      res.json(meals);
    } catch (error) {
      console.error('Get meals by date range error:', error);
      res.status(500).json({ message: "Failed to get meals" });
    }
  });

  app.delete("/api/meals/:mealId/:userId", async (req, res) => {
    try {
      const mealId = parseInt(req.params.mealId);
      const userId = parseInt(req.params.userId);
      const success = await storage.deleteMeal(mealId, userId);
      
      if (success) {
        res.json({ message: "Meal deleted successfully" });
      } else {
        res.status(404).json({ message: "Meal not found" });
      }
    } catch (error) {
      console.error('Delete meal error:', error);
      res.status(500).json({ message: "Failed to delete meal" });
    }
  });

  // Nutrition goals routes
  app.post("/api/nutrition-goals", async (req, res) => {
    try {
      const goalsData = insertNutritionGoalsSchema.parse(req.body);
      const goals = await storage.setNutritionGoals(goalsData);
      res.status(201).json(goals);
    } catch (error) {
      console.error('Set nutrition goals error:', error);
      res.status(400).json({ 
        message: error instanceof Error ? error.message : "Failed to set nutrition goals" 
      });
    }
  });

  app.get("/api/nutrition-goals/:userId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const goals = await storage.getUserNutritionGoals(userId);
      
      if (goals) {
        res.json(goals);
      } else {
        res.status(404).json({ message: "No nutrition goals found" });
      }
    } catch (error) {
      console.error('Get nutrition goals error:', error);
      res.status(500).json({ message: "Failed to get nutrition goals" });
    }
  });

  app.put("/api/nutrition-goals/:userId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const goalsUpdate = req.body;
      const goals = await storage.updateNutritionGoals(userId, goalsUpdate);
      
      if (goals) {
        res.json(goals);
      } else {
        res.status(404).json({ message: "No nutrition goals found to update" });
      }
    } catch (error) {
      console.error('Update nutrition goals error:', error);
      res.status(500).json({ message: "Failed to update nutrition goals" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
