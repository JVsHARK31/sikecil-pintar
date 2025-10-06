#!/usr/bin/env python3
"""
Meal Tracker CLI
Command-line interface for tracking meals and viewing nutrition history
"""

import json
import sys
from datetime import datetime, timedelta
from pathlib import Path
from typing import List, Dict, Any


class MealTrackerCLI:
    """CLI for meal tracking"""
    
    def __init__(self, data_file: str = "meals_data.json"):
        self.data_file = data_file
        self.meals = []
        self.load_data()
    
    def load_data(self):
        """Load meals from file"""
        if Path(self.data_file).exists():
            try:
                with open(self.data_file, 'r', encoding='utf-8') as f:
                    self.meals = json.load(f)
            except Exception as e:
                print(f"Warning: Could not load data: {e}")
                self.meals = []
        else:
            self.meals = []
    
    def save_data(self):
        """Save meals to file"""
        try:
            with open(self.data_file, 'w', encoding='utf-8') as f:
                json.dump(self.meals, f, indent=2, ensure_ascii=False)
            print(f"✓ Data saved to {self.data_file}")
        except Exception as e:
            print(f"✗ Error saving data: {e}")
    
    def add_meal(self, meal_type: str, calories: float, protein: float = 0, 
                 carbs: float = 0, fat: float = 0, notes: str = ""):
        """Add a new meal manually"""
        meal = {
            'id': f"{datetime.now().timestamp()}",
            'mealType': meal_type,
            'name': notes if notes else f"{meal_type.capitalize()} meal",
            'notes': notes,
            'consumedAt': datetime.now().isoformat(),
            'createdAt': datetime.now().isoformat(),
            'analysisData': {
                'totals': {
                    'calories_kcal': calories,
                    'macros': {
                        'protein_g': protein,
                        'carbs_g': carbs,
                        'fat_g': fat,
                        'fiber_g': 0,
                        'sugar_g': 0
                    },
                    'micros': {
                        'sodium_mg': 0,
                        'potassium_mg': 0,
                        'calcium_mg': 0,
                        'iron_mg': 0,
                        'vitamin_a_mcg': 0,
                        'vitamin_c_mg': 0,
                        'cholesterol_mg': 0
                    },
                    'allergens': [],
                    'serving_total_g': 0
                },
                'composition': [],
                'image_meta': {
                    'width': 0,
                    'height': 0
                }
            }
        }
        
        self.meals.insert(0, meal)
        self.save_data()
        print(f"✓ Added {meal_type} meal: {calories} kcal, {protein}g protein, {carbs}g carbs, {fat}g fat")
    
    def list_meals(self, days: int = 7):
        """List recent meals"""
        cutoff = datetime.now() - timedelta(days=days)
        recent_meals = [
            meal for meal in self.meals
            if datetime.fromisoformat(meal.get('consumedAt', '').replace('Z', '+00:00')) > cutoff
        ]
        
        if not recent_meals:
            print(f"No meals found in the last {days} days")
            return
        
        print(f"\n{'='*80}")
        print(f"MEALS - Last {days} Days ({len(recent_meals)} meals)")
        print(f"{'='*80}\n")
        
        for meal in recent_meals:
            consumed_at = datetime.fromisoformat(
                meal.get('consumedAt', '').replace('Z', '+00:00')
            )
            analysis = meal.get('analysisData', {})
            totals = analysis.get('totals', {})
            macros = totals.get('macros', {})
            
            print(f"📅 {consumed_at.strftime('%Y-%m-%d %H:%M')}")
            print(f"   Type: {meal.get('mealType', 'unknown').upper()}")
            if meal.get('name'):
                print(f"   Name: {meal.get('name')}")
            print(f"   Calories: {totals.get('calories_kcal', 0)} kcal")
            print(f"   Macros: P:{macros.get('protein_g', 0)}g | C:{macros.get('carbs_g', 0)}g | F:{macros.get('fat_g', 0)}g")
            if meal.get('notes'):
                print(f"   Notes: {meal.get('notes')}")
            print()
    
    def get_daily_summary(self, date: datetime = None):
        """Get nutrition summary for a specific day"""
        if date is None:
            date = datetime.now()
        
        day_start = date.replace(hour=0, minute=0, second=0, microsecond=0)
        day_end = day_start + timedelta(days=1)
        
        day_meals = [
            meal for meal in self.meals
            if day_start <= datetime.fromisoformat(meal.get('consumedAt', '').replace('Z', '+00:00')) < day_end
        ]
        
        total_calories = 0
        total_protein = 0
        total_carbs = 0
        total_fat = 0
        
        for meal in day_meals:
            analysis = meal.get('analysisData', {})
            totals = analysis.get('totals', {})
            macros = totals.get('macros', {})
            
            total_calories += totals.get('calories_kcal', 0)
            total_protein += macros.get('protein_g', 0)
            total_carbs += macros.get('carbs_g', 0)
            total_fat += macros.get('fat_g', 0)
        
        print(f"\n{'='*60}")
        print(f"DAILY SUMMARY - {date.strftime('%Y-%m-%d')}")
        print(f"{'='*60}")
        print(f"Total Meals: {len(day_meals)}")
        print(f"Total Calories: {round(total_calories, 2)} kcal")
        print(f"Protein: {round(total_protein, 2)}g")
        print(f"Carbs: {round(total_carbs, 2)}g")
        print(f"Fat: {round(total_fat, 2)}g")
        print(f"{'='*60}\n")
    
    def delete_last_meal(self):
        """Delete the most recent meal"""
        if not self.meals:
            print("No meals to delete")
            return
        
        deleted = self.meals.pop(0)
        self.save_data()
        print(f"✓ Deleted {deleted.get('mealType', 'unknown')} meal from {deleted.get('consumedAt')}")
    
    def interactive_add(self):
        """Interactive meal addition"""
        print("\n--- Add New Meal ---")
        
        meal_type = input("Meal type (breakfast/lunch/dinner/snack): ").strip().lower()
        if meal_type not in ['breakfast', 'lunch', 'dinner', 'snack']:
            meal_type = 'snack'
        
        try:
            calories = float(input("Calories (kcal): "))
            protein = float(input("Protein (g) [0]: ") or "0")
            carbs = float(input("Carbs (g) [0]: ") or "0")
            fat = float(input("Fat (g) [0]: ") or "0")
            notes = input("Notes (optional): ").strip()
            
            self.add_meal(meal_type, calories, protein, carbs, fat, notes)
        except ValueError:
            print("✗ Invalid input. Please enter numbers for nutrition values.")


