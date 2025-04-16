FROM python:3.10-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends ffmpeg libsndfile1

# Install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy your application code
COPY . .

# Expose the port your Flask app listens on
EXPOSE 8080

# Set the entry point for your application
CMD ["python", "app.py"]