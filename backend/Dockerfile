from python:3.13

workdir /app

copy requirements.txt ./
run pip install --no-cache-dir -r requirements.txt

copy . .

expose 5000

cmd ["python", "app/run.py"]
