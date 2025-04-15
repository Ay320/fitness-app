from app.database import Database
from typing import List, Dict, Any
from datetime import date, timedelta

# Dictionary to map leg exercises to their primary focus (since database doesn't specify)
leg_exercise_focus = {
    "Quads": ["Squats", "Front Squats", "Leg Press", "Leg Extensions"],
    "Hamstrings": ["Hamstring Curls", "Romanian Deadlifts"],
    "Glutes": ["Bulgarian Split Squats", "Lunges", "Step-Ups"],
    "Calves": ["Calf Raises"]
}

def determine_split(days_per_week: int) -> List[str]:
    """Determine the workout split based on the number of training days per week."""
    if days_per_week == 1:
        return ["Full-Body"]
    elif days_per_week == 2:
        return ["Upper Body", "Lower Body"]
    elif days_per_week == 3:
        return ["Push", "Pull", "Legs"]
    elif days_per_week == 4:
        return ["Chest + Triceps", "Back + Biceps", "Shoulders", "Legs"]
    elif days_per_week == 5:
        return ["Push", "Pull", "Legs", "Push", "Legs"]
    elif days_per_week == 6:
        return ["Push", "Pull", "Legs", "Push", "Pull", "Legs"]
    elif days_per_week == 7:
        return ["Push", "Pull", "Legs", "Push", "Pull", "Legs", "Cardio/Core"]
    else:
        raise ValueError("days_per_week must be between 1 and 7")

def define_day_structure(split: str) -> Dict[str, Any]:
    """Define the muscle groups and exercise counts for a given split day."""
    if split == "Full-Body":
        return {"muscles": ["Chest", "Back", "Legs", "Shoulders", "Arms", "Core"], "exercise_count": 1}
    elif split == "Upper Body":
        return {"muscles": ["Chest", "Back", "Shoulders", "Arms"], "exercise_count": 1}
    elif split == "Lower Body":
        return {"muscles": ["Legs", "Glutes", "Core"], "exercise_count": 1}
    elif split == "Push":
        return {"muscles": ["Chest", "Shoulders", "Triceps"], "exercise_count": {"Chest": 2, "Shoulders": 1, "Triceps": 1}}
    elif split == "Pull":
        return {"muscles": ["Back", "Biceps"], "exercise_count": {"Back": 2, "Biceps": 1}}
    elif split == "Legs":
        return {"muscles": ["Legs"], "exercise_count": {"Quads": 2, "Hamstrings": 1, "Glutes": 1}}
    elif split == "Chest + Triceps":
        return {"muscles": ["Chest", "Triceps"], "exercise_count": {"Chest": 2, "Triceps": 1}}
    elif split == "Back + Biceps":
        return {"muscles": ["Back", "Biceps"], "exercise_count": {"Back": 2, "Biceps": 1}}
    elif split == "Shoulders":
        return {"muscles": ["Shoulders"], "exercise_count": {"Shoulders": 3}}
    elif split == "Cardio/Core":
        return {"muscles": ["Cardio", "Core"], "exercise_count": {"Cardio": 2, "Core": 2}}
    else:
        raise ValueError(f"Unknown split: {split}")


