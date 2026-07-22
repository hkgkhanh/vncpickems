export function getApiUrl(path) {
  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path;
  }

  if (typeof window !== "undefined") {
    return path.startsWith("/") ? path : `/${path}`;
  }

  const backendUrl = process.env.NEXT_PUBLIC_API_URL;
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  
  return `${backendUrl}${cleanPath}`;
}