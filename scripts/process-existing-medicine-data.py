#!/usr/bin/env python3
"""
Process existing medicine JSON file from D:\Anand Data and Software
and integrate it into the application
"""

import json
import os
import shutil

print("=" * 60)
print("Process Existing Medicine Database")
print("=" * 60)
print()

# Source path where you downloaded the file
source_path = r"D:\Anand Data and Software"

print(f"📂 Looking for JSON files in: {source_path}")
print()

# Find JSON files in the source directory
json_files = []
if os.path.exists(source_path):
    for file in os.listdir(source_path):
        if file.endswith('.json'):
            json_files.append(os.path.join(source_path, file))
            print(f"  ✅ Found: {file}")
else:
    print(f"❌ Directory not found: {source_path}")
    print()
    print("Please enter the correct path:")
    source_path = input("Path: ").strip().strip('"')
    
    if os.path.exists(source_path):
        for file in os.listdir(source_path):
            if file.endswith('.json'):
                json_files.append(os.path.join(source_path, file))
                print(f"  ✅ Found: {file}")

if not json_files:
    print()
    print("❌ No JSON files found!")
    print()
    print("Please make sure the JSON file is in the specified directory.")
    input("Press Enter to exit...")
    exit(1)

print()
print(f"📊 Found {len(json_files)} JSON file(s)")
print()

# Process each JSON file
for json_file in json_files:
    print(f"🔄 Processing: {os.path.basename(json_file)}")
    
    try:
        # Read the JSON file
        with open(json_file, 'r', encoding='utf-8') as f:
            data = json.load(f)
        
        print(f"  ✅ Loaded successfully")
        
        # Check if it's a list or dict
        if isinstance(data, list):
            print(f"  📊 Type: List with {len(data)} items")
            
            # Show sample data
            if len(data) > 0:
                print(f"  👀 Sample item:")
                sample = data[0]
                if isinstance(sample, dict):
                    for key in list(sample.keys())[:5]:
                        print(f"      - {key}: {sample[key]}")
                else:
                    print(f"      {sample}")
        elif isinstance(data, dict):
            print(f"  📊 Type: Dictionary with {len(data)} keys")
            print(f"  🔑 Keys: {list(data.keys())[:10]}")
        
        print()
        
        # Extract medicine names
        medicine_names = []
        
        if isinstance(data, list):
            for item in data:
                if isinstance(item, str):
                    medicine_names.append(item)
                elif isinstance(item, dict):
                    # Try to find name field
                    for key in ['name', 'medicine_name', 'drug_name', 'product_name', 'brand_name', 'Name', 'Medicine Name']:
                        if key in item and item[key]:
                            medicine_names.append(str(item[key]))
                            break
        elif isinstance(data, dict):
            # If it's a dict, try to extract values
            for key, value in data.items():
                if isinstance(value, str):
                    medicine_names.append(value)
                elif isinstance(value, dict) and 'name' in value:
                    medicine_names.append(value['name'])
        
        # Remove duplicates and sort
        medicine_names = sorted(list(set(medicine_names)))
        
        print(f"  ✅ Extracted {len(medicine_names)} unique medicine names")
        print()
        
        # Save to project directory
        output_dir = os.path.join(os.path.dirname(__file__), '..', 'client', 'src', 'data')
        os.makedirs(output_dir, exist_ok=True)
        
        # Save full data
        full_output = os.path.join(output_dir, 'indiadrugbank.json')
        with open(full_output, 'w', encoding='utf-8') as f:
            json.dump(data, f, indent=2, ensure_ascii=False)
        print(f"  💾 Saved full data to: {full_output}")
        
        # Save medicine names
        names_output = os.path.join(output_dir, 'indiadrugbank-names.json')
        with open(names_output, 'w', encoding='utf-8') as f:
            json.dump(medicine_names, f, indent=2, ensure_ascii=False)
        print(f"  💾 Saved medicine names to: {names_output}")
        
        print()
        print("  📈 Statistics:")
        print(f"    - Total records: {len(data) if isinstance(data, list) else len(data)}")
        print(f"    - Unique medicine names: {len(medicine_names)}")
        
        if len(medicine_names) > 0:
            print()
            print("  📝 Sample medicine names (first 10):")
            for i, name in enumerate(medicine_names[:10], 1):
                print(f"    {i}. {name}")
        
        print()
        
    except Exception as e:
        print(f"  ❌ Error processing file: {e}")
        print()
        continue

print("=" * 60)
print("✅ Processing Complete!")
print("=" * 60)
print()
print("📁 Files created in: client/src/data/")
print("  - indiadrugbank.json (full dataset)")
print("  - indiadrugbank-names.json (medicine names)")
print()
print("🎉 Medicine database is now integrated!")
print()
print("Next steps:")
print("  1. Restart your application: npm start")
print("  2. Go to Doctor Dashboard → Create Prescription")
print("  3. Test the medicine search - you should see many more medicines!")
print()
input("Press Enter to exit...")
