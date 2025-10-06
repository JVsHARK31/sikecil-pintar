#!/usr/bin/env python3
"""
Nutrition Report Generator
Generate detailed nutrition reports with charts and insights
"""

import json
import sys
from datetime import datetime, timedelta
from pathlib import Path
from typing import Dict, List, Any
from collections import defaultdict


class NutritionReportGenerator:
    """Generate comprehensive nutrition reports"""
    
    def __init__(self, data_file: str):
        self.data_file = data_file
        self.meals = []
        self.load_data()
    
    def load_data(self):
        """Load nutrition data"""
        try:
            with open(self.data_file, 'r', encoding='utf-8') as f:
                self.meals = json.load(f)
            print(f"✓ Loaded {len(self.meals)} meals")
        except Exception as e:
            print(f"✗ Error loading data: {e}")
            sys.exit(1)
    
    def generate_weekly_report(self) -> str:
        """Generate weekly nutrition report"""
        report_lines = []
        
        # Header
        report_lines.append("=" * 80)
        report_lines.append("WEEKLY NUTRITION REPORT".center(80))
        report_lines.append("=" * 80)
        report_lines.append(f"Generated: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        report_lines.append("")
        
        # Get last 7 days of data
        cutoff = datetime.now() - timedelta(days=7)
        recent_meals = [
            meal for meal in self.meals
            if datetime.fromisoformat(meal.get('consumedAt', '').replace('Z', '+00:00')) > cutoff
        ]
        
        if not recent_meals:
            report_lines.append("No meals found in the last 7 days")
            return '\n'.join(report_lines)
        
        # Overview
        report_lines.append("OVERVIEW")
        report_lines.append("-" * 80)
        report_lines.append(f"Total Meals: {len(recent_meals)}")
        report_lines.append(f"Average Meals per Day: {len(recent_meals) / 7:.1f}")
        report_lines.append("")
        
        # Daily breakdown
        daily_data = self._group_by_day(recent_meals)
        
        report_lines.append("DAILY BREAKDOWN")
        report_lines.append("-" * 80)
        report_lines.append(f"{'Date':<12} {'Meals':<8} {'Calories':<12} {'Protein':<10} {'Carbs':<10} {'Fat':<10}")
        report_lines.append("-" * 80)
        
        for date_str in sorted(daily_data.keys(), reverse=True):
            data = daily_data[date_str]
            report_lines.append(
                f"{date_str:<12} {data['count']:<8} "
                f"{data['calories']:<12.0f} {data['protein']:<10.1f} "
                f"{data['carbs']:<10.1f} {data['fat']:<10.1f}"
            )
        
        report_lines.append("")
        
        # Weekly totals and averages
        weekly_totals = self._calculate_totals(recent_meals)
        report_lines.append("WEEKLY TOTALS")
        report_lines.append("-" * 80)
        report_lines.append(f"Total Calories: {weekly_totals['calories']:.0f} kcal")
        report_lines.append(f"Total Protein: {weekly_totals['protein']:.1f}g")
        report_lines.append(f"Total Carbs: {weekly_totals['carbs']:.1f}g")
        report_lines.append(f"Total Fat: {weekly_totals['fat']:.1f}g")
        report_lines.append("")
        
        report_lines.append("DAILY AVERAGES")
        report_lines.append("-" * 80)
        report_lines.append(f"Average Calories: {weekly_totals['calories']/7:.0f} kcal/day")
        report_lines.append(f"Average Protein: {weekly_totals['protein']/7:.1f}g/day")
        report_lines.append(f"Average Carbs: {weekly_totals['carbs']/7:.1f}g/day")
        report_lines.append(f"Average Fat: {weekly_totals['fat']/7:.1f}g/day")
        report_lines.append("")
        
        # Macronutrient distribution
        total_macros = weekly_totals['protein'] + weekly_totals['carbs'] + weekly_totals['fat']
        if total_macros > 0:
            report_lines.append("MACRONUTRIENT DISTRIBUTION")
            report_lines.append("-" * 80)
            protein_pct = (weekly_totals['protein'] / total_macros) * 100
            carbs_pct = (weekly_totals['carbs'] / total_macros) * 100
            fat_pct = (weekly_totals['fat'] / total_macros) * 100
            
            report_lines.append(f"Protein: {protein_pct:.1f}% {self._create_bar(protein_pct)}")
            report_lines.append(f"Carbs:   {carbs_pct:.1f}% {self._create_bar(carbs_pct)}")
            report_lines.append(f"Fat:     {fat_pct:.1f}% {self._create_bar(fat_pct)}")
            report_lines.append("")
        
        # Meal type distribution
        meal_types = defaultdict(int)
        for meal in recent_meals:
            meal_types[meal.get('mealType', 'unknown')] += 1
        
        if meal_types:
            report_lines.append("MEAL TYPE DISTRIBUTION")
            report_lines.append("-" * 80)
            for meal_type in sorted(meal_types.keys()):
                count = meal_types[meal_type]
                pct = (count / len(recent_meals)) * 100
                report_lines.append(f"{meal_type.capitalize():<12}: {count:>3} meals ({pct:.1f}%)")
            report_lines.append("")
        
        # Top foods
        top_foods = self._get_top_foods(recent_meals, 10)
        if top_foods:
            report_lines.append("TOP 10 FOODS")
            report_lines.append("-" * 80)
            for i, food_data in enumerate(top_foods, 1):
                report_lines.append(
                    f"{i:2}. {food_data['food']:<30} - {food_data['count']} times "
                    f"(avg {food_data['avg_calories']:.0f} kcal)"
                )
            report_lines.append("")
        
        # Recommendations
        report_lines.append("RECOMMENDATIONS")
        report_lines.append("-" * 80)
        recommendations = self._generate_recommendations(weekly_totals, recent_meals)
        for rec in recommendations:
            report_lines.append(f"• {rec}")
        
        report_lines.append("")
        report_lines.append("=" * 80)
        
        return '\n'.join(report_lines)
    
    def _group_by_day(self, meals: List[Dict]) -> Dict[str, Dict]:
        """Group meals by day"""
        daily_data = defaultdict(lambda: {
            'count': 0,
            'calories': 0,
            'protein': 0,
            'carbs': 0,
            'fat': 0
        })
        
        for meal in meals:
            consumed_at = datetime.fromisoformat(
                meal.get('consumedAt', '').replace('Z', '+00:00')
            )
            date_str = consumed_at.strftime('%Y-%m-%d')
            
            analysis = meal.get('analysisData', {})
            totals = analysis.get('totals', {})
            macros = totals.get('macros', {})
            
            daily_data[date_str]['count'] += 1
            daily_data[date_str]['calories'] += totals.get('calories_kcal', 0)
            daily_data[date_str]['protein'] += macros.get('protein_g', 0)
            daily_data[date_str]['carbs'] += macros.get('carbs_g', 0)
            daily_data[date_str]['fat'] += macros.get('fat_g', 0)
        
        return dict(daily_data)
    
    def _calculate_totals(self, meals: List[Dict]) -> Dict[str, float]:
        """Calculate nutrition totals"""
        totals = {
            'calories': 0,
            'protein': 0,
            'carbs': 0,
            'fat': 0,
            'fiber': 0
        }
        
        for meal in meals:
            analysis = meal.get('analysisData', {})
            meal_totals = analysis.get('totals', {})
            macros = meal_totals.get('macros', {})
            
            totals['calories'] += meal_totals.get('calories_kcal', 0)
            totals['protein'] += macros.get('protein_g', 0)
            totals['carbs'] += macros.get('carbs_g', 0)
            totals['fat'] += macros.get('fat_g', 0)
            totals['fiber'] += macros.get('fiber_g', 0)
        
        return totals
    
    def _get_top_foods(self, meals: List[Dict], limit: int) -> List[Dict]:
        """Get most common foods"""
        food_count = defaultdict(lambda: {
            'count': 0,
            'total_calories': 0
        })
        
        for meal in meals:
            analysis = meal.get('analysisData', {})
            composition = analysis.get('composition', [])
            
            for item in composition:
                label = item.get('label', 'unknown')
                food_count[label]['count'] += 1
                nutrition = item.get('nutrition', {})
                food_count[label]['total_calories'] += nutrition.get('calories_kcal', 0)
        
        sorted_foods = sorted(
            food_count.items(),
            key=lambda x: x[1]['count'],
            reverse=True
        )
        
        return [
            {
                'food': food,
                'count': data['count'],
                'avg_calories': data['total_calories'] / data['count'] if data['count'] > 0 else 0
            }
            for food, data in sorted_foods[:limit]
        ]
    
    def _create_bar(self, percentage: float, width: int = 40) -> str:
        """Create ASCII progress bar"""
        filled = int((percentage / 100) * width)
        return '█' * filled + '░' * (width - filled)
    
    def _generate_recommendations(self, totals: Dict, meals: List[Dict]) -> List[str]:
        """Generate personalized recommendations"""
        recommendations = []
        
        avg_calories = totals['calories'] / 7
        avg_protein = totals['protein'] / 7
        
        # Calorie recommendations
        if avg_calories < 1500:
            recommendations.append("Your average calorie intake is quite low. Consider increasing portion sizes.")
        elif avg_calories > 2500:
            recommendations.append("Your calorie intake is high. Consider reducing portion sizes if weight management is a goal.")
        
        # Protein recommendations
        if avg_protein < 50:
            recommendations.append("Consider increasing protein intake. Aim for lean meats, fish, eggs, or plant-based sources.")
        elif avg_protein > 150:
            recommendations.append("Protein intake is very high. Ensure you're balancing with other nutrients.")
        
        # Meal frequency
        avg_meals_per_day = len(meals) / 7
        if avg_meals_per_day < 2:
            recommendations.append("Try to have at least 3 balanced meals per day for better nutrition.")
        
        # Macronutrient balance
        total_macros = totals['protein'] + totals['carbs'] + totals['fat']
        if total_macros > 0:
            protein_pct = (totals['protein'] / total_macros) * 100
            carbs_pct = (totals['carbs'] / total_macros) * 100
            
            if protein_pct < 15:
                recommendations.append("Consider increasing protein-rich foods in your diet.")
            if carbs_pct > 60:
                recommendations.append("Your carbohydrate intake is high. Consider balancing with more protein and healthy fats.")
        
        if not recommendations:
            recommendations.append("Your nutrition looks balanced! Keep up the good work.")
        
        return recommendations
    
    def save_report(self, report: str, output_file: str):
        """Save report to file"""
        try:
            with open(output_file, 'w', encoding='utf-8') as f:
                f.write(report)
            print(f"✓ Report saved to {output_file}")
        except Exception as e:
            print(f"✗ Error saving report: {e}")


def main():
    """Main function"""
    if len(sys.argv) < 2:
        print("Usage: python nutrition_report.py <input_json> [output_file]")
        print("\nExample:")
        print("  python nutrition_report.py meals.json")
        print("  python nutrition_report.py meals.json weekly_report.txt")
        sys.exit(1)
    
    input_file = sys.argv[1]
    output_file = sys.argv[2] if len(sys.argv) > 2 else None
    
    if not Path(input_file).exists():
        print(f"✗ File not found: {input_file}")
        sys.exit(1)
    
    generator = NutritionReportGenerator(input_file)
    report = generator.generate_weekly_report()
    
    if output_file:
        generator.save_report(report, output_file)
    else:
        print(report)


if __name__ == "__main__":
    main()
