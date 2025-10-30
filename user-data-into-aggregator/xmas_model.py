import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_squared_error
import matplotlib.pyplot as plt
import numpy as np
from sklearn.inspection import PartialDependenceDisplay
import shap
import db_dtypes

from pygam import GAM, s, f, te
from sklearn.model_selection import train_test_split
#from pygam.distributions import ExponentialDist
from sklearn.metrics import mean_squared_error
import matplotlib.pyplot as plt
#import db_dtypes



import google 
from google.cloud import bigquery
import pandas as pd
import numpy as np
from pygam import LinearGAM, s
import matplotlib.pyplot as plt

client = bigquery.Client(project='gcp-wow-rwds-ai-pobe-dev')

sql = """
SELECT * 
FROM `gcp-wow-rwds-ai-pobe-dev.angus.ag_bigw_xmas_model_data` 
"""


data =  pd.DataFrame(client.query_and_wait(sql).to_dataframe())

data.head()
# Column Names
column_names = data.columns.tolist()
print(column_names)















# Load your data into a DataFrame
# Replace this with your actual data
data = pd.DataFrame({
    'min_spend': np.random.uniform(10, 200, 1000),  # Example data for minimum spend
    'offer_amount': np.random.uniform(5, 100, 1000),  # Example data for offer amount
    'response_rate': np.random.uniform(0, 1, 1000)  # Example data for response rate
})

# Fit the GAM model
X = data[['min_spend', 'offer_amount']]
y = data['response_rate']

gam = LinearGAM(s(0) + s(1)).fit(X, y)

# Create a grid for plotting
min_spend_range = np.linspace(X['min_spend'].min(), X['min_spend'].max(), 100)
offer_amount_range = np.linspace(X['offer_amount'].min(), X['offer_amount'].max(), 100)

# Plot response curve for min_spend while holding offer_amount constant at its median
plt.figure(figsize=(10, 6))
for offer_value in [offer_amount_range.min(), np.median(offer_amount_range), offer_amount_range.max()]:
    partial_dependence = gam.partial_dependence(term=0, X=np.array([[value, offer_value] for value in min_spend_range]))
    plt.plot(min_spend_range, partial_dependence, label=f'Offer Amount = {offer_value:.2f}')
plt.xlabel('Minimum Spend')
plt.ylabel('Predicted Response Rate')
plt.title('Response Curve: Effect of Minimum Spend on Response Rate')
plt.legend()
plt.show()

# Plot response curve for offer_amount while holding min_spend constant at its median
plt.figure(figsize=(10, 6))
for min_spend_value in [min_spend_range.min(), np.median(min_spend_range), min_spend_range.max()]:
    partial_dependence = gam.partial_dependence(term=1, X=np.array([[min_spend_value, value] for value in offer_amount_range]))
    plt.plot(offer_amount_range, partial_dependence, label=f'Min Spend = {min_spend_value:.2f}')
plt.xlabel('Offer Amount')
plt.ylabel('Predicted Response Rate')
plt.title('Response Curve: Effect of Offer Amount on Response Rate')
plt.legend()
plt.show()












# Initialize the BigQuery client



# Load your data
# For demonstration, let's generate some synthetic data
# Replace this with your actual data loading code
np.random.seed(0)
X1 = np.random.normal(50, 15, 1000)  # Continuous variable 1 (spending hurdle)
X2 = np.random.normal(20, 5, 1000)   # Continuous variable 2 (discount level)
y = 5 * np.sin(X1 / 10) + 2 * np.log(X2) + np.random.normal(0, 0.5, 1000)  # Response variable


xvars = ['minimum_basket_spend', 'point_value']
# Assuming df is your DataFrame
X = pd.DataFrame(data[xvars])
y = pd.DataFrame(data['redemption_rate'])

# Combine the features into a DataFrame.
X1 = data['minimum_basket_spend']
X2 = data['point_value']
X3 = data['Audience']
X = pd.DataFrame({'X1': X1, 'X2': X2, 'X3': X3})

# Split data into train and test sets
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# Define the GAM model
# The 's' function specifies a smooth term for each continuous variable
# gam = LinearGAM(s(0) + s(1)).fit(X_train, y_train)

gam = GAM(distribution='gamma',link='log')

gam = GAM(s(0) + s(1) + s(2) , link='log').fit(X_train, y_train)

# Make predictions on the test set
y_pred = gam.predict(X_test)

# Evaluate the model
mse = mean_squared_error(y_test, y_pred)
print(f"Mean Squared Error on test set: {mse:.4f}")

# Generate a grid of values for X1 and X2
grid_X1 = np.linspace(X1.min(), X1.max(), 50)
grid_X2 = np.linspace(X2.min(), X2.max(), 50)
grid_X3 = np.linspace(X3.min(), X3.max(), 50)
grid_X1, grid_X2 , grid_X3 = np.meshgrid(grid_X1, grid_X2, grid_X3)

# Prepare the grid for input into the model
XX = np.vstack([grid_X1.ravel(), grid_X2.ravel(), grid_X3.ravel()]).T

# Compute the partial dependence (i.e., predictions) on the grid
Z = gam.predict(XX).reshape(grid_X1.shape)


# Plot the interaction effect
plt.contourf(grid_X1, grid_X2, grid_X3, Z, cmap='viridis')
plt.colorbar()
plt.xlabel('X1 (Spending Hurdle)')
plt.ylabel('X2 (Discount Level)')
plt.title('Interaction between X1 and X2')
plt.show()



# Plot the partial dependence plots for each feature
plt.figure(figsize=(12, 6))

