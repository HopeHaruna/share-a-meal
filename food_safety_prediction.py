"""Creating a function to wrap the prediction model inside of it
"""
#import libraries
import joblib
import pandas as pd

model = joblib.load(r'C:\Users\USER\Desktop\WTF_Python\Share_a_meal_app_capstone_project\food_status_model.pkl')

"""define a prediction function
"""
def food_safety_model(hours_since_prepared, storage_type):
    """_Error Handling_: Summary
    Args:
        hours_since_prepared (_type_float): numerical column(hours)
        storage_type (_type_str): categorical column('Refrigerated', 'Room Temperature')

    Returns:
        _str_: _predicted outcome_
    """

    try:
        # Create DataFrame
        food_df = pd.DataFrame({
            "hours_since_prepared": [float(hours_since_prepared)],
            "storage_type": [str(storage_type)]
        })
        prediction = model.predict(food_df)[0]
        return str(prediction)
    except (ValueError, TypeError) as e:
        return {"error": str(e)}