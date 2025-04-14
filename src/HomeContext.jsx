import { createContext } from "react";

export const HomeContext = createContext({
  user: null,
  redirectToLogin: () => {},
});
