import {
    createContext,
    useContext,
    useEffect,
    useMemo,
    useState,
    type ReactNode,
} from "react";

export type LanguageCode = "en" | "es" | "ar" | "de";

type TranslationKey = keyof typeof translations.en;

const STORAGE_KEY = "vendora_language";

export const languageOptions: Array<{
    code: LanguageCode;
    label: string;
}> = [
    { code: "en", label: "English - EN" },
    { code: "es", label: "espanol - ES" },
    { code: "ar", label: "العربية - AR" },
    { code: "de", label: "Deutsch - DE" },
];

const translations = {
    en: {
        all: "All",
        flashDeals: "Flash Deals",
        customerService: "Customer Service",
        registry: "Registry",
        giftCards: "Gift Cards",
        electronics: "Electronics",
        trendingNow: "Trending now in Electronics",
        deliverTo: "Deliver to",
        germany: "Germany",
        searchPlaceholder: "Search Vendora",
        hello: "Hello",
        signIn: "Sign in",
        accountLists: "Account & Lists",
        hi: "Hi",
        profile: "Profile",
        signOut: "Sign Out",
        newCustomer: "New customer?",
        startHere: "start here",
        yourList: "Your List",
        createList: "Create a list",
        findList: "Find a list or Registry",
        yourAccount: "Your Account",
        account: "Account",
        orders: "Orders",
        recommendations: "Recommendations",
        browsingHistory: "Browsing History",
        returns: "Returns",
        cart: "Cart",
        changeLanguage: "Change Language",
        learnMore: "Learn more",
        language: "Language",
        digitalContent: "Digital Content & Devices",
        shopByDepartment: "Shop By Department",
        programs: "Programs & Features",
        computers: "Computers",
        smartHome: "Smart Home",
        artsCrafts: "Arts & Crafts",
        shopByInterest: "Shop By Interest",
        vendoraMusic: "Vendora Music",
        vendoraAppstore: "Vendora Appstore",
        vendoraLive: "Vendora Live",
        primeVideo: "Prime Video",
        kindleBooks: "Kindle E-readers & Books",
        seeAll: "See all",
        seeLess: "See less",
    },
    es: {
        all: "Todo",
        flashDeals: "Ofertas Flash",
        customerService: "Atencion al Cliente",
        registry: "Lista de Regalos",
        giftCards: "Tarjetas de Regalo",
        electronics: "Electronica",
        trendingNow: "Tendencias en Electronica",
        deliverTo: "Entregar en",
        germany: "Alemania",
        searchPlaceholder: "Buscar en Vendora",
        hello: "Hola",
        signIn: "Iniciar sesion",
        accountLists: "Cuenta y Listas",
        hi: "Hola",
        profile: "Perfil",
        signOut: "Cerrar sesion",
        newCustomer: "Nuevo cliente?",
        startHere: "empieza aqui",
        yourList: "Tu Lista",
        createList: "Crear una lista",
        findList: "Encontrar una lista o registro",
        yourAccount: "Tu Cuenta",
        account: "Cuenta",
        orders: "Pedidos",
        recommendations: "Recomendaciones",
        browsingHistory: "Historial",
        returns: "Devoluciones",
        cart: "Carrito",
        changeLanguage: "Cambiar idioma",
        learnMore: "Saber mas",
        language: "Idioma",
        digitalContent: "Contenido digital y dispositivos",
        shopByDepartment: "Comprar por departamento",
        programs: "Programas y funciones",
        computers: "Computadoras",
        smartHome: "Casa inteligente",
        artsCrafts: "Arte y manualidades",
        shopByInterest: "Comprar por interes",
        vendoraMusic: "Vendora Music",
        vendoraAppstore: "Tienda de apps Vendora",
        vendoraLive: "Vendora Live",
        primeVideo: "Prime Video",
        kindleBooks: "Kindle E-readers y libros",
        seeAll: "Ver todo",
        seeLess: "Ver menos",
    },
    ar: {
        all: "الكل",
        flashDeals: "عروض سريعة",
        customerService: "خدمة العملاء",
        registry: "سجل الهدايا",
        giftCards: "بطاقات الهدايا",
        electronics: "الإلكترونيات",
        trendingNow: "الرائج الآن في الإلكترونيات",
        deliverTo: "التوصيل إلى",
        germany: "ألمانيا",
        searchPlaceholder: "ابحث في Vendora",
        hello: "مرحبا",
        signIn: "تسجيل الدخول",
        accountLists: "الحساب والقوائم",
        hi: "مرحبا",
        profile: "الملف الشخصي",
        signOut: "تسجيل الخروج",
        newCustomer: "عميل جديد؟",
        startHere: "ابدأ هنا",
        yourList: "قائمتك",
        createList: "إنشاء قائمة",
        findList: "العثور على قائمة أو سجل",
        yourAccount: "حسابك",
        account: "الحساب",
        orders: "الطلبات",
        recommendations: "التوصيات",
        browsingHistory: "سجل التصفح",
        returns: "المرتجعات",
        cart: "السلة",
        changeLanguage: "تغيير اللغة",
        learnMore: "اعرف المزيد",
        language: "اللغة",
        digitalContent: "المحتوى الرقمي والأجهزة",
        shopByDepartment: "التسوق حسب القسم",
        programs: "البرامج والميزات",
        computers: "أجهزة الكمبيوتر",
        smartHome: "المنزل الذكي",
        artsCrafts: "الفنون والحرف",
        shopByInterest: "التسوق حسب الاهتمام",
        vendoraMusic: "موسيقى Vendora",
        vendoraAppstore: "متجر تطبيقات Vendora",
        vendoraLive: "Vendora مباشر",
        primeVideo: "Prime Video",
        kindleBooks: "قارئات Kindle والكتب",
        seeAll: "عرض الكل",
        seeLess: "عرض أقل",
    },
    de: {
        all: "Alle",
        flashDeals: "Blitzangebote",
        customerService: "Kundenservice",
        registry: "Wunschliste",
        giftCards: "Geschenkkarten",
        electronics: "Elektronik",
        trendingNow: "Jetzt im Trend in Elektronik",
        deliverTo: "Liefern nach",
        germany: "Deutschland",
        searchPlaceholder: "Bei Vendora suchen",
        hello: "Hallo",
        signIn: "Anmelden",
        accountLists: "Konto und Listen",
        hi: "Hi",
        profile: "Profil",
        signOut: "Abmelden",
        newCustomer: "Neuer Kunde?",
        startHere: "hier starten",
        yourList: "Ihre Liste",
        createList: "Liste erstellen",
        findList: "Liste oder Register finden",
        yourAccount: "Ihr Konto",
        account: "Konto",
        orders: "Bestellungen",
        recommendations: "Empfehlungen",
        browsingHistory: "Browserverlauf",
        returns: "Rucksendungen",
        cart: "Warenkorb",
        changeLanguage: "Sprache andern",
        learnMore: "Mehr erfahren",
        language: "Sprache",
        digitalContent: "Digitale Inhalte und Gerate",
        shopByDepartment: "Nach Abteilung einkaufen",
        programs: "Programme und Funktionen",
        computers: "Computer",
        smartHome: "Smart Home",
        artsCrafts: "Kunst und Handwerk",
        shopByInterest: "Nach Interesse einkaufen",
        vendoraMusic: "Vendora Musik",
        vendoraAppstore: "Vendora Appstore",
        vendoraLive: "Vendora Live",
        primeVideo: "Prime Video",
        kindleBooks: "Kindle E-Reader und Bucher",
        seeAll: "Alle anzeigen",
        seeLess: "Weniger anzeigen",
    },
};

