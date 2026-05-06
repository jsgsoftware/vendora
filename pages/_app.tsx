import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { Provider } from "react-redux";
import { persistor, store } from "../redux/store";
import { PersistGate } from "redux-persist/integration/react";
import { SessionProvider } from "next-auth/react";
import { I18nProvider } from "@/context/i18n";

export default function App({
    Component,
    pageProps: { session, ...pageProps },
}: AppProps) {
    return (
        <SessionProvider session={session}>
            <Provider store={store}>
                <PersistGate loading={null} persistor={persistor}>
                    <I18nProvider>
                        <div>
                            <Component {...pageProps} />
                        </div>
                    </I18nProvider>
                </PersistGate>
            </Provider>
        </SessionProvider>
    );
}
