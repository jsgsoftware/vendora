import {
    Bars3Icon,
    MapPinIcon,
} from "@heroicons/react/24/outline";
import Link from "next/link";
import { useI18n } from "@/context/i18n";

const HeaderBottom = ({ handleOpenMenu }: any) => {
    const { t } = useI18n();

    return ( 
        <>
        <div className="bg-amazon-blue_dark md:bg-amazon-blue_light flex items-center py-2 px-4 md:space-x-4 text-vendora-ink max-md:-mt-1 max-md:pb-4 border-b border-vendora">
            <div
                onClick={handleOpenMenu}
                className="hidden md:flex items-center cursor-pointer mr-2 text-lg"
            >
                <Bars3Icon className="h-7 mr-1" />
                <span className="font-bold text-sm">{t("all")}</span>
            </div>
            <div className="flex flex-grow max-md:overflow-x-scroll scrollbar-hide text-sm whitespace-nowrap ">
                <ul className="flex space-x-4">
                    <li className="font-semibold text-vendora-accent"><Link href="">{t("flashDeals")}</Link></li>
                    <li className=""><Link href="">{t("customerService")}</Link></li>
                    <li className=""><Link href="">{t("registry")}</Link></li>
                    <li className=""><Link href="">{t("giftCards")}</Link></li>
                    <li className=""><Link href="">{t("electronics")}</Link></li>
                </ul>
            </div>
            <div className="hidden md:inline text-sm">
                <a className="text-vendora-accent" href="">{t("trendingNow")}</a>
            </div>
        </div>

        <div className="flex md:hidden items-center p-2 bg-amazon-blue_light text-vendora-ink max-md:-mt-1 border-b border-vendora">
            <MapPinIcon className="h-6 mr-1" />
            <span className="text-sm">{t("deliverTo")} {t("germany")}</span>
        </div>
    </>
    );
}
 
export default HeaderBottom;
