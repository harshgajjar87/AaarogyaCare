export const getFullImageUrl = (imagePath) => {
  if (!imagePath) return null;

  // Already an absolute URL? Return it directly
  if (imagePath.startsWith('http')) {
    return imagePath;
  }

  // Get backend base URL dynamically (fallback to localhost for dev)
  const baseUrl = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000';

  // For any relative path starting with /uploads, prepend the baseUrl
  if (imagePath.startsWith('/uploads')) {
    return `${baseUrl}${imagePath}`;
  }

  // For relative paths not starting with /, ensure proper joining
  if (!imagePath.startsWith('/')) {
    return `${baseUrl}/${imagePath}`;
  }

  // For other cases, just prepend baseUrl
  return `${baseUrl}${imagePath}`;
};

export const getProfileImageUrl = (profileImage) => {
  return getFullImageUrl(profileImage) || '/images/default-avtar.jpg';
};

export const getClinicImageUrl = (clinicImage) => {
  return getFullImageUrl(clinicImage);
};