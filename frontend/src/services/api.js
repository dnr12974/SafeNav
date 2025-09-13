const API_URL = "http://127.0.0.1:8000"; 

export function saveToken(token) {
  localStorage.setItem("token", token);
}

export function getToken() {
  return localStorage.getItem("token");
}

export function logout() {
  localStorage.removeItem("token");
}

export async function login(email, password) {
  const res = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) throw new Error((await res.json()).detail || "Login failed");
  return res.json();
}

export async function register(data) {
  const res = await fetch(`${API_URL}/auth/signup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error((await res.json()).detail || "Registration failed");
  return res.json();
}

export async function getProfile() {
  const res = await fetch(`${API_URL}/auth/me`, {
    headers: {
      "Authorization": `Bearer ${getToken()}`
    }
  });
  if (!res.ok) throw new Error((await res.json()).detail || "Failed to fetch profile");
  return res.json();
}

export async function fetchContacts() {
  const res = await fetch(`${API_URL}/contacts/list`, {
    headers: {
      "Authorization": `Bearer ${getToken()}`
    }
  });
  if (!res.ok) throw new Error((await res.json()).detail || "Failed to fetch contacts");
  return res.json();
}

export async function addContact(contact) {
  const res = await fetch(`${API_URL}/contacts/add`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${getToken()}`
    },
    body: JSON.stringify(contact)
  });
  if (!res.ok) throw new Error((await res.json()).detail || "Failed to add contact");
  return res.json();
}

export async function updateContact(contact) {
  const res = await fetch(`${API_URL}/contacts/edit`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${getToken()}`
    },
    body: JSON.stringify({
      contact_id: contact.id,
      updated_contact: {
        name: contact.name,
        phone_number: contact.phone,
        relationship: contact.relationship
      }
    })
  });
  if (!res.ok) throw new Error((await res.json()).detail || "Failed to update contact");
  return res.json();
}

export async function deleteContact(id) {
  const res = await fetch(`${API_URL}/contacts/delete?contact_id=${encodeURIComponent(id)}`, {
    method: "DELETE",
    headers: {
      "Authorization": `Bearer ${getToken()}`
    }
  });
  if (!res.ok) throw new Error((await res.json()).detail || "Failed to delete contact");
  return res.json();
}

export async function triggerSOS(data = {}) {
  const res = await fetch(`${API_URL}/sos/trigger`, {
    method: "POST",
    headers: { 
      "Content-Type": "application/json",
      "Authorization": `Bearer ${getToken()}` 
    },
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error((await res.json()).detail || "Failed to trigger SOS");
  return res.json();
}


export async function fetchSOSHistory() {
  const res = await fetch(`${API_URL}/sos/history`, {
    headers: { "Authorization": `Bearer ${getToken()}` }
  });
  if (!res.ok) throw new Error((await res.json()).detail || "Failed to fetch SOS history");
  return res.json();
}

export async function planRoute(start, end) {
  const res = await fetch(`${API_URL}/route/plan`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${getToken()}`
    },
    body: JSON.stringify({ start, end })
  });
  if (!res.ok) throw new Error((await res.json()).detail || "Failed to plan route");
  return res.json();
}

export async function updateProfile({ fullName, phone, address }) {
  const res = await fetch(`${API_URL}/auth/update_profile`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${getToken()}`
    },
    body: JSON.stringify({
      full_name: fullName,
      phone_number: phone,
      address: address
    })
  });
  if (!res.ok) throw new Error((await res.json()).detail || "Failed to update profile");
  return res.json();
}

export async function changePassword(oldPassword, newPassword) {
  const res = await fetch(`${API_URL}/auth/change_password`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${getToken()}`
    },
    body: JSON.stringify({
      old_password: oldPassword,
      new_password: newPassword
    })
  });
  if (!res.ok) throw new Error((await res.json()).detail || "Failed to update password");
  return res.json();
}