# Plot for X1
plt.subplot(1, 2, 1)
XX = gam.generate_X_grid(term=0)
plt.plot(XX[:, 0], gam.partial_dependence(term=0, X=XX))
plt.plot(XX[:, 0], gam.partial_dependence(term=0, X=XX, width=.95)[1], c='r', ls='--')
plt.title('Partial Dependence of X1 (Spending Hurdle)')
plt.xlabel('X1')
plt.ylabel('Partial Dependence')

# Plot for X2
plt.subplot(1, 2, 2)
XX = gam.generate_X_grid(term=1)
plt.plot(XX[:, 1], gam.partial_dependence(term=1, X=XX))
plt.plot(XX[:, 1], gam.partial_dependence(term=1, X=XX, width=.95)[1], c='r', ls='--')
plt.title('Partial Dependence of X2 (Point Value)')
plt.xlabel('X2')
plt.ylabel('Partial Dependence')

plt.tight_layout()
plt.show()


# Plot for X3
plt.subplot(1, 2, 2)
XX = gam.generate_X_grid(term=2)
plt.plot(XX[:, 2], gam.partial_dependence(term=2, X=XX))
plt.plot(XX[:, 2], gam.partial_dependence(term=2, X=XX, width=.95)[1], c='r', ls='--')
plt.title('Partial Dependence of X3 (Audience)')
plt.xlabel('X3')
plt.ylabel('Partial Dependence')

plt.tight_layout()
plt.show()




# Plot the interaction between X1 and X2
plt.figure(figsize=(8, 6))
XX = gam.generate_X_grid(term=2)
Z = gam.partial_dependence(term=2, X=XX, meshgrid=True)[0]
plt.contourf(XX[0], XX[1], Z, cmap='viridis')
plt.colorbar()
plt.xlabel('X1 (Spending Hurdle)')
plt.ylabel('X2 (Discount Level)')
plt.title('Interaction between X1 and X2')
plt.show()




# Define the ranges for X1 and X2
X1_values = np.arange(10, 101, 10)   # X1 from 10 to 100 in increments of 10
X2_values = np.arange(500, 2001, 100)  # X2 from 500 to 2000 in increments of 100
X3_values = np.arange(50000, 14000001, 50000)  # X2 from 500 to 2000 in increments of 100

# Create all combinations of X1 and X2
X1_grid, X2_grid, X3_grid = np.meshgrid(X1_values, X2_values, X3_values)

# Flatten the grids to create a dataset with all combinations
X1_flat = X1_grid.ravel()
X2_flat = X2_grid.ravel()
X3_flat = X3_grid.ravel()

# Combine into a DataFrame
dummy_data = pd.DataFrame({'X1': X1_flat, 'X2': X2_flat, 'X3': X3_flat})

# Use the trained GAM model to predict y for these combinations
dummy_data['Pred_y'] = gam.predict(dummy_data)

# Export the dataset to a CSV file
dummy_data.to_csv('predicted_y.csv', index=False)

print("Dataset with predictions has been saved as 'predicted_y.csv'")
















# Feature importance
xgb.plot_importance(model)
plt.show()


# Assume df is your DataFrame
column_names = model_data.columns.tolist()
print(column_names)

# Let's say 'model' is your trained XGBoost model and 'X_train' is your training dataset
#feature = 'state_TAS'
#pdp_goals = pdp.pdp_isolate(model=model, dataset=X_train, model_features=X_train.columns.tolist(), feature=feature)

# plot it
##pdp.pdp_plot(pdp_goals, feature)
##plt.show()


features = 'state_TAS'
features = [0, 10, (0, 10)]
PartialDependenceDisplay.from_estimator(model, X, features)





# Create object that can calculate shap values
explainer = shap.TreeExplainer(model)

# Calculate Shap values for all of train data
shap_values = explainer.shap_values(X_train)

# Visualize the first prediction's explanation
shap.initjs()  # Initialize JavaScript visualization in the notebook
shap.force_plot(explainer.expected_value, shap_values[0,:], X_train.iloc[0,:])

shap.summary_plot(shap_values, X_train)
shap.summary_plot(shap_values, X_test)


####
# Fits the explainer
explainer = shap.Explainer(model.predict, X)
# Calculates the SHAP values - It takes some time
shap_values = explainer(X)

# shap_values = explainer.shap_values(X)
shap.plots.bar(shap_values)

shap.plots.waterfall(shap_values.values[X])



from scipy.special import softmax

def print_feature_importances_shap_values(shap_values, features):
    '''
    Prints the feature importances based on SHAP values in an ordered way
    shap_values -> The SHAP values calculated from a shap.Explainer object
    features -> The name of the features, on the order presented to the explainer
    '''
    # Calculates the feature importance (mean absolute shap value) for each feature
    importances = []
    for i in range(shap_values.values.shape[1]):
        importances.append(np.mean(np.abs(shap_values.values[:, i])))
    # Calculates the normalized version
    importances_norm = softmax(importances)
    # Organize the importances and columns in a dictionary
    feature_importances = {fea: imp for imp, fea in zip(importances, features)}
    feature_importances_norm = {fea: imp for imp, fea in zip(importances_norm, features)}
    # Sorts the dictionary
    feature_importances = {k: v for k, v in sorted(feature_importances.items(), key=lambda item: item[1], reverse = True)}
    feature_importances_norm= {k: v for k, v in sorted(feature_importances_norm.items(), key=lambda item: item[1], reverse = True)}
    # Prints the feature importances
    for k, v in feature_importances.items():
        print(f"{k} -> {v:.4f} (softmax = {feature_importances_norm[k]:.4f})")

print_feature_importances_shap_values(shap_values, column_names)


shap.summary_plot(shap_values)
# or 
shap.plots.beeswarm(shap_values)

shap.summary_plot(shap_values.values, plot_type='violin')


shap.plots.bar(shap_values[0])