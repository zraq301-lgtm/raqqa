// HTTP utility that provides the same interface as CapacitorHttp
// Uses native CapacitorHttp in Capacitor apps, falls back to fetch in web

let useNativeHttp = false;
let NativeHttp = null;

try {
  const mod = await import('@capacitor/core');
  if (mod.CapacitorHttp && mod.Capacitor?.isNativePlatform()) {
    NativeHttp = mod.CapacitorHttp;
    useNativeHttp = true;
  }
} catch (e) {
  // Running in web environment, use fetch fallback
}

const HttpClient = {
  async get(options) {
    if (useNativeHttp && NativeHttp) {
      return NativeHttp.get(options);
    }
    const response = await fetch(options.url, {
      method: 'GET',
      headers: options.headers || {},
    });
    const data = await response.json();
    return { data, status: response.status };
  },

  async post(options) {
    if (useNativeHttp && NativeHttp) {
      return NativeHttp.post(options);
    }
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
