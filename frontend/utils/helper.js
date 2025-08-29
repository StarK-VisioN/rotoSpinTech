export const validateWorkingId = (workingId) => {
  return workingId.trim() !== "";
};

export const validatePassword = (password) => {
  return password.length >= 6; 
};

export const getInitials = (name) => {
  if (!name) return "";
  const words = name.trim().split(/\s+/);
  if (words.length === 1) return words[0][0].toUpperCase();
  return (words[0][0] + words[1][0]).toUpperCase();
};
