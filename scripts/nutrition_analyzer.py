#!/usr/bin/env python3
"""
Nutrition Analyzer Script
Analyze nutrition data from JSON files and generate insights
"""

import json
import sys
from datetime import datetime, timedelta
from typing import Dict, List, Any
from pathlib import Path


class NutritionAnalyzer:
    """Analyze nutrition data and provide insights"""
    
    def __init__(self, data_file: str = None):
        self.data_file = data_file
        self.meals = []
        if data_file and Path(data_file).exists():
            self.load_data(data_file)
    
    def load_data(self, filepath: str):
        """Load nutrition data from JSON file"""
        try:
            with open(filepath, 'r', encoding='utf-8') as f:
                self.meals = json.load(f)
            print(f"✓ Loaded {len(self.meals)} meals from {filepath}")
        except Exception as e:
            print(f"✗ Error loading data: {e}")
            sys.exit(1)
    
    def analyze_macros(self) -> Dict[str, Any]:
        """Analyze macronutrient distribution"""
        total_protein = 0
        total_carbs = 0
        total_fat = 0
        total_calories = 0
        
        for meal in self.meals:
            analysis = meal.get('analysisData', {})
            totals = analysis.get('totals', {})
            macros = totals.get('macros', {})
            
            total_protein += macros.get('protein_g', 0)
            total_carbs += macros.get('carbs_g', 0)
            total_fat += macros.get('fat_g', 0)
            total_calories += totals.get('calories_kcal', 0)
        
        # Calculate percentages
        total_grams = total_protein + total_carbs + total_fat
        
        if total_grams > 0:
            protein_pct = (total_protein / total_grams) * 100
            carbs_pct = (total_carbs / total_grams) * 100
            fat_pct = (total_fat / total_grams) * 100
        else:
            protein_pct = carbs_pct = fat_pct = 0
        
        return {
            'total_protein': round(total_protein, 2),
            'total_carbs': round(total_carbs, 2),
            'total_fat': round(total_fat, 2),
            'total_calories': round(total_calories, 2),
            'protein_percentage': round(protein_pct, 2),
            'carbs_percentage': round(carbs_pct, 2),
            'fat_percentage': round(fat_pct, 2)
        }
    
    def get_meal_frequency(self) -> Dict[str, int]:
        """Get frequency of meal types"""
        frequency = {}
        for meal in self.meals:
            meal_type = meal.get('mealType', 'unknown')
            frequency[meal_type] = frequency.get(meal_type, 0) + 1
        return frequency
    
    def get_daily_averages(self, days: int = 7) -> Dict[str, float]:
        """Calculate daily averages for the last N days"""
        cutoff_date = datetime.now() - timedelta(days=days)
        recent_meals = [
            meal for meal in self.meals
            if datetime.fromisoformat(meal.get('consumedAt', '').replace('Z', '+00:00')) > cutoff_date
        ]
        
        if not recent_meals:
            return {'calories': 0, 'protein': 0, 'carbs': 0, 'fat': 0}
        
        total_calories = 0
        total_protein = 0
        total_carbs = 0
        total_fat = 0
        
        for meal in recent_meals:
            analysis = meal.get('analysisData', {})
            totals = analysis.get('totals', {})
            macros = totals.get('macros', {})
            
            total_calories += totals.get('calories_kcal', 0)
            total_protein += macros.get('protein_g', 0)
            total_carbs += macros.get('carbs_g', 0)
            total_fat += macros.get('fat_g', 0)
        
        return {
            'calories': round(total_calories / days, 2),
            'protein': round(total_protein / days, 2),
            'carbs': round(total_carbs / days, 2),
            'fat': round(total_fat / days, 2)
        }
    
    def get_top_foods(self, limit: int = 10) -> List[Dict[str, Any]]:
        """Get most frequently detected food items"""
        food_count = {}
        
        for meal in self.meals:
            analysis = meal.get('analysisData', {})
            composition = analysis.get('composition', [])
            
            for item in composition:
                label = item.get('label', 'unknown')
                if label not in food_count:
                    food_count[label] = {
                        'count': 0,
                        'total_calories': 0,
                        'total_protein': 0
                    }
                
                food_count[label]['count'] += 1
                nutrition = item.get('nutrition', {})
                food_count[label]['total_calories'] += nutrition.get('calories_kcal', 0)
                food_count[label]['total_protein'] += nutrition.get('macros', {}).get('protein_g', 0)
        
        # Sort by count
        sorted_foods = sorted(
            food_count.items(),
            key=lambda x: x[1]['count'],
            reverse=True
        )
        
        return [
            {
                'food': food,
                'count': data['count'],
                'avg_calories': round(data['total_calories'] / data['count'], 2),
                'avg_protein': round(data['total_protein'] / data['count'], 2)
            }
            for food, data in sorted_foods[:limit]
        ]
    
    def print_summary(self):
        """Print comprehensive nutrition summary"""
        print("\n" + "="*60)
        print("NUTRITION ANALYSIS SUMMARY")
        print("="*60)
        
        print(f"\nTotal Meals Analyzed: {len(self.meals)}")
        
        # Macronutrient Analysis
        print("\n--- MACRONUTRIENT DISTRIBUTION ---")
        macros = self.analyze_macros()
        print(f"Total Calories: {macros['total_calories']} kcal")
        print(f"Total Protein: {macros['total_protein']}g ({macros['protein_percentage']}%)")
        print(f"Total Carbs: {macros['total_carbs']}g ({macros['carbs_percentage']}%)")
        print(f"Total Fat: {macros['total_fat']}g ({macros['fat_percentage']}%)")
        
        # Meal Frequency
        print("\n--- MEAL TYPE FREQUENCY ---")
        frequency = self.get_meal_frequency()
        for meal_type, count in sorted(frequency.items(), key=lambda x: x[1], reverse=True):
            print(f"{meal_type.capitalize()}: {count} meals")
        
        # Daily Averages
        print("\n--- 7-DAY DAILY AVERAGES ---")
        averages = self.get_daily_averages(7)
        print(f"Calories: {averages['calories']} kcal/day")
        print(f"Protein: {averages['protein']}g/day")
        print(f"Carbs: {averages['carbs']}g/day")
        print(f"Fat: {averages['fat']}g/day")
        
        # Top Foods
        print("\n--- TOP 10 FOODS ---")
        top_foods = self.get_top_foods(10)
        for i, food in enumerate(top_foods, 1):
            print(f"{i}. {food['food']}: {food['count']} times "
                  f"(avg {food['avg_calories']} kcal, {food['avg_protein']}g protein)")
        
        print("\n" + "="*60)


def main():
    """Main function"""
    if len(sys.argv) < 2:
        print("Usage: python nutrition_analyzer.py <json_file>")
        print("\nExample:")
        print("  python nutrition_analyzer.py meals_data.json")
        sys.exit(1)
    
    data_file = sys.argv[1]
    
    if not Path(data_file).exists():
        print(f"✗ File not found: {data_file}")
        sys.exit(1)
    
    analyzer = NutritionAnalyzer(data_file)
    analyzer.print_summary()


if __name__ == "__main__":
    main()
