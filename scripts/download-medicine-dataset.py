#!/usr/bin/env python3
"""
Download and process All India Drug Bank Database from Kaggle
This script downloads the dataset and converts it to a JSON format for use in the application
"""

import kagglehub
import pandas as pd
import json
import os

print("=" * 60)
print("All India Drug Bank Database - Download & Processing")
print("=" * 60)

# Download latest version
print("\n📥 Downloading dataset from Kaggle...")
path = kagglehub.dataset_download("ankushpoddar/all-india-drug-bank-database")
print(f"✅ Dataset downloaded to: {path}")

# List files in the dataset
print("\n📂 Files in dataset:")
for root, dirs, files in os.walk(path):
    for file in files:
        file_path = os.path.join(root, file)
        file_size = os.path.getsize(file_path) / (1024 * 1024)  # Convert to MB
        print(f"  - {file} ({file_size:.2f} MB)")

# Find CSV files
csv_files = []
for root, dirs, files in os.walk(path):
    for file in files:
        if file.endswith('.csv'):
            csv_files.append(os.path.join(root, file))

if not csv_files:
    print("\n❌ No CSV files found in dataset")
    exit(1)

print(f"\n📊 Found {len(csv_files)} CSV file(s)")

# Process the main CSV file
main_csv = csv_files[0]
print(f"\n🔄 Processing: {os.path.basename(main_csv)}")

# Read the CSV
df = pd.read_csv(main_csv)
print(f"✅ Loaded {len(df)} records")

# Display column names
print(f"\n📋 Columns in dataset:")
for col in df.columns:
    print(f"  - {col}")

# Display first few rows
print(f"\n👀 Sample data (first 3 rows):")
print(df.head(3))

# Process and clean the data
print(f"\n🧹 Cleaning and processing data...")

# Create a structured medicine list
medicines = []

for idx, row in df.iterrows():
    medicine = {}
    
    # Extract available fields (adjust based on actual column names)
    for col in df.columns:
        if pd.notna(row[col]):
            medicine[col.lower().replace(' ', '_')] = str(row[col])
    
    medicines.append(medicine)

print(f"✅ Processed {len(medicines)} medicines")

# Save to JSON
output_dir = os.path.join(os.path.dirname(__file__), '..', 'client', 'src', 'data')
os.makedirs(output_dir, exist_ok=True)

output_file = os.path.join(output_dir, 'indiadrugbank.json')
with open(output_file, 'w', encoding='utf-8') as f:
    json.dump(medicines, f, indent=2, ensure_ascii=False)

print(f"\n💾 Saved to: {output_file}")

# Create a simplified name list for quick search
medicine_names = []
for med in medicines:
    # Try to extract medicine name from various possible column names
    name = None
    for key in ['name', 'drug_name', 'medicine_name', 'product_name', 'brand_name']:
        if key in med:
            name = med[key]
            break
    
    if name:
        medicine_names.append(name)

# Remove duplicates and sort
medicine_names = sorted(list(set(medicine_names)))

# Save simplified list
simple_output = os.path.join(output_dir, 'indiadrugbank-names.json')
with open(simple_output, 'w', encoding='utf-8') as f:
    json.dump(medicine_names, f, indent=2, ensure_ascii=False)

print(f"💾 Saved simplified list to: {simple_output}")
print(f"📊 Total unique medicine names: {len(medicine_names)}")

# Generate statistics
print(f"\n📈 Dataset Statistics:")
print(f"  - Total records: {len(medicines)}")
print(f"  - Unique medicine names: {len(medicine_names)}")
print(f"  - Columns: {len(df.columns)}")

print("\n✅ Processing complete!")
print("\n📝 Next steps:")
print("  1. Check the generated JSON files in client/src/data/")
print("  2. Update medicineDatabase.js to use the new dataset")
print("  3. Test the medicine dropdown in prescription form")
