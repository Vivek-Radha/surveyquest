const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

const fetchWithCreds = async (url, options = {}) => {
  const mergedOptions = {
    ...options,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  };
  const res = await fetch(url, mergedOptions);
  if (!res.ok) {
    const errorMsg = await res.text();
    throw new Error(errorMsg || 'API Error');
  }
  return res.json();
};

export const api = {
  // Auth
  login: async (email, password, rememberMe = false) => {
    const data = await fetchWithCreds(`${BASE_URL}/auth/login`, {
      method: 'POST',
      body: JSON.stringify({ email, password, rememberMe })
    });
    if (rememberMe) {
      localStorage.setItem('user', JSON.stringify(data));
      sessionStorage.removeItem('user');
    } else {
      sessionStorage.setItem('user', JSON.stringify(data));
      localStorage.removeItem('user');
    }
    return data;
  },
  
  signup: async (name, email, password) => {
    const data = await fetchWithCreds(`${BASE_URL}/auth/signup`, {
      method: 'POST',
      body: JSON.stringify({ name, email, password })
    });
    localStorage.setItem('user', JSON.stringify(data));
    return data;
  },

  logout: async () => {
    await fetchWithCreds(`${BASE_URL}/auth/logout`, { method: 'POST' });
    localStorage.removeItem('user');
    sessionStorage.removeItem('user');
  },

  // Surveys
  createSurvey: async (title, description, questions, isPublic = true) => {
    return fetchWithCreds(`${BASE_URL}/surveys`, {
      method: 'POST',
      body: JSON.stringify({ title, description, questions, isPublic })
    });
  },

  updateSurvey: async (id, payload) => {
    return fetchWithCreds(`${BASE_URL}/surveys/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload)
    });
  },

  getMySurveys: async () => {
    return fetchWithCreds(`${BASE_URL}/surveys/my-surveys`);
  },

  getCommunitySurveys: async () => {
    return fetchWithCreds(`${BASE_URL}/surveys/community`);
  },

  getSurveyByLink: async (shareLink) => {
    return fetchWithCreds(`${BASE_URL}/surveys/link/${shareLink}`);
  },

  joinSurveyByCode: async (code) => {
    return fetchWithCreds(`${BASE_URL}/surveys/join/${code}`);
  },

  submitResponse: async (surveyId, answers, respondentId = null) => {
    return fetchWithCreds(`${BASE_URL}/surveys/${surveyId}/responses`, {
      method: 'POST',
      body: JSON.stringify({ answers, respondentId })
    });
  },

  getSurveyResponses: async (surveyId) => {
    return fetchWithCreds(`${BASE_URL}/surveys/${surveyId}/responses`);
  },

  deleteResponse: async (responseId) => {
    return fetchWithCreds(`${BASE_URL}/surveys/responses/${responseId}`, {
      method: 'DELETE'
    });
  },

  // Admin
  getStats: async () => {
    return fetchWithCreds(`${BASE_URL}/admin/stats`);
  },

  getAllResponses: async () => {
    return fetchWithCreds(`${BASE_URL}/admin/responses`);
  }
};
