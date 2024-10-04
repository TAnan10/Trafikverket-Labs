import pandas as pd
from datetime import datetime
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LinearRegression
from sklearn.metrics import mean_squared_error

# Load the data
data = pd.read_csv('C:/Users/123/Desktop/Python projekt/AI projekt/traffic_data.csv')

# Convert MeasurementTime to datetime
data['MeasurementTime'] = pd.to_datetime(data['MeasurementTime'])

# Extract features from MeasurementTime
data['Hour'] = data['MeasurementTime'].dt.hour
data['DayOfWeek'] = data['MeasurementTime'].dt.dayofweek
data['Day'] = data['MeasurementTime'].dt.day
data['Month'] = data['MeasurementTime'].dt.month
data['Year'] = data['MeasurementTime'].dt.year

# Drop the original MeasurementTime column
data = data.drop(columns=['MeasurementTime'])

# Define features and target
X = data[['Hour', 'DayOfWeek', 'Day', 'Month', 'Year']]
y = data['VehicleFlowRate']

# Split the data into training and testing sets
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# Create and train the model
model = LinearRegression()
model.fit(X_train, y_train)

# Make predictions
y_pred = model.predict(X_test)

# Evaluate the model
mse = mean_squared_error(y_test, y_pred)
print(f'Mean Squared Error: {mse}')

# Example of making a prediction
new_data = pd.DataFrame({
    'Hour': [15],
    'DayOfWeek': [2],
    'Day': [12],
    'Month': [6],
    'Year': [2024]
})

predicted_flow_rate = model.predict(new_data)
print(f'Predicted Vehicle Flow Rate: {predicted_flow_rate[0]}')  