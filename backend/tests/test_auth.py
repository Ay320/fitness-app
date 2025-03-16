from unittest.mock import patch

#Test the /auth/sync-user endpoint to ensure user syncing works with both real and mock tokens.
@patch("firebase_REMOVED.auth.verify_id_token")
def test_sync_user(mock_verify_token, client, firebase_token, db):
    if firebase_token == "mock_firebase_token_123":
        mock_verify_token.return_value = {"uid": "mock_user_uid", "email": "test1@example.com"}
    else:
        mock_verify_token.return_value = {
            "uid": "une1uwhaFy6UFRk7tCGldO0xPX5U",
            "email": "test1@example.com"
        }
    headers = {"Authorization": f"Bearer {firebase_token}"}
    # Send request to sync user with backend
    response = client.post("/auth/sync-user", headers=headers)
    #print(f"Response status: {response.status_code}, Body: {response.json()}")
    assert response.status_code == 200  # validate response



#Test the /user/profile endpoint to verify user profile updates with both real and mock tokens.
"""
 This test ensures:
    - The user is successfully synced
    - The user profile can be updated
    - The updated profile is correctly stored in the database
    """
@patch("firebase_REMOVED.auth.verify_id_token")
def test_update_user_profile(mock_verify_token, client, firebase_token, db):
    if firebase_token == "mock_firebase_token_123":
        mock_verify_token.return_value = {"uid": "mock_user_uid", "email": "test1@example.com"}
    else:
        mock_verify_token.return_value = {
            "uid": "une1uwhaFy6UFRk7tCGldO0xPX5U",
            "email": "test1@example.com"
        }
    headers = {"Authorization": f"Bearer {firebase_token}"}
    sync_response = client.post("/auth/sync-user", headers=headers)
    #print(f"Sync response status: {sync_response.status_code}, Body: {sync_response.json()}")
    assert sync_response.status_code == 200

    uid = sync_response.json()["uid"]      # Extract user ID from response JSON
    #  Send request to update user profile:
    response = client.post("/user/profile", headers=headers, json={
        "username": "testUser",
        "date_of_birth": "1990-01-01",
        "gender": "Male",
        "weight_kg": 75.0,
        "height_cm": 175.0,
        "fitness_goal": "Muscle Gain",
        "experience_level": "Intermediate"
    })
    #breakpoint()  # Pause here to check the database
    assert response.status_code == 200
    assert response.json()["message"] == "Profile updated"

    # Retrieve user data from database and validate
    user = db.get_user_by_firebase_uid(uid)
    print(f"User data after update: {user}")
    assert user[1] == "testUser"
    assert str(user[4]) == "1990-01-01"