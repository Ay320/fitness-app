from datetime import date, timedelta
from app.database import Database
from freezegun import freeze_time

def update_streak(db: Database, user_id: int) -> int:
    """
    Update the user's streak based on workout logs.
    Returns the current streak value.
    """
    # Get today's date 
    today = date.today()
    yesterday = today - timedelta(days=1)

    # Convert dates to strings for SQL queries
    today_str = today.strftime('%Y-%m-%d')
    yesterday_str = yesterday.strftime('%Y-%m-%d')

    # Get current streak and last update
    streak_data = db.get_user_streak(user_id)
    current_streak = streak_data["current_streak"]
    last_update = streak_data["last_streak_update"]

    # Check if the user logged a workout today
    db.cursor.execute(
        "SELECT COUNT(*) AS count FROM Workout_Logs WHERE user_id = %s AND DATE(date_logged) = %s",
        (user_id, today_str)
    )
    today_workout_count = db.cursor.fetchone()["count"]

    # If no update has happened yet, initialize the streak
    if last_update is None:
        current_streak = 1 if today_workout_count > 0 else 0
        db.update_user_streak(user_id, current_streak, today)
        return current_streak

    # Convert last_update to a FakeDate for comparison 
    # This ensures consistent comparison with today and yesterday
    with freeze_time(last_update):
        last_update_faked = date.today()

    # If the last update was today, no further action needed
    if last_update_faked == today:
        return current_streak

    # Check if the user missed a day
    if last_update_faked < yesterday:
        # Missed a day or more, reset streak
        current_streak = 1 if today_workout_count > 0 else 0
    elif last_update_faked == yesterday:
        # Last update was yesterday
        if today_workout_count > 0:
            current_streak += 1
        else:
            current_streak = 0
    else:
        # Shouldn't happen (future date), but reset to be safe
        current_streak = 1 if today_workout_count > 0 else 0

    # Update the streak and last update date
    db.update_user_streak(user_id, current_streak, today)
    return current_streak