def print_help():
    """Print help message"""
    print("""
Meal Tracker CLI - Track your nutrition from command line

Usage:
  python meal_tracker.py [command] [options]

Commands:
  add <type> <calories> <protein> <carbs> <fat> [notes]
      Add a new meal
      Example: python meal_tracker.py add breakfast 500 30 50 15 "Oatmeal with eggs"
  
  list [days]
      List meals from last N days (default: 7)
      Example: python meal_tracker.py list 14
  
  today
      Show today's nutrition summary
  
  delete-last
      Delete the most recent meal
  
  interactive
      Add meal interactively
  
  help
      Show this help message

Examples:
  python meal_tracker.py add lunch 650 35 60 25 "Chicken with rice"
  python meal_tracker.py list 7
  python meal_tracker.py today
    """)


def main():
    """Main function"""
    tracker = MealTrackerCLI()
    
    if len(sys.argv) < 2:
        print_help()
        return
    
    command = sys.argv[1].lower()
    
    if command == 'add':
        if len(sys.argv) < 6:
            print("Usage: python meal_tracker.py add <type> <calories> <protein> <carbs> <fat> [notes]")
            return
        
        meal_type = sys.argv[2]
        calories = float(sys.argv[3])
        protein = float(sys.argv[4])
        carbs = float(sys.argv[5])
        fat = float(sys.argv[6])
        notes = ' '.join(sys.argv[7:]) if len(sys.argv) > 7 else ""
        
        tracker.add_meal(meal_type, calories, protein, carbs, fat, notes)
    
    elif command == 'list':
        days = int(sys.argv[2]) if len(sys.argv) > 2 else 7
        tracker.list_meals(days)
    
    elif command == 'today':
        tracker.get_daily_summary()
    
    elif command == 'delete-last':
        tracker.delete_last_meal()
    
    elif command == 'interactive':
        tracker.interactive_add()
    
    elif command == 'help':
        print_help()
    
    else:
        print(f"Unknown command: {command}")
        print("Run 'python meal_tracker.py help' for usage information")


if __name__ == "__main__":
    main()