def select_exercises(
    db: Database,
    muscles: List[str],
    preferences: Dict[str, List[str]],
    experience_level: str,
    goal: str,
    exercise_count: Dict[str, int] | int
) -> List[Dict[str, Any]]:
    """
    Select exercises for the given muscle groups, respecting preferences and user profile.
    Adjusts sets and reps based on experience level and goal.
    """
    exercises = []
    excluded_equipment = preferences.get("equipment", [])
    excluded_exercises = preferences.get("exercises", [])

    # Determine difficulty levels based on experience level
    difficulty_levels = ["Beginner", "Intermediate", "Advanced"]
    user_level = {"beginner": "Beginner", "intermediate": "Intermediate", "advanced": "Advanced"}.get(experience_level.lower(), "Intermediate")
    allowed_difficulties = difficulty_levels[:difficulty_levels.index(user_level) + 1]

    # Adjust volume based on goal
    goal_adjustments = {
        "strength": {"sets": 4, "reps": 6},
        "hypertrophy": {"sets": 3, "reps": 10},
        "endurance": {"sets": 3, "reps": 15},
        "general": {"sets": 3, "reps": 8}
    }
    base_sets, base_reps = goal_adjustments.get(goal.lower(), {"sets": 3, "reps": 8}).values()

    # Initialize remaining counts
    remaining_counts = {}
    if isinstance(exercise_count, int):
        for m in muscles:
            remaining_counts[m] = exercise_count
    else:
        remaining_counts = exercise_count.copy()

    selected_exercise_ids = set()

    # Process each muscle group
    for muscle in muscles:
        if muscle == "Legs" and isinstance(exercise_count, dict):
            # Special case for Legs: select based on subcategories
            for subcategory, count in exercise_count.items():
                focus_exercises = leg_exercise_focus.get(subcategory, [])
                if not focus_exercises:
                    continue

                # Generate placeholders for focus_exercises
                exercise_placeholders = ", ".join(["%s"] * len(focus_exercises))
                query = f"""
                    SELECT *
                    FROM Workout_Exercises
                    WHERE primary_muscle = 'Legs'
                    AND exercise_name IN ({exercise_placeholders})
                """
                params = list(focus_exercises)  # Flatten the list into individual parameters

                # Add difficulty condition
                if allowed_difficulties:
                    difficulty_placeholders = ", ".join(["%s"] * len(allowed_difficulties))
                    query += f" AND difficulty IN ({difficulty_placeholders})"
                    params.extend(allowed_difficulties)

                # Add excluded exercises condition
                if excluded_exercises:
                    ex_placeholders = ", ".join(["%s"] * len(excluded_exercises))
                    query += f" AND exercise_name NOT IN ({ex_placeholders})"
                    params.extend(excluded_exercises)

                # Add excluded equipment condition
                if excluded_equipment:
                    eq_placeholders = ", ".join(["%s"] * len(excluded_equipment))
                    query += f" AND (equipment IS NULL OR equipment NOT IN ({eq_placeholders}))"
                    params.extend(excluded_equipment)

                # Add selected exercise IDs condition
                if selected_exercise_ids:
                    ids_placeholders = ", ".join(["%s"] * len(selected_exercise_ids))
                    query += f" AND exercise_id NOT IN ({ids_placeholders})"
                    params.extend(list(selected_exercise_ids))
                else:
                    query += " AND 1=1"  # Safe placeholder to avoid errors

                query += " ORDER BY difficulty ASC LIMIT %s"
                params.append(count)

                # Execute the query
                db.cursor.execute(query, params)
                available_exercises = db.cursor.fetchall()
                for ex in available_exercises:
                    exercises.append({
                        "exercise_id": ex["exercise_id"],
                        "exercise_name": ex["exercise_name"],
                        "primary_muscle": ex["primary_muscle"],
                        "secondary_muscle": ex["secondary_muscle"],
                        "recommended_sets": base_sets,
                        "recommended_reps": base_reps,
                        "recommended_duration": ex["initial_recommended_time"]
                    })
                    selected_exercise_ids.add(ex["exercise_id"])
        else:
            # Regular selection for other muscles
            count = exercise_count if isinstance(exercise_count, int) else exercise_count.get(muscle, 1)
            while remaining_counts.get(muscle, 0) > 0:
                query = """
                    SELECT *
                    FROM Workout_Exercises
                    WHERE (primary_muscle = %s OR secondary_muscle = %s)
                """
                params = [muscle, muscle]

                if allowed_difficulties:
                    difficulty_placeholders = ", ".join(["%s"] * len(allowed_difficulties))
                    query += f" AND difficulty IN ({difficulty_placeholders})"
                    params.extend(allowed_difficulties)

                if excluded_exercises:
                    ex_placeholders = ", ".join(["%s"] * len(excluded_exercises))
                    query += f" AND exercise_name NOT IN ({ex_placeholders})"
                    params.extend(excluded_exercises)

                if excluded_equipment:
                    eq_placeholders = ", ".join(["%s"] * len(excluded_equipment))
                    query += f" AND (equipment IS NULL OR equipment NOT IN ({eq_placeholders}))"
                    params.extend(excluded_equipment)

                if selected_exercise_ids:
                    ids_placeholders = ", ".join(["%s"] * len(selected_exercise_ids))
                    query += f" AND exercise_id NOT IN ({ids_placeholders})"
                    params.extend(list(selected_exercise_ids))
                else:
                    query += " AND 1=1"

                query += " ORDER BY difficulty ASC LIMIT 1"

                db.cursor.execute(query, params)
                exercise = db.cursor.fetchone()

                if exercise:
                    selected_exercise_ids.add(exercise["exercise_id"])
                    exercises.append({
                        "exercise_id": exercise["exercise_id"],
                        "exercise_name": exercise["exercise_name"],
                        "primary_muscle": exercise["primary_muscle"],
                        "secondary_muscle": exercise["secondary_muscle"],
                        "recommended_sets": base_sets,
                        "recommended_reps": base_reps,
                        "recommended_duration": exercise["initial_recommended_time"]
                    })
                    if exercise["primary_muscle"] in remaining_counts:
                        remaining_counts[exercise["primary_muscle"]] -= 1
                    if exercise["secondary_muscle"] in remaining_counts and exercise["secondary_muscle"] != "N/A":
                        remaining_counts[exercise["secondary_muscle"]] -= 1
                else:
                    remaining_counts[muscle] = 0
                    break

    return exercises


