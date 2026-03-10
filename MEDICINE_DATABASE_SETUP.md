# Medicine Database Setup Guide

## Overview
This guide helps you integrate the All India Drug Bank Database from Kaggle into your prescription system.

## Prerequisites

1. **Python 3.7+** installed
2. **Kaggle Account** (free)
3. **Kaggle API credentials**

## Step 1: Setup Kaggle API

### Get Kaggle API Credentials:

1. Go to https://www.kaggle.com/
2. Sign in or create an account
3. Click on your profile picture → Account
4. Scroll to "API" section
5. Click "Create New API Token"
6. This downloads `kaggle.json` file

### Install Kaggle API credentials:

**Windows:**
```bash
# Create .kaggle folder in your user directory
mkdir %USERPROFILE%\.kaggle

# Copy kaggle.json to .kaggle folder
copy kaggle.json %USERPROFILE%\.kaggle\

# Or manually place kaggle.json in: C:\Users\YourUsername\.kaggle\
```

**Linux/Mac:**
```bash
mkdir -p ~/.kaggle
cp kaggle.json ~/.kaggle/
chmod 600 ~/.kaggle/kaggle.json
```

## Step 2: Install Required Packages

```bash
# Navigate to scripts directory
cd scripts

# Install required Python packages
pip install -r requirements-medicine.txt

# Or install individually
pip install kagglehub pandas
```

## Step 3: Download and Process Dataset

```bash
# Run the download script
python download-medicine-dataset.py
```

This script will:
- ✅ Download the All India Drug Bank Database from Kaggle
- ✅ Process the CSV data
- ✅ Generate JSON files in `client/src/data/`
- ✅ Create a simplified medicine names list
- ✅ Display statistics about the dataset

## Step 4: Update Medicine Database

After running the script, you'll have two new files:

1. **`client/src/data/indiadrugbank.json`** - Full dataset with all details
2. **`client/src/data/indiadrugbank-names.json`** - Simplified list of medicine names

The application will automatically use these files for the medicine dropdown.

## Step 5: Verify Integration

1. Start your application:
```bash
npm start
```

2. Navigate to Doctor Dashboard → Create Prescription
3. Try searching for medicines in the dropdown
4. You should now see thousands of Indian medicines!

## Dataset Information

**Source:** Kaggle - All India Drug Bank Database
**Link:** https://www.kaggle.com/datasets/ankushpoddar/all-india-drug-bank-database
**Contains:** Comprehensive list of medicines available in India including:
- Generic names
- Brand names
- Manufacturers
- Compositions
- Types (Tablet, Capsule, Syrup, Injection, etc.)
- Strengths/Dosages

## Troubleshooting

### Issue: "kagglehub not found"
**Solution:** Install kagglehub
```bash
pip install kagglehub
```

### Issue: "Kaggle credentials not found"
**Solution:** Make sure `kaggle.json` is in the correct location:
- Windows: `C:\Users\YourUsername\.kaggle\kaggle.json`
- Linux/Mac: `~/.kaggle/kaggle.json`

### Issue: "Permission denied"
**Solution (Linux/Mac):**
```bash
chmod 600 ~/.kaggle/kaggle.json
```

### Issue: "Dataset not downloading"
**Solution:** 
1. Check your internet connection
2. Verify Kaggle credentials are correct
3. Try downloading manually from Kaggle website

## Manual Alternative

If the script doesn't work, you can manually download:

1. Go to: https://www.kaggle.com/datasets/ankushpoddar/all-india-drug-bank-database
2. Click "Download" button
3. Extract the ZIP file
4. Place CSV files in `scripts/` folder
5. Run the processing part of the script

## File Structure After Setup

```
project/
├── client/
│   └── src/
│       └── data/
│           ├── medicineDatabase.js (old - can be removed)
│           ├── indiadrugbank.json (new - full dataset)
│           └── indiadrugbank-names.json (new - names only)
├── scripts/
│   ├── download-medicine-dataset.py
│   └── requirements-medicine.txt
└── MEDICINE_DATABASE_SETUP.md (this file)
```

## Next Steps

After successful setup:

1. ✅ Update `MedicineDropdown.js` to use new dataset
2. ✅ Add filters by medicine type (Tablet, Syrup, etc.)
3. ✅ Add manufacturer information
4. ✅ Add composition/generic name display
5. ✅ Implement advanced search features

## Support

If you encounter any issues:
1. Check the console output for error messages
2. Verify all prerequisites are installed
3. Ensure Kaggle credentials are properly configured
4. Check file permissions

## Benefits of This Dataset

✅ **Comprehensive:** Thousands of medicines from Indian market
✅ **Up-to-date:** Regularly updated dataset
✅ **Detailed:** Includes brand names, generic names, manufacturers
✅ **Categorized:** Organized by type and category
✅ **Searchable:** Easy to search and filter
✅ **Free:** No cost to use

Enjoy your comprehensive medicine database! 🎉
