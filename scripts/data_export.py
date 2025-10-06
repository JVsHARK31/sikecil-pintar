#!/usr/bin/env python3
"""
Data Export Script
Convert nutrition data between different formats (JSON, CSV, Excel, etc.)
"""

import json
import csv
import sys
from pathlib import Path
from datetime import datetime
from typing import List, Dict, Any


class NutritionDataExporter:
    """Export nutrition data to various formats"""
    
    def __init__(self, input_file: str):
        self.input_file = input_file
        self.meals = []
        self.load_data()
    
    def load_data(self):
        """Load data from JSON file"""
        try:
            with open(self.input_file, 'r', encoding='utf-8') as f:
                self.meals = json.load(f)
            print(f"✓ Loaded {len(self.meals)} meals from {self.input_file}")
        except Exception as e:
            print(f"✗ Error loading data: {e}")
            sys.exit(1)
    
    def export_to_csv(self, output_file: str):
        """Export meals to CSV format"""
        try:
            with open(output_file, 'w', newline='', encoding='utf-8') as f:
                writer = csv.writer(f)
                
                # Write header
                writer.writerow([
                    'Date', 'Time', 'Meal Type', 'Meal Name',
                    'Calories (kcal)', 'Protein (g)', 'Carbs (g)', 'Fat (g)',
                    'Fiber (g)', 'Sugar (g)', 'Sodium (mg)', 'Items Count'
                ])
                
                # Write data
                for meal in self.meals:
                    consumed_at = datetime.fromisoformat(
                        meal.get('consumedAt', '').replace('Z', '+00:00')
                    )
                    
                    analysis = meal.get('analysisData', {})
                    totals = analysis.get('totals', {})
                    macros = totals.get('macros', {})
                    micros = totals.get('micros', {})
                    composition = analysis.get('composition', [])
                    
                    writer.writerow([
                        consumed_at.strftime('%Y-%m-%d'),
                        consumed_at.strftime('%H:%M:%S'),
                        meal.get('mealType', ''),
                        meal.get('name', ''),
                        totals.get('calories_kcal', 0),
                        macros.get('protein_g', 0),
                        macros.get('carbs_g', 0),
                        macros.get('fat_g', 0),
                        macros.get('fiber_g', 0),
                        macros.get('sugar_g', 0),
                        micros.get('sodium_mg', 0),
                        len(composition)
                    ])
            
            print(f"✓ Exported to CSV: {output_file}")
        except Exception as e:
            print(f"✗ Error exporting to CSV: {e}")
    
    def export_detailed_csv(self, output_file: str):
        """Export detailed meal composition to CSV"""
        try:
            with open(output_file, 'w', newline='', encoding='utf-8') as f:
                writer = csv.writer(f)
                
                # Write header
                writer.writerow([
                    'Date', 'Meal Type', 'Food Item', 'Confidence',
                    'Weight (g)', 'Calories', 'Protein', 'Carbs', 'Fat',
                    'Fiber', 'Sugar', 'Sodium', 'Allergens'
                ])
                
                # Write data
                for meal in self.meals:
                    consumed_at = datetime.fromisoformat(
                        meal.get('consumedAt', '').replace('Z', '+00:00')
                    )
                    date_str = consumed_at.strftime('%Y-%m-%d')
                    meal_type = meal.get('mealType', '')
                    
                    analysis = meal.get('analysisData', {})
                    composition = analysis.get('composition', [])
                    
                    for item in composition:
                        nutrition = item.get('nutrition', {})
                        macros = nutrition.get('macros', {})
                        micros = nutrition.get('micros', {})
                        allergens = ', '.join(nutrition.get('allergens', []))
                        
                        writer.writerow([
                            date_str,
                            meal_type,
                            item.get('label', ''),
                            f"{item.get('confidence', 0) * 100:.1f}%",
                            item.get('serving_est_g', 0),
                            nutrition.get('calories_kcal', 0),
                            macros.get('protein_g', 0),
                            macros.get('carbs_g', 0),
                            macros.get('fat_g', 0),
                            macros.get('fiber_g', 0),
                            macros.get('sugar_g', 0),
                            micros.get('sodium_mg', 0),
                            allergens
                        ])
            
            print(f"✓ Exported detailed CSV: {output_file}")
        except Exception as e:
            print(f"✗ Error exporting detailed CSV: {e}")
    
    def export_summary_json(self, output_file: str):
        """Export summary statistics to JSON"""
        try:
            summary = {
                'generated_at': datetime.now().isoformat(),
                'total_meals': len(self.meals),
                'date_range': self._get_date_range(),
                'meal_types': self._count_meal_types(),
                'nutrition_totals': self._calculate_totals(),
                'daily_averages': self._calculate_daily_averages()
            }
            
            with open(output_file, 'w', encoding='utf-8') as f:
                json.dump(summary, f, indent=2, ensure_ascii=False)
            
            print(f"✓ Exported summary JSON: {output_file}")
        except Exception as e:
            print(f"✗ Error exporting summary JSON: {e}")
    
    def _get_date_range(self) -> Dict[str, str]:
        """Get date range of meals"""
        if not self.meals:
            return {'start': None, 'end': None}
        
        dates = [
            datetime.fromisoformat(meal.get('consumedAt', '').replace('Z', '+00:00'))
            for meal in self.meals
        ]
        
        return {
            'start': min(dates).strftime('%Y-%m-%d'),
            'end': max(dates).strftime('%Y-%m-%d')
        }
    
    def _count_meal_types(self) -> Dict[str, int]:
        """Count meals by type"""
        counts = {}
        for meal in self.meals:
            meal_type = meal.get('mealType', 'unknown')
            counts[meal_type] = counts.get(meal_type, 0) + 1
        return counts
    
    def _calculate_totals(self) -> Dict[str, float]:
        """Calculate total nutrition"""
        totals = {
            'calories': 0,
            'protein': 0,
            'carbs': 0,
            'fat': 0,
            'fiber': 0,
            'sugar': 0
        }
        
        for meal in self.meals:
            analysis = meal.get('analysisData', {})
            meal_totals = analysis.get('totals', {})
            macros = meal_totals.get('macros', {})
            
            totals['calories'] += meal_totals.get('calories_kcal', 0)
            totals['protein'] += macros.get('protein_g', 0)
            totals['carbs'] += macros.get('carbs_g', 0)
            totals['fat'] += macros.get('fat_g', 0)
            totals['fiber'] += macros.get('fiber_g', 0)
            totals['sugar'] += macros.get('sugar_g', 0)
        
        return {k: round(v, 2) for k, v in totals.items()}
    
    def _calculate_daily_averages(self) -> Dict[str, float]:
        """Calculate daily averages"""
        if not self.meals:
            return {}
        
        dates = set()
        for meal in self.meals:
            consumed_at = datetime.fromisoformat(
                meal.get('consumedAt', '').replace('Z', '+00:00')
            )
            dates.add(consumed_at.date())
        
        total_days = len(dates)
        if total_days == 0:
            return {}
        
        totals = self._calculate_totals()
        
        return {
            k: round(v / total_days, 2)
            for k, v in totals.items()
        }


