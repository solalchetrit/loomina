import json
import urllib.request

scenario_id = "3843467"
token = "fa2bb55a-f2a6-4d72-be95-aba576b3237e"
url = f"https://eu1.make.com/api/v2/scenarios/{scenario_id}"

with open('updated_blueprint.json', 'r') as f:
    blueprint_obj = json.load(f)

# The document says blueprint should be a string
data = {
    "blueprint": json.dumps(blueprint_obj)
}

req = urllib.request.Request(url, data=json.dumps(data).encode('utf-8'), method='PATCH')
req.add_header('Authorization', f'Token {token}')
req.add_header('Content-Type', 'application/json')

try:
    with urllib.request.urlopen(req) as response:
        print(f"Status: {response.getcode()}")
        print(response.read().decode('utf-8'))
except urllib.error.HTTPError as e:
    print(f"Error: {e.code}")
    print(e.read().decode('utf-8'))
except Exception as e:
    print(f"Exception: {str(e)}")
