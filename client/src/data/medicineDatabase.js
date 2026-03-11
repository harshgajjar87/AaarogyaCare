export const medicineDatabase = [
  // Pain Relief & Anti-inflammatory
  "Paracetamol", "Ibuprofen", "Aspirin", "Diclofenac", "Naproxen", "Celecoxib", "Tramadol", "Ketorolac",
  "Aceclofenac", "Nimesulide", "Piroxicam", "Indomethacin", "Meloxicam", "Etoricoxib",
  
  // Antibiotics
  "Amoxicillin", "Azithromycin", "Ciprofloxacin", "Doxycycline", "Cephalexin", "Clindamycin", 
  "Erythromycin", "Levofloxacin", "Metronidazole", "Trimethoprim", "Clarithromycin", "Ofloxacin",
  "Cefixime", "Ampicillin", "Penicillin", "Tetracycline", "Norfloxacin", "Roxithromycin",
  
  // Antacids & Digestive
  "Omeprazole", "Pantoprazole", "Ranitidine", "Famotidine", "Lansoprazole", "Esomeprazole",
  "Domperidone", "Ondansetron", "Simethicone", "Loperamide", "Bismuth Subsalicylate",
  "Rabeprazole", "Sucralfate", "Misoprostol", "Metoclopramide",
  
  // Cough & Cold
  "Dextromethorphan", "Guaifenesin", "Phenylephrine", "Pseudoephedrine", "Chlorpheniramine",
  "Diphenhydramine", "Loratadine", "Cetirizine", "Fexofenadine", "Montelukast", "Salbutamol",
  "Terbutaline", "Bromhexine", "Ambroxol", "Acetylcysteine",
  
  // Cardiovascular
  "Amlodipine", "Atenolol", "Metoprolol", "Lisinopril", "Losartan", "Valsartan", "Enalapril",
  "Nifedipine", "Diltiazem", "Verapamil", "Propranolol", "Carvedilol", "Ramipril", "Telmisartan",
  "Hydrochlorothiazide", "Furosemide", "Spironolactone", "Digoxin", "Warfarin", "Clopidogrel",
  
  // Diabetes
  "Metformin", "Glimepiride", "Gliclazide", "Glibenclamide", "Pioglitazone", "Sitagliptin",
  "Vildagliptin", "Saxagliptin", "Insulin", "Repaglinide", "Acarbose", "Canagliflozin",
  
  // Vitamins & Supplements
  "Vitamin D3", "Vitamin B12", "Vitamin C", "Folic Acid", "Iron", "Calcium", "Magnesium",
  "Zinc", "Multivitamin", "Omega-3", "Biotin", "Vitamin E", "Vitamin A", "Thiamine",
  
  // Antifungal & Antiviral
  "Fluconazole", "Itraconazole", "Ketoconazole", "Terbinafine", "Clotrimazole", "Miconazole",
  "Acyclovir", "Valacyclovir", "Oseltamivir", "Griseofulvin",
  
  // Mental Health
  "Sertraline", "Fluoxetine", "Escitalopram", "Paroxetine", "Venlafaxine", "Duloxetine",
  "Alprazolam", "Lorazepam", "Clonazepam", "Diazepam", "Zolpidem", "Quetiapine", "Risperidone",
  
  // Hormonal
  "Levothyroxine", "Methimazole", "Prednisolone", "Hydrocortisone", "Dexamethasone",
  "Estradiol", "Progesterone", "Testosterone", "Finasteride", "Dutasteride",
  
  // Eye & Ear
  "Tobramycin", "Ofloxacin Eye Drops", "Prednisolone Eye Drops", "Timolol", "Latanoprost",
  "Ciprofloxacin Ear Drops", "Betamethasone", "Chloramphenicol",
  
  // Skin Conditions
  "Hydrocortisone Cream", "Betamethasone Cream", "Clotrimazole Cream", "Mupirocin",
  "Tretinoin", "Adapalene", "Benzoyl Peroxide", "Calamine Lotion", "Fusidic Acid",
  
  // Respiratory
  "Theophylline", "Ipratropium", "Budesonide", "Fluticasone", "Beclomethasone",
  "Formoterol", "Salmeterol", "Tiotropium", "Montelukast",
  
  // Neurological
  "Phenytoin", "Carbamazepine", "Valproic Acid", "Levetiracetam", "Gabapentin", "Pregabalin",
  "Baclofen", "Tizanidine", "Levodopa", "Donepezil", "Memantine",
  
  // Urological
  "Tamsulosin", "Sildenafil", "Tadalafil", "Oxybutynin", "Solifenacin", "Alfuzosin",
  
  // Common Brand Names (Indian Market)
  "Crocin", "Combiflam", "Volini", "Moov", "Dolo", "Disprin", "Saridon", "Anacin",
  "Vicks", "Strepsils", "Halls", "Cofsils", "Benadryl", "Avil", "Allegra", "Zyrtec",
  "Gelusil", "ENO", "Pudin Hara", "Digene", "Gasex", "Cremaffin", "Dulcolax",
  "Norflox", "Cifran", "Augmentin", "Erythrocin", "Zithromax", "Bactrim",
  "Glucon-D", "Electral", "ORS", "Becosules", "Neurobion", "Revital", "Supradyn",
  
  // Ayurvedic & Herbal
  "Ashwagandha", "Brahmi", "Triphala", "Chyawanprash", "Arjuna", "Giloy", "Tulsi",
  "Neem", "Turmeric", "Ginger", "Garlic", "Aloe Vera", "Amla", "Fenugreek"
].sort();

// Try to load India Drug Bank dataset if available
let indiaDrugBankNames = [];
try {
  indiaDrugBankNames = require('./indiadrugbank-names.json');
} catch (e) {
  // India Drug Bank dataset not found, using default medicine list
}

// Combine both datasets and remove duplicates
const combinedMedicines = [...new Set([...medicineDatabase, ...indiaDrugBankNames])].sort();

export const getAllMedicines = () => combinedMedicines;

export const getMedicinesBySearch = (searchTerm) => {
  if (!searchTerm || searchTerm.length < 2) return [];
  
  const searchLower = searchTerm.toLowerCase();
  
  return combinedMedicines
    .filter(medicine => 
      medicine.toLowerCase().includes(searchLower)
    )
    .slice(0, 20); // Increased from 10 to 20 for better results
};

export const getMedicineCount = () => combinedMedicines.length;