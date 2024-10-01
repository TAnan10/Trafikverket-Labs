import pandas as pd
from datetime import datetime
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LinearRegression
from sklearn.metrics import mean_squared_error
import matplotlib.pyplot as plt
import tkinter as tk
from tkinter import ttk, messagebox

# Load and preprocess the data
def load_and_preprocess_data(filepath):
    data = pd.read_csv(filepath)
    data['MeasurementTime'] = pd.to_datetime(data['MeasurementTime'])
    data['Hour'] = data['MeasurementTime'].dt.hour
    data['Day'] = data['MeasurementTime'].dt.day
    data['Month'] = data['MeasurementTime'].dt.month
    data['Year'] = data['MeasurementTime'].dt.year
    data = data.drop(columns=['MeasurementTime'])
    return data

# Train the model
def train_model(data):
    X = data[['Hour', 'Day', 'Month', 'Year']]
    y = data['VehicleFlowRate']
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    model = LinearRegression()
    model.fit(X_train, y_train)
    y_pred = model.predict(X_test)
    mse = mean_squared_error(y_test, y_pred)
    return model, mse

# Predict using the trained model
def predict_traffic(model, hour, day, month, year):
    new_data = pd.DataFrame({
        'Hour': [hour],
        'Day': [day],
        'Month': [month],
        'Year': [year]
    })
    predicted_flow_rate = model.predict(new_data)
    return predicted_flow_rate[0]

# Visualize the predictions
def visualize_predictions(model, data):
    X = data[['Hour', 'Day', 'Month', 'Year']]
    y = data['VehicleFlowRate']
    y_pred = model.predict(X)
    plt.scatter(data['Hour'], y, color='blue', label='Actual')
    plt.scatter(data['Hour'], y_pred, color='red', label='Predicted')
    plt.xlabel('Hour of the Day')
    plt.ylabel('Vehicle Flow Rate')
    plt.title('Actual vs Predicted Traffic Flow Rates')
    plt.legend()
    plt.show()

# Load data and train model
data = load_and_preprocess_data('C:/Users/123/Desktop/Python projekt/AI projekt/traffic_data.csv')
model, mse = train_model(data)

# Create the UI
root = tk.Tk()
root.title("Traffic Flow Predictor")

# Define UI elements
ttk.Label(root, text="Hour:").grid(column=0, row=0, padx=10, pady=10)
hour_entry = ttk.Entry(root)
hour_entry.grid(column=1, row=0, padx=10, pady=10)

ttk.Label(root, text="Day:").grid(column=0, row=1, padx=10, pady=10)
day_entry = ttk.Entry(root)
day_entry.grid(column=1, row=1, padx=10, pady=10)

ttk.Label(root, text="Month:").grid(column=0, row=2, padx=10, pady=10)
month_entry = ttk.Entry(root)
month_entry.grid(column=1, row=2, padx=10, pady=10)

ttk.Label(root, text="Year:").grid(column=0, row=3, padx=10, pady=10)
year_entry = ttk.Entry(root)
year_entry.grid(column=1, row=3, padx=10, pady=10)

def on_predict():
    try:
        hour = int(hour_entry.get())
        day = int(day_entry.get())
        month = int(month_entry.get())
        year = int(year_entry.get())
        prediction = predict_traffic(model, hour, day, month, year)
        messagebox.showinfo("Prediction", f"Predicted Vehicle Flow Rate: {prediction:.2f}")
    except ValueError:
        messagebox.showerror("Invalid Input", "Please enter valid numeric values.")

predict_button = ttk.Button(root, text="Predict", command=on_predict)
predict_button.grid(column=0, row=4, columnspan=2, padx=10, pady=10)

def on_visualize():
    visualize_predictions(model, data)

visualize_button = ttk.Button(root, text="Visualize Predictions", command=on_visualize)
visualize_button.grid(column=0, row=5, columnspan=2, padx=10, pady=10)

# Start the UI event loop
root.mainloop()