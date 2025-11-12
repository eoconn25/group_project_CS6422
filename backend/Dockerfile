from python:3.10

workdir /app

RUN apt-get update && apt-get install -y \
    libgl1 \
    libglib2.0-0 \
    && rm -rf /var/lib/apt/lists/*


copy requirements.txt ./
run pip install -r requirements.txt

copy . .

expose 5001

cmd ["python", "app/run.py"]
