import json

with open('updated_blueprint.json', 'r') as f:
    blueprint_obj = json.load(f)

body = {
    "blueprint": json.dumps(blueprint_obj)
}

with open('body.json', 'w') as f:
    json.dump(body, f)
