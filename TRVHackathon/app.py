# app.py
import streamlit as st
from streamlit_autorefresh import st_autorefresh
from PIL import Image
from traffic import list_images_and_scores

st.set_page_config(page_title="Traffic Cam Dashboard", layout="wide")

count = st_autorefresh(interval=30_000, key="img_refresh")

st.title("🚦 Live Traffic Scoreboard")

# Sidebar controls
threshold = st.sidebar.slider("Jam threshold", 0, 50000, 20000, step=1000)
auto_rerun = st.sidebar.checkbox("Auto-refresh every 30s", value=False)

if auto_rerun:
    st.experimental_rerun()  # rerun on every interaction

# Load data
data = list_images_and_scores()

# Display
cols = st.columns(3)
for idx, (img_path, score, ts) in enumerate(data):
    col = cols[idx % 3]
    img = Image.open(img_path)
    col.image(img, use_container_width=True)
    # color the metric widget red if over threshold
    delta = None
    col.metric(
        label=ts,
        value=f"{score}",
        delta="Jam" if score > threshold else "OK"
    )
