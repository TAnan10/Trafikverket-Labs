# Traffic Flow Prediction and Visualization

## Overview

This project involves three Python scripts designed to gather traffic data from Trafikverkets open API, train a machine learning model to predict traffic flow, and visualize the results:

1. **GatherData.py**: Collects traffic data from Trafikverkets API and saves it to a CSV file.
2. **AIModel.py**: Trains a linear regression model using the traffic data and makes predictions.
3. **Visualization.py**: Provides a graphical user interface (GUI) to interact with the trained model and visualize predictions.

## Prerequisites

Before running the scripts, ensure you have the following Python packages installed:

- `pandas`
- `requests`
- `sklearn`
- `matplotlib`
- `tkinter` (comes pre-installed with Python)

You can install the necessary packages using pip:

---------------------------------------------------
pip install pandas requests scikit-learn matplotlib
---------------------------------------------------

## Setup

1. **Gather Traffic Data**: Run `GatherData.py` to fetch traffic data and save it to a CSV file.

    --------------------
    python GatherData.py
    --------------------

    - **API Key**: The script uses an API key to access traffic data. Replace `d68896103a8141a186a79910d41ce683` with your own API key.
    - **Output File**: The data is saved to `traffic_data.csv` in the specified directory.

2. **Train the Model**: Run `AIModel.py` to train a linear regression model using the collected traffic data and evaluate its performance.

    -----------------
    python AIModel.py
    -----------------

    - **Data**: The script expects the CSV file `traffic_data.csv` to be present in the directory.
    - **Output**: The script prints the Mean Squared Error (MSE) and an example prediction for a given set of features.

3. **Visualize Predictions**: Run `Visualization.py` to interact with the trained model through a GUI and visualize the predictions.

    -----------------------
    python Visualization.py
    -----------------------

    - **GUI**: The GUI allows you to input hour, day, month, and year values to get a predicted vehicle flow rate. You can also visualize predictions compared to actual values.

## Files

1. **GatherData.py**: 
    - Fetches traffic data from Trafikverkets API.
    - Saves the data to `traffic_data.csv`.

2. **AIModel.py**:
    - Loads and preprocesses data from `traffic_data.csv`.
    - Trains a linear regression model.
    - Evaluates and prints the model’s performance.
    - Demonstrates a prediction for a given input.

3. **Visualization.py**:
    - Loads and preprocesses data from `traffic_data.csv`.
    - Trains a linear regression model.
    - Provides a GUI for predictions and visualizations.
    - Allows for visual comparison between actual and predicted vehicle flow rates.

4. **traffic_data.csv**:
    - Sample data file containing traffic flow rates and measurement times.

## Example Usage

1. **Data Gathering**: Ensure `GatherData.py` has been executed and `traffic_data.csv` is up-to-date.

2. **Model Training and Prediction**:
    -----------------
    python AIModel.py
    -----------------

    Example output:
    ------------------------------------
    Mean Squared Error: 1234.56
    Predicted Vehicle Flow Rate: 1500.00
    ------------------------------------

3. **Interactive Visualization**:
    -----------------------
    python Visualization.py
    -----------------------

    - Enter hour, day, month, and year into the GUI to receive predictions.
    - Click "Visualize Predictions" to see a plot comparing actual and predicted values.

## Troubleshooting

- **Missing Packages**: Install the required packages as mentioned in the prerequisites.
- **API Issues**: Ensure the API key is correct and the API endpoint is accessible.
- **File Paths**: Verify that the file paths used in the scripts match the actual locations on your system.