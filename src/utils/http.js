// HTTP utility that provides the same interface as CapacitorHttp
// Uses fetch for web environments. In native Capacitor builds,
// you can swap this to use CapacitorHttp from @capacitor/core.

const HttpClient = {
  async get(options) {
    const response = await fetch(options.url, {
      method: 'GET',
      headers: options.headers || {},
    });
    const data = await response.json();
    return { data, status: response.status };
  },

  async post(options) {
    const response = await fetch(options.url, {
      method: 'POST',
      headers: options.headers || { 'Content-Type': 'application/json' },
      body: typeof options.data === 'string' ? options.data : JSON.stringify(options.data),
    });
    const data = await response.json();
    return { data, status: response.status };
  },
};

export default HttpClient;
