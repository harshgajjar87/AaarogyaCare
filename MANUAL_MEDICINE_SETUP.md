# Manual Medicine Database Setup

Since you already have the JSON file downloaded in `D:\Anand Data and Software`, here are the steps to integrate it:

## Option 1: Automated (Recommended)

### Run the processing script:

```bash
cd scripts
process-existing-data.bat
```

This will:
- Find your JSON file in `D:\Anand Data and Software`
- Process and extract medicine names
- Copy files to the correct location
- Integrate with your application

## Option 2: Manual Copy

If the script doesn't work, follow these manual steps:

### Step 1: Locate Your JSON File

Go to: `D:\Anand Data and Software`

Find the JSON file (it might be named something like):
- `medicines.json`
- `drugbank.json`
- `india_medicines.json`
- Or similar

### Step 2: Copy to Project

Copy the JSON file to your project:

**From:** `D:\Anand Data and Software\[your-file].json`

**To:** `[your-project]\client\src\data\indiadrugbank.json`

Example:
```
Copy from: D:\Anand Data and Software\medicines.json
Copy to:   D:\your-project\client\src\data\indiadrugbank.json
```

### Step 3: Create Names File

If your JSON file is a list of medicine objects, you need to extract just the names.

**Option A - Use the extraction script:**

1. Place your JSON file in the project's `client/src/data/` folder
2. Run this command:

```bash
cd scripts
node extract-medicine-names.js
```

**Option B - Manual extraction:**

If your JSON looks like this:
```json
[
  {"name": "Paracetamol 500mg", "type": "Tablet"},
  {"name": "Ibuprofen 400mg", "type": "Tablet"}
]
```

Create a new file `indiadrugbank-names.json` with just the names:
```json
[
  "Paracetamol 500mg",
  "Ibuprofen 400mg"
]
```

### Step 4: Verify Files

Make sure you have these files in `client/src/data/`:
- ✅ `indiadrugbank.json` (full data)
- ✅ `indiadrugbank-names.json` (names only)

### Step 5: Restart Application

```bash
npm start
```

### Step 6: Test

1. Go to Doctor Dashboard
2. Click on an appointment
3. Click "Create Prescription"
4. Try searching for medicines in the dropdown
5. You should see many more options now!

## Option 3: Direct Integration

If you want to use your JSON file directly without processing:

### Step 1: Check JSON Format

Open your JSON file and check the format:

**Format 1 - Simple list:**
```json
[
  "Paracetamol 500mg Tablet",
  "Ibuprofen 400mg Tablet",
  "Amoxicillin 250mg Capsule"
]
```

**Format 2 - Object list:**
```json
[
  {
    "name": "Paracetamol 500mg Tablet",
    "type": "Tablet",
    "manufacturer": "XYZ Pharma"
  }
]
```

### Step 2: Update Medicine Database

Edit `client/src/data/medicineDatabase.js`:

**For Format 1 (simple list):**
```javascript
// At the top of the file
import indiaDrugBank from './indiadrugbank.json';

// Replace the export
export const getAllMedicines = () => indiaDrugBank;
```

**For Format 2 (object list):**
```javascript
// At the top of the file
import indiaDrugBankData from './indiadrugbank.json';

// Extract names
const indiaDrugBank = indiaDrugBankData.map(item => item.name);

// Replace the export
export const getAllMedicines = () => indiaDrugBank;
```

### Step 3: Restart and Test

```bash
npm start
```

## Troubleshooting

### Issue: "Cannot find module './indiadrugbank.json'"

**Solution:** Make sure the file is in the correct location:
```
client/src/data/indiadrugbank.json
```

### Issue: "JSON parse error"

**Solution:** 
1. Open the JSON file in a text editor
2. Validate it at https://jsonlint.com/
3. Fix any syntax errors

### Issue: "No medicines showing"

**Solution:**
1. Check browser console (F12) for errors
2. Verify JSON file format
3. Make sure file is properly imported
4. Restart the application

### Issue: "File path not found"

**Solution:**
1. Verify the file exists in `D:\Anand Data and Software`
2. Check the exact file name
3. Update the path in the script if needed

## Quick Test

To verify the integration worked:

1. Open browser console (F12)
2. You should see: `✅ Loaded XXXX medicines from India Drug Bank`
3. If you see this, the integration is successful!

## Need Help?

If you're stuck:

1. Check what files you have in `D:\Anand Data and Software`
2. Note the exact file name
3. Check the JSON format (open in notepad)
4. Share the file structure and I can provide specific instructions

## File Locations Summary

```
Your Download:
D:\Anand Data and Software\[medicine-file].json

Project Location:
[your-project]\client\src\data\indiadrugbank.json
[your-project]\client\src\data\indiadrugbank-names.json

Script Location:
[your-project]\scripts\process-existing-data.bat
```

Good luck! 🎉
