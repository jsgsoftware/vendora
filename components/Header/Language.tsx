import { ChevronDownIcon } from "@heroicons/react/24/outline";
import Image from "next/image";
import { languageOptions, useI18n } from "@/context/i18n";

import enFlag from "../../public/assets/images/en-flag.png";

const Language = () => {
    const { language, setLanguage, t } = useI18n();

    return ( 
        <div className="show-account relative hidden md:flex items-center link self-end mb-1.5">
            <div className="relative w-6 h-6">
                <Image
                    src={enFlag}
                    alt="flag-country"
                    className="object-contain"
                    fill
                />
            </div>
            <p className="flex ml-2 font-bold text-sm">
                {language.toUpperCase()} <ChevronDownIcon className="h-4 self-end ml-1" />
            </p>

            {/* popOver Language */}
            <div className="z-20 show-account-popup absolute w-56 top-5 -right-[3.8rem] h-auto bg-white rounded-sm border shadow-md mt-1">
                <div className="absolute h-3 w-3 bg-white rotate-45 -mt-1 right-[3.85rem] "></div>
                <div className="flex flex-col p-3">
                    <p className="text-xs text-gray-900 my-2">
                        {t("changeLanguage")}
                        <span className="text-vendora-accent ml-1">{t("learnMore")}</span>
                    </p>
                    <div className="w-full h-[1px] bg-gray-200 my-1" />
                    {languageOptions.map((option) => (
                        <label key={option.code} className="flex text-xs text-gray-900 mt-2">
                            <input
                                className="mr-2 text-vendora-accent"
                                type="radio"
                                name="language"
                                checked={language === option.code}
                                onChange={() => setLanguage(option.code)}
                            />
                            {option.label}
                        </label>
                    ))}
                </div>
                
            </div>
        </div>
     );
}
 
export default Language;