def generate_workout_plan(
    db: Database,
    user_id: int,
    days_per_week: int,
    preferences: Dict[str, List[str]] | None,
    plan_name: str | None,
    description: str | None
) -> "GeneratedPlan":
    """
    Generate a static workout plan based on user inputs and store it in the database.
    """
    from app.models.plan_generator import GeneratedPlan, GeneratedPlanDay

    # Fetch user profile and workout data
    user_profile = db.get_user_by_id(user_id)
    if not user_profile:
        raise ValueError("User not found")
    
    # Calculate date range for recent logs (last 4 weeks)
    end_date = date.today()
    start_date = end_date - timedelta(weeks=4)
    
    # Fetch recent workout logs and muscle distribution
    recent_logs = db.get_recent_workout_logs(user_id, weeks=4)
    muscle_distribution = db.get_muscle_group_distribution(user_id, start_date, end_date)
    frequency = db.get_workout_frequency(user_id, start_date, end_date, "weekly")

    # Adjust volume if frequency is lower than requested days
    avg_weekly_workouts = sum(f["count"] for f in frequency) / len(frequency) if frequency else 0
    volume_factor = min(1.0, avg_weekly_workouts / days_per_week) if avg_weekly_workouts else 1.0

    # Determine split
    split = determine_split(days_per_week)

    # Create the plan
    plan_id = db.create_plan(
        user_id=user_id,
        name=plan_name or f"AI-Generated {days_per_week}-Day Plan",
        description=description or f"AI-generated plan for {user_profile.get('fitness_goal', 'general fitness')}",
        days_per_week=days_per_week,
        preferred_days=None
    )

    days = []
    preferences = preferences or {}
    for day_number, split_day in enumerate(split, start=1):
        day_structure = define_day_structure(split_day)
        exercises = select_exercises(
            db,
            day_structure["muscles"],
            preferences,
            user_profile.get("experience_level", "intermediate"),
            user_profile.get("fitness_goal", "general"),
            day_structure["exercise_count"]
        )

        # Adjust volume based on frequency
        for ex in exercises:
            ex["recommended_sets"] = int(ex["recommended_sets"] * volume_factor)

        # Store in database
        plan_day_id = db.create_plan_day(plan_id, day_number, f"{split_day} Day")
        for exercise in exercises:
            db.add_exercise_to_day(plan_day_id, exercise["exercise_id"])

        days.append(GeneratedPlanDay(
            day_number=day_number,
            description=f"{split_day} Day",
            exercises=exercises
        ))

    return GeneratedPlan(
        plan_id=plan_id,
        name=plan_name or f"AI-Generated {days_per_week}-Day Plan",
        description=description or f"AI-generated plan for {user_profile.get('fitness_goal', 'general fitness')}",
        days_per_week=days_per_week,
        preferred_days=None,
        is_active=False,
        days=days
    )