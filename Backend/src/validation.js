const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function cleanText(value) {
  if (typeof value !== "string") {
    return "";
  }
  return value.trim();
}

function isValidEmail(email) {
  return EMAIL_REGEX.test(email);
}

function isValidDate(value) {
  if (!value) {
    return false;
  }

  const parsed = new Date(value);
  return !Number.isNaN(parsed.getTime());
}

function validateRegistration(payload) {
  const data = {
    firstName: cleanText(payload.firstName),
    lastName: cleanText(payload.lastName),
    otherNames: cleanText(payload.otherNames),
    email: cleanText(payload.email),
    phone: cleanText(payload.phone),
    gender: cleanText(payload.gender).toLowerCase(),
    dateOfBirth: cleanText(payload.dateOfBirth),
    birthPlace: cleanText(payload.birthPlace),
    residence: cleanText(payload.residence),
    occupation: cleanText(payload.occupation),
    role: cleanText(payload.role),
  };

  const errors = [];

  if (!data.firstName) errors.push("First name is required.");
  if (!data.lastName) errors.push("Last name is required.");
  if (!data.email || !isValidEmail(data.email))
    errors.push("A valid email is required.");
  if (!data.phone) errors.push("Phone number is required.");
  if (!data.gender || !["male", "female", "other"].includes(data.gender)) {
    errors.push("Gender must be male, female, or other.");
  }
  if (!data.dateOfBirth || !isValidDate(data.dateOfBirth)) {
    errors.push("A valid date of birth is required.");
  }
  if (!data.birthPlace) errors.push("Place of birth is required.");
  if (!data.residence) errors.push("Residence is required.");
  if (!data.occupation) errors.push("Occupation is required.");
  if (!data.role) errors.push("Preferred training area is required.");

  return {
    isValid: errors.length === 0,
    errors,
    data,
  };
}

function validateContact(payload) {
  const data = {
    fullName: cleanText(payload.fullName),
    email: cleanText(payload.email),
    message: cleanText(payload.message),
  };

  const errors = [];

  if (!data.fullName) errors.push("Full name is required.");
  if (!data.email || !isValidEmail(data.email))
    errors.push("A valid email is required.");
  if (!data.message) errors.push("Message is required.");

  return {
    isValid: errors.length === 0,
    errors,
    data,
  };
}

module.exports = {
  validateRegistration,
  validateContact,
};
