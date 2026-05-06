import { MapPinIcon } from "@heroicons/react/24/outline";
import { useI18n } from "@/context/i18n";

const DeliveryTo = () => {
    const { t } = useI18n();

    return ( 
        <div className="hidden md:inline md:flex items-center link">
            <MapPinIcon className="h-5 mt-3" />
            <div className="ml-1">
                <p className="text-xs text-gray-500">{t("deliverTo")}</p>
                <p className="flex font-bold text-sm">{t("germany")}</p>
            </div>
        </div>
     );
}
 
export default DeliveryTo;
