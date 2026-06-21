import { betterAuth } from 'better-auth';
import {
  genericOAuth,
  keycloak,
} from 'better-auth/plugins';

export const auth = betterAuth({
  secret: process.env.BETTER_AUTH_SECRET!,
  session: {
    cookieCache: {
      enabled: true,
      maxAge: 5 * 60,
      strategy: "jwe",
      refreshCache: true,
    },
  },
  account: {
    storeStateStrategy: "cookie",
    storeAccountCookie: true,
  },
  plugins: [
    genericOAuth({
      config: [
        keycloak({
          clientId: process.env.KEYCLOAK_CLIENT_ID!,
          clientSecret: process.env.KEYCLOAK_CLIENT_SECRET!,
          issuer: process.env.KEYCLOAK_ISSUER!,
          disableImplicitSignUp: false,
        }),
      ],
    }),
  ],
});
