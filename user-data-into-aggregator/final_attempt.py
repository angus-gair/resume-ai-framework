from gettext import install


pip install rpy2


# required libraries
from google.cloud import bigquery
from sklearn.preprocessing import LabelEncoder
from sklearn.model_selection import train_test_split
import numpy as np
import pandas as pd
from pygam import GAM, s
from scipy.optimize import minimize
import subprocess
import sys
import pandas_gbq
import db_dtypes

# required 
import pandas as pd
import numpy as np
from google.cloud import bigquery
from sklearn.preprocessing import LabelEncoder
from sklearn.ensemble import GradientBoostingRegressor
from xgboost import XGBRegressor
import matplotlib.pyplot as plt
from itertools import product
from sklearn.preprocessing import StandardScaler
import pandas_gbq
import matplotlib.pyplot as plt
from mpl_toolkits.mplot3d import Axes3D
# Generalized Additive Model (GAM) - could be a better solution, the result is a smooth function between offer value and redemption rate
from pygam import GAM, LinearGAM, s, f
from scipy.optimize import linprog
import rpy2.robjects as ro
from rpy2.robjects.packages import importr
import os

# Example if configured correctly
base = importr('base')
mgcv = importr('mgcv')

# Define the R script to fit the GAM model
ro.r('''
    gam_model <- gam(y ~ s(x), data=data_frame)
''')

# Print the current working directory
print("Current Working Directory:", os.getcwd())

# Ensure 'google-cloud-bigquery' is installed
subprocess.check_call([sys.executable, "-m", "pip", "install", "db-dtypes"])

client = bigquery.Client(project='gcp-wow-rwds-ai-pobe-dev')
sql = """
SELECT * 
FROM `gcp-wow-rwds-ai-pobe-dev.angus.bigw_xmas_modelData` 
"""
modelData = pd.DataFrame(client.query(sql).to_dataframe())

modelData.to_csv('modelData.csv', index=False)
## Re-import the CSV
modelData = pd.read_csv('modelData.csv')

## Data a Preprocessing
xvars = ['minimum_basket_spend', 'points_value','bigw_total_cav_ntile' , 'group_cav_ntile'] 
X = modelData[xvars]
y = modelData['RedemptionRate']


## Should probably centre and scale the data here too

## Encode categorical features (convert to integers)
label_encoders = {}
for column in X.select_dtypes(include=['object']).columns:
    le = LabelEncoder()
    X[column] = le.fit_transform(X[column])
    label_encoders[column] = le

## NO TEST TRAIN SPLIT
X = np.random.rand(100, 3)  # Replace with actual feature matrix
y = np.random.rand(100)     # Replace with actual target variable

# Fit the GAM model
gam = GAM(s(0) + s(1) + s(2), link='log').fit(X, y)

# Predict response rates
predicted_response_rates = gam.predict(X)

# Ensure no negative response rates
predicted_response_rates = np.clip(predicted_response_rates, 0, None)

# Optional: Print the predicted response rates for verification
print("Predicted Response Rates:")
print(predicted_response_rates)

# option 1: non log transformed model (default)
# Train XGBoost Regressor
xgb_model = XGBRegressor(objective='reg:squarederror', n_estimators=100, max_depth=5, learning_rate=0.1)
xgb_model.fit(X, y)
y_pred = xgb_model.predict(X)
print("Predicted Values (Original Scale):", y_pred[:10])


 ## Fit the GAM model
gam = GAM(s(0) + s(1) + s(2), link='log').fit(X, y)
predicted_response_rates = gam.predict(X)

# Ensure no negative response rates
predicted_response_rates = np.clip(predicted_response_rates, 0, None)


max_audience = 2000000
# Step 3: Define the cost function
def cost_per_redeemer(points_value):
    return points_value / 200

def total_cost(audience, redemption_rate, points_value):
    redeemers = audience * redemption_rate
    return np.sum(cost_per_redeemer(points_value) * redeemers)

# Step 4: Define the objective function to maximize the number of redeemers
def objective_function(params):
    points_value, minimum_basket_spend, audience = params
    
    # Predict redemption rate using the GAM model
    predicted_redemption_rate = xgb_model.predict(np.array([[minimum_basket_spend, points_value, audience]]))[0]
    
    # Enforce the relationship: penalty for violating positive correlation between points_value and RedemptionRate
    penalty_points_value = 1000 if points_value > 0 and predicted_redemption_rate < 0 else 0
    
    # Enforce the relationship: penalty for violating negative correlation between MinimumBasketSpend and RedemptionRate
    penalty_minimum_spend = 1000 if minimum_basket_spend > 0 and predicted_redemption_rate > 0 else 0
    
    # Calculate the number of redeemers
    redeemers = audience * predicted_redemption_rate
    
    # Negative to minimize
    return -np.sum(redeemers) + penalty_points_value + penalty_minimum_spend

# Step 5: Define constraint function for the total budget
def budget_constraint(params):
    points_value, minimum_basket_spend, audience = params
    
    # Predict redemption rate using GAM
    predicted_redemption_rate = xgb_model.predict(np.array([[minimum_basket_spend, points_value, audience]]))[0]
    
    # Calculate total cost
    total_cost_val = total_cost(audience, predicted_redemption_rate, points_value)
    
    # Constraint: total cost should be less than or equal to total budget
    return total_budget - total_cost_val

# Step 6: Set bounds for the variables (Points Value, Minimum Basket Spend, Audience)
bounds = [(100, 3000), (50, 500), (100000, max_audience)]

# Step 7: Optimize the function with constraints
constraints = [{'type': 'ineq', 'fun': budget_constraint}]
initial_guess = [1000, 50, 500000]  # Initial guesses for points_value, Spend, and Audience

opt_result = minimize(objective_function, initial_guess, bounds=bounds, constraints=constraints, method='SLSQP')

# Step 8: Print optimal parameters
optimal_points_value = opt_result.x[0]
optimal_minimum_basket_spend = opt_result.x[1]
optimal_audience = opt_result.x[2]

print("Optimal Points Value:", optimal_points_value)
print("Optimal Minimum Basket Spend:", optimal_minimum_basket_spend)
print("Optimal Audience:", optimal_audience)

# Step 9: Predict the total number of redeemers
predicted_redemption_rate = gam_model.predict(np.array([[optimal_minimum_basket_spend, optimal_points_value, optimal_audience]]))[0]

# Calculate the predicted number of redeemers
predicted_redeemers = optimal_audience * predicted_redemption_rate

print("Predicted Number of Redeemers:", predicted_redeemers)







'''
Blue
Active
Reactivated
1-T
Lapsing
Inactive
New to BigW
'''


# Step 5: Update budget_constraint similarly with correct newdata inputs
budget_constraint <- function(params) {
  points_value <- params[1]
  minimum_basket_spend <- params[2]
  Audience <- params[3]
  
  # Assume customer_segment = "Blue" or use any other segment based on your context
  #   customer_segment <- 'Reactivated'
  
  # Predict redemption rate using GAM
  predicted_RedemptionRate <- predict(gam_model, newdata = data.frame(
    Spend = minimum_basket_spend,
    points_value = points_value,
    bigw_total_cav_ntile = bigw_total_cav_ntile,
    group_cav_ntile = group_cav_ntile,
    customer_segment = customer_segment
  ), type = "response")
  
  # Calculate total cost
  total_cost_val <- total_cost(Audience, predicted_RedemptionRate, points_value)
  
  # Constraint: total cost should be less than or equal to total budget
  return(total_cost_val - total_budget)
}
