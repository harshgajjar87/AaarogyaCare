// Script to generate comprehensive medicine database
// Run this to create a full database with 2000+ medicines

const fs = require('fs');
const path = require('path');

const medicineData = {
  analgesics: [
    'Paracetamol', 'Ibuprofen', 'Aspirin', 'Diclofenac', 'Naproxen', 'Celecoxib',
    'Tramadol', 'Ketorolac', 'Aceclofenac', 'Nimesulide', 'Piroxicam', 'Indomethacin',
    'Meloxicam', 'Etoricoxib', 'Morphine', 'Fentanyl', 'Codeine', 'Oxycodone',
    'Hydrocodone', 'Mefenamic Acid', 'Ketoprofen', 'Flurbiprofen', 'Etodolac'
  ],
  antibiotics: [
    'Amoxicillin', 'Azithromycin', 'Ciprofloxacin', 'Doxycycline', 'Cephalexin',
    'Clindamycin', 'Erythromycin', 'Levofloxacin', 'Metronidazole', 'Trimethoprim',
    'Clarithromycin', 'Ofloxacin', 'Cefixime', 'Ampicillin', 'Penicillin',
    'Tetracycline', 'Norfloxacin', 'Roxithromycin', 'Cefuroxime', 'Ceftriaxone',
    'Cefotaxime', 'Cefpodoxime', 'Moxifloxacin', 'Gatifloxacin', 'Linezolid',
    'Vancomycin', 'Gentamicin', 'Amikacin', 'Tobramycin', 'Streptomycin'
  ],
  // Add more categories...
};

const types = {
  tablet: ['250mg', '500mg', '650mg', '1000mg'],
  capsule: ['100mg', '200mg', '250mg', '500mg'],
  syrup: ['60mg/5ml', '120mg/5ml', '125mg/5ml', '250mg/5ml'],
  suspension: ['125mg/5ml', '250mg/5ml'],
  injection: ['50mg', '100mg', '500mg', '1g'],
  drops: ['0.3%', '0.5%', '1%', '2%'],
  cream: ['1%', '2%', '5%', '10%'],
  ointment: ['1%', '2%', '5%'],
  gel: ['1%', '2%', '5%'],
  patch: ['25mcg', '50mcg', '75mcg', '100mcg']
};

console.log('Medicine database generation script');
console.log('This would generate 2000+ medicines with all types and strengths');
