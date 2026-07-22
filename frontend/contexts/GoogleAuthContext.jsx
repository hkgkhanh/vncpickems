"use client";

import { createContext, useContext, useMemo, useState } from "react";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { jwtDecode } from "jwt-decode";

const GoogleAuthContext = createContext(null);

function GoogleAuthProviderInner({ children }) {
  const [credential, setCredential] = useState(null);
  const [user, setUser] = useState(null);

  function loginSuccess(credentialResponse) {
    const jwt = credentialResponse.credential;

    const decoded = jwtDecode(jwt);

    setCredential(jwt);

    setUser({
      googleId: decoded.sub,
      email: decoded.email,
      name: decoded.name,
      picture: decoded.picture,
    });
  }

  function logout() {
    setCredential(null);
    setUser(null);
  }

  const value = useMemo(
    () => ({
      user,
      credential,
      loggedIn: !!credential,
      loginSuccess,
      logout,
    }),
    [user, credential]
  );

  return (
    <GoogleAuthContext.Provider value={value}>
      {children}
    </GoogleAuthContext.Provider>
  );
}

export default function GoogleAuthProvider({ children }) {
  return (
    <GoogleOAuthProvider clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID}>
      <GoogleAuthProviderInner>
        {children}
      </GoogleAuthProviderInner>
    </GoogleOAuthProvider>
  );
}

export function useGoogleAuth() {
  const context = useContext(GoogleAuthContext);

  if (!context) {
    throw new Error("useGoogleAuth must be used inside GoogleAuthProvider");
  }

  return context;
}