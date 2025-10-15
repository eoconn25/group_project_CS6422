from app import app

client = app.test_client()

def test():
    response = client.get("/")
    print(response.status_code)
    print(response.get_json())

test()