def main():
    """Main function"""
    if len(sys.argv) < 2:
        print("Usage: python data_export.py <input_json> [options]")
        print("\nOptions:")
        print("  --csv <file>           Export summary to CSV")
        print("  --detailed-csv <file>  Export detailed composition to CSV")
        print("  --summary-json <file>  Export summary statistics to JSON")
        print("  --all <prefix>         Export all formats with given prefix")
        print("\nExample:")
        print("  python data_export.py meals.json --csv summary.csv")
        print("  python data_export.py meals.json --all exported_data")
        sys.exit(1)
    
    input_file = sys.argv[1]
    
    if not Path(input_file).exists():
        print(f"✗ File not found: {input_file}")
        sys.exit(1)
    
    exporter = NutritionDataExporter(input_file)
    
    # Parse arguments
    i = 2
    while i < len(sys.argv):
        if sys.argv[i] == '--csv' and i + 1 < len(sys.argv):
            exporter.export_to_csv(sys.argv[i + 1])
            i += 2
        elif sys.argv[i] == '--detailed-csv' and i + 1 < len(sys.argv):
            exporter.export_detailed_csv(sys.argv[i + 1])
            i += 2
        elif sys.argv[i] == '--summary-json' and i + 1 < len(sys.argv):
            exporter.export_summary_json(sys.argv[i + 1])
            i += 2
        elif sys.argv[i] == '--all' and i + 1 < len(sys.argv):
            prefix = sys.argv[i + 1]
            exporter.export_to_csv(f"{prefix}_summary.csv")
            exporter.export_detailed_csv(f"{prefix}_detailed.csv")
            exporter.export_summary_json(f"{prefix}_summary.json")
            i += 2
        else:
            print(f"Unknown option: {sys.argv[i]}")
            i += 1


if __name__ == "__main__":
    main()
