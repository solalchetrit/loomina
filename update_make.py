import json

def update_blueprint(file_path):
    with open(file_path, 'r') as f:
        data = json.load(f)
    
    blueprint = data['response']['blueprint']
    flow = blueprint['flow']
    
    modified = False
    
    def process_modules(modules):
        nonlocal modified
        for module in modules:
            if module.get('id') == 36:
                print(f"Found module 36. Current table: {module['mapper'].get('table')}")
                module['mapper']['table'] = 'Chapters'
                
                # Check mapping for chapter_number and status
                if 'chapter_number' not in module['mapper']:
                     module['mapper']['chapter_number'] = '{{35.chapter_count + 1}}'
                if 'status' not in module['mapper']:
                     module['mapper']['status'] = 'draft'
                
                # Update metadata if it exists to match 'Chapters'
                if 'metadata' in module and 'expect' in module['metadata']:
                    for expect_item in module['metadata']['expect']:
                        if expect_item.get('name') == 'table' and expect_item.get('type') == 'select':
                            # This is usually where the table name is stored in UI metadata
                            pass
                    
                    if 'restore' in module['metadata'] and 'expect' in module['metadata']['restore']:
                        if 'table' in module['metadata']['restore']['expect']:
                            module['metadata']['restore']['expect']['table']['label'] = 'Chapters'
                
                modified = True
                print("Updated module 36 to 'Chapters'")
            
            # Recurse into routers/iterators if needed
            if 'routes' in module:
                for route in module['routes']:
                    process_modules(route['flow'])
    
    process_modules(flow)
    
    if modified:
        with open('updated_blueprint.json', 'w') as f:
            # Re-wrap in the structure expected by Make API update
            # Actually, to update via API, we often just send the 'blueprint' object
            json.dump(blueprint, f)
        return True
    return False

if update_blueprint('latest_main_blueprint.json'):
    print("Successfully created updated_blueprint.json")
else:
    print("Could not find module 36 or no changes needed")
