import NextAuth from "next-auth";
import SpotifyProvider from "next-auth/providers/spotify";
import AppleProvider from "next-auth/providers/apple";
import { log } from "console";
import { URLSearchParams } from "next/dist/compiled/@edge-runtime/primitives/url";
// import log from "logging-service";


const scopes = [
    "playlist-read-private",
    "playlist-read-collaborative",
    "user-read-private",
    "user-read-email"
].join(",") 

const params = {
    scope: scopes
}

const LOGIN_URL = "https://accounts.spotify.com/authorize?" + new URLSearchParams(params).toString();


async function refreshAccessToken(token: any) {
    const params = new URLSearchParams()
    params.append("grant_type", "refresh_token")
    params.append("refresh_token", token.refreshToken)
    const response = await fetch( "https://accounts.spotify.com/api/token", {
        method: "POST",
        headers: {
        'content-type': 'application/x-www-form-urlencoded',
        'Authorization': 'Basic ' + (Buffer.from(process.env.SPOTIFY_CLIENT_ID! + ':' + process.env.SPOTIFY_CLIENT_SECRET!).toString('base64'))
        },
        body: params
    })

    const data = await response.json()
    return {
        accessToken: data.access_token,
        refreshToken: data.refresh_token ?? token.refreshToken,
        expiresAt: Date.now() + data.expires_in * 1000
    }
}


export const authOptions = {
    debug: true,
  providers: [
    SpotifyProvider({
      clientId: process.env.SPOTIFY_CLIENT_ID!,
      clientSecret: process.env.SPOTIFY_CLIENT_SECRET!,
      authorization: LOGIN_URL,
      async profile(profile) {
        return {   
          id: profile.id,
          name: profile.display_name,
          email: profile.email,
          image: profile.images[0]?.url || "",
        };
      },
    }),
    AppleProvider({
      clientId: process.env.APPLE_CLIENT_ID!,
      clientSecret: process.env.APPLE_CLIENT_SECRET!,
      authorization: {
        url: "https://appleid.apple.com/auth/authorize",
        params: {
          scope: "email name",
        },
      },
      async profile(profile) {
        return {
          id: profile.id,dsdsdss
          name: profile.name,
          email: profile.email,
        };
      },
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: "/playlists"
  },
//   session: {
//     strategy: "jwt" , // Use the correct type by casting to "jwt" as const
//   },
  callbacks: {
    async jwt({ token, account }: any) {
        console.log("jwt token accessed")
      if (account) {
        token.accessToken = account.access_token
        token.refreshToken = account.refresh_token
        token.expiresAt = account.expiresAt
        return token;
      }

      if( Date.now() < token.expiresAt * 1000){
        return token
      }
      
      return refreshAccessToken(token);
    },
    async session({ session, token }: { session: any; token: any }) {
      session.accessToken = token.accessToken
      session.refreshToken = token.refreshToken
      session.expiresAt = token.expiresAt
      return session;
    },
  },
  logger: {
    error(code: any, metadata: any) {
      console.error(`NextAuth Error: ${code}`, metadata);
    },
    warn(code: any) {
      console.warn(`NextAuth Warning: ${code}`);
    },
    debug(code: any, metadata: any) {
      console.debug(`NextAuth Debug: ${code}`, metadata);
    },
  },

};

export default NextAuth(authOptions);
