import { SaleorProvider } from "@saleor/sdk";
import { ConfigInput } from "@saleor/sdk/lib/types";
import { Integrations as ApmIntegrations } from "@sentry/apm";
import * as Sentry from "@sentry/browser";
import type {
  AppContext as NextAppContext,
  AppProps as NextAppProps,
} from "next/app";
import NextApp from "next/app";
import Head from "next/head";
import * as React from "react";
import { positions, Provider as AlertProvider } from "react-alert";
import TagManager from "react-gtm-module";
import { ThemeProvider } from "styled-components";

// import * as PusherPushNotifications from "@pusher/push-notifications-web";
import { NotificationTemplate } from "@components/atoms";
import { ServiceWorkerProvider } from "@components/containers";
import { defaultTheme, GlobalStyle } from "@styles";
import { NextQueryParamProvider } from "@temp/components";
import { getSaleorApi, getShopConfig, ShopConfig } from "@utils/ssr";

import { version } from "../../package.json";
import { App as StorefrontApp } from "../app";
import {
  loadMessagesJson,
  Locale,
  LocaleMessages,
  LocaleProvider,
} from "../components/Locale";
import {
  apiUrl,
  channelSlug,
  sentryDsn,
  sentrySampleRate,
  serviceWorkerTimeout,
  ssrMode,
} from "../constants";

declare global {
  interface Window {
    __APOLLO_CLIENT__: any;
    OneSignal: any;
  }
}
const attachClient = async () => {
  const { apolloClient } = await getSaleorApi();
  window.__APOLLO_CLIENT__ = apolloClient;
};

if (!ssrMode) {
  window.version = version;
  if (process.env.NEXT_PUBLIC_ENABLE_APOLLO_DEVTOOLS === "true") attachClient();
}

if (process.env.GTM_ID) {
  TagManager.initialize({ gtmId: process.env.GTM_ID });
}

if (sentryDsn) {
  Sentry.init({
    dsn: sentryDsn,
    // @ts-ignore
    integrations: [new ApmIntegrations.Tracing()],
    tracesSampleRate: sentrySampleRate,
  });
}

const saleorConfig: ConfigInput = { apiUrl, channel: channelSlug };

const notificationConfig = { position: positions.BOTTOM_RIGHT, timeout: 2500 };

type AppProps = NextAppProps & ShopConfig & { messages: LocaleMessages };

const App = ({
  Component,
  pageProps,
  footer,
  mainMenu,
  messages,
  shopConfig,
}: AppProps) => {
  // React.useEffect(() => {
  //   const beamsClient = new PusherPushNotifications.Client({
  //     instanceId: "966abe4b-b22b-4e37-94d8-60b66942efeb",
  //   });

  //   beamsClient
  //     .start()
  //     .then(() => beamsClient.addDeviceInterest("hello"))
  //     .then(() => console.log("Successfully registered and subscribed!"))
  //     .catch(console.error);
  // }, []);

  let OneSignal
  if (process.browser) {
    window.OneSignal = window.OneSignal || [];
    OneSignal = window.OneSignal;
  }

  React.useEffect(async() => {
    OneSignal.push(()=> {
      OneSignal.init(
        {
          appId: "037d0b62-81b6-4768-9154-943d45a67a51",
          allowLocalhostAsSecureOrigin: true,
          safari_web_id: "web.onesignal.auto.5ecc7e9f-2540-4c26-bcd6-80ea5ac40604",
          promptOptions: {
            slidedown: {
              enabled: true,
              actionMessage: "We'd like to show you notifications for the latest news and updates about the following categories.",
              acceptButtonText: "OMG YEEEEESS!",
              cancelButtonText: "NAHHH",
              categories: {
                  tags: [
                      {
                        tag: "react",
                        label: "Stay update with latest Offers",
                      },
                      {
                        tag: "angular",
                        label: "Get Community updates",
                      },
                  ]
              }     
          } 
        },
        welcomeNotification: {
          "title": "One Signal",
          "message": "Thanks for subscribing!",
        } 
      },
      //Automatically subscribe to the new_app_version tag
      OneSignal.sendTag("new_app_version", "new_app_version", tagsSent => {
        // Callback called when tag has finished sending
        console.log('new_app_version TAG SENT', tagsSent);
      }).then(async()=>{
        const personId = await OneSignal.getUserId()
          if(personId && personId !== null){
            localStorage.setItem("personId", personId);
          }
        })
      );
    });
  }, []);

  return (
    <>
      <Head>
        <title>Demo PWA Storefront – Saleor Commerce</title>
        <link rel="preconnect" href={apiUrl} />
        <link href="https://rsms.me/inter/inter.css" rel="stylesheet" />
        <link rel="icon" type="image/png" href="/favicon-36.png" />
        <link rel="manifest" href="/manifest.json" />

        <script src="https://js.pusher.com/beams/1.0/push-notifications-cdn.js" />
        <script src="https://cdn.onesignal.com/sdks/OneSignalSDK.js" async="" />
      </Head>
      <ThemeProvider theme={defaultTheme}>
        <AlertProvider
          template={NotificationTemplate as any}
          {...notificationConfig}
        >
          <ServiceWorkerProvider timeout={serviceWorkerTimeout}>
            <LocaleProvider messages={messages}>
              <GlobalStyle />
              <NextQueryParamProvider>
                <SaleorProvider config={saleorConfig}>
                  <StorefrontApp
                    footer={footer}
                    mainMenu={mainMenu}
                    shopConfig={shopConfig}
                  >
                    <Component {...pageProps} />
                  </StorefrontApp>
                </SaleorProvider>
              </NextQueryParamProvider>
            </LocaleProvider>
          </ServiceWorkerProvider>
        </AlertProvider>
      </ThemeProvider>
    </>
  );
};

// Fetch shop config only once and cache it.
let shopConfig: ShopConfig | null = null;

App.getInitialProps = async (appContext: NextAppContext) => {
  const {
    router: { locale },
  } = appContext;
  const appProps = await NextApp.getInitialProps(appContext);
  let messages: LocaleMessages;

  if (ssrMode) {
    if (!shopConfig) {
      shopConfig = await getShopConfig();
    }

    messages = await loadMessagesJson(locale as Locale);
  }

  return { ...appProps, ...shopConfig, messages };
};

export default App;
