import withPWAInit from "next-pwa";

const withPWA = withPWAInit({
  dest: "public",
  disable: process.env.NODE_ENV === "development",
  register: true,
  skipWaiting: true,
  runtimeCaching: [
    {
      urlPattern: /\/eaps\/.*\.(?:txt|json)$/i,
      handler: "CacheFirst",
      options: {
        cacheName: "eap-cache",
        expiration: {
          maxEntries: 50,
          maxAgeSeconds: 60 * 60 * 24 * 30,
        },
      },
    },
    {
      urlPattern: /\/audio\/.*\.(?:mp3|wav|ogg|m4a)$/i,
      handler: "CacheFirst",
      options: {
        cacheName: "audio-cache",
        expiration: {
          maxEntries: 30,
          maxAgeSeconds: 60 * 60 * 24 * 30,
        },
      },
    },
    {
      urlPattern: /^https?.*\.(?:txt|json)$/i,
      handler: "NetworkFirst",
      options: {
        cacheName: "text-fallback-cache",
        networkTimeoutSeconds: 5,
        expiration: {
          maxEntries: 40,
          maxAgeSeconds: 60 * 60 * 24 * 7,
        },
      },
    },
  ],
});

const nextConfig = {
  reactCompiler: true,
  turbopack: {},
};

export default withPWA(nextConfig);
