/**
 * Canonical specialization normalization.
 * Converts any "ology" form or misspelling → correct "ologist" doctor title.
 * Used in: getSpecializations, findDoctors, DB migration, server startup.
 */

const SPEC_CORRECTIONS = [
  // Gynecology / Gynacology / Gynecologist / Gynacologist
  { pattern: /gyn[ae]c?olog(ist|y)/i,                 canonical: 'Gynecologist' },
  // Neurology / Neurology / Neurologist
  { pattern: /neur[oe]?olog(ist|y)/i,                 canonical: 'Neurologist' },
  // Dermatology / Dermatologist
  { pattern: /dermat[eo]?olog(ist|y)/i,               canonical: 'Dermatologist' },
  // Cardiology / Cardiologist
  { pattern: /cardiolog(ist|y)/i,                     canonical: 'Cardiologist' },
  // Orthopedic / Orthopedics / Orthopedic Surgeon
  { pattern: /orthop[ae]?ed(ic surgeon|ics?|ist)?/i,  canonical: 'Orthopedic Surgeon' },
  // Psychiatry / Psychiatrist
  { pattern: /psychiatr(ist|y)/i,                     canonical: 'Psychiatrist' },
  // Pediatrics / Pediatrician
  { pattern: /pediatr(ician|y|ics)/i,                 canonical: 'Pediatrician' },
  // Ophthalmology / Ophthalmologist
  { pattern: /ophthalm[oe]?log(ist|y)/i,              canonical: 'Ophthalmologist' },
  // Gastroenterology / Gastroenterologist
  { pattern: /gastroenterolog(ist|y)/i,               canonical: 'Gastroenterologist' },
  // Endocrinology / Endocrinologist
  { pattern: /endocrinolog(ist|y)/i,                  canonical: 'Endocrinologist' },
  // Nephrology / Nephrologist
  { pattern: /nephrolog(ist|y)/i,                     canonical: 'Nephrologist' },
  // Oncology / Oncologist
  { pattern: /oncolog(ist|y)/i,                       canonical: 'Oncologist' },
  // Urology / Urologist
  { pattern: /urolog(ist|y)/i,                        canonical: 'Urologist' },
  // Rheumatology / Rheumatologist
  { pattern: /rheumatolog(ist|y)/i,                   canonical: 'Rheumatologist' },
  // Pulmonology / Pulmonologist
  { pattern: /pulmonolog(ist|y)/i,                    canonical: 'Pulmonologist' },
  // Radiology / Radiologist
  { pattern: /radiolog(ist|y)/i,                      canonical: 'Radiologist' },
  // Anesthesiology / Anesthesiologist
  { pattern: /anesthesiolog(ist|y)/i,                 canonical: 'Anesthesiologist' },
  // ENT / ENT Specialist
  { pattern: /^ent(\s+specialist)?$/i,                canonical: 'ENT Specialist' },
  // General Surgery → General Surgeon
  { pattern: /general\s+surg(eon|ery)/i,              canonical: 'General Surgeon' },
  // General Physician / General Doctor
  { pattern: /general\s+(physician|doctor|medicine)/i, canonical: 'General Physician' },
];

/**
 * Returns the canonical "ologist" name for any variant, or the original if no match.
 */
const normalizeSpecialization = (spec) => {
  if (!spec || typeof spec !== 'string') return spec;
  for (const { pattern, canonical } of SPEC_CORRECTIONS) {
    if (pattern.test(spec.trim())) return canonical;
  }
  return spec.trim();
};

/**
 * Builds a MongoDB $regex that matches the canonical form AND all its variants.
 */
const buildSpecRegex = (spec) => {
  const canonical = normalizeSpecialization(spec);
  const entry = SPEC_CORRECTIONS.find(c => c.canonical === canonical);
  return entry ? entry.pattern : new RegExp(spec.split(' ')[0], 'i');
};

module.exports = { SPEC_CORRECTIONS, normalizeSpecialization, buildSpecRegex };