type I18nContextType = {
    language: LanguageCode;
    setLanguage: (language: LanguageCode) => void;
    t: (key: TranslationKey) => string;
};

const I18nContext = createContext<I18nContextType | undefined>(undefined);

export function I18nProvider({ children }: { children: ReactNode }) {
    const [language, setLanguageState] = useState<LanguageCode>("en");

    useEffect(() => {
        const stored =
            typeof window !== "undefined"
                ? (window.localStorage.getItem(STORAGE_KEY) as LanguageCode | null)
                : null;
        if (stored && Object.keys(translations).includes(stored)) {
            setLanguageState(stored);
        }
    }, []);

    useEffect(() => {
        if (typeof window !== "undefined") {
            window.localStorage.setItem(STORAGE_KEY, language);
        }
        if (typeof document !== "undefined") {
            document.documentElement.lang = language;
            document.documentElement.dir = language === "ar" ? "rtl" : "ltr";
        }
    }, [language]);

    const setLanguage = (nextLanguage: LanguageCode) => {
        setLanguageState(nextLanguage);
    };

    const t = (key: TranslationKey) => {
        return translations[language][key] || translations.en[key];
    };

    const value = useMemo(
        () => ({
            language,
            setLanguage,
            t,
        }),
        [language]
    );

    return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
    const context = useContext(I18nContext);
    if (!context) {
        throw new Error("useI18n must be used inside I18nProvider");
    }
    return context;
}
