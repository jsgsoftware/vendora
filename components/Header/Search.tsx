import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { useRouter } from "next/dist/client/router";
import { useState } from "react";
import { useI18n } from "@/context/i18n";

const Search = ({searchHandler}: any) => {
    const router = useRouter();
    const [query, setQuery] = useState(router.query?.search || "");
    const { t } = useI18n();
    // const [showSearch, setShowSearch] = useState(false);

    const handleSearch = (e: any) => {
        e.preventDefault();
        if(query.length > 1) {
            if(router.pathname !== "/browse") {
                router.push(`/browse?search=${query}`)
            } else {
                searchHandler(query);
            }
        } else if(query.length == 0 && router.pathname == "/browse") {
            searchHandler(query);
        }
    };

    return (
        <div className="flex-grow relative">
            <form
                onSubmit={(e) => handleSearch(e)}
                className="bg-white flex flex-grow items-center rounded-md max-md:mx-4 max-md:mb-2 border border-vendora shadow-[0_8px_22px_rgba(123,47,247,0.12)]"
            >
                <select
                    defaultValue="All"
                    className="hidden md:inline h-11 w-16 rounded-l text-gray-700 px-2 text-sm bg-gray-100 border-r border-gray-300 cursor-pointer outline-none"
                >
                    <option disabled value="All">
                        All
                    </option>
                    <option value="Computers">Computers</option>
                    <option value="Arts & Crafts">Arts & Crafts</option>
                    <option value="Baby">Baby</option>
                    <option value="Book">Book</option>
                </select>
                <input
                    // onClick={() => setShowSearch((prev) => !prev)}
                    type="text"
                    className="outline-none w-full h-11 text-black pl-3 max-md:rounded-l"
                    placeholder={t("searchPlaceholder")}
                    onChange={(e: any) => setQuery(e.target.value)}
                    defaultValue={query}
                />
                <button type="submit">
                    <span className="flex items-center justify-center h-11 w-11 rounded-r-md bg-gradient-to-r from-[#7B2FF7] to-[#B06CFF]">
                        <MagnifyingGlassIcon className="text-white h-6 w-6" />
                    </span>
                </button>
            </form>
            {/* {showSearch && (
                <div className="z-20 absolute top-11 w-full h-auto bg-white border rounded-sm shadhow-md">
                    <ul className="text-black">
                        <li className="px-3 py-2 border-b cursor-pointer hover:bg-gray-100 font-semibold">
                            search Result 1
                        </li>
                        <li className="px-3 py-2 border-b cursor-pointer hover:bg-gray-100 font-semibold">
                            search Result 2 
                        </li>
                        <li className="px-3 py-2 border-b cursor-pointer hover:bg-gray-100 font-semibold">
                            search Result 3
                        </li>
                    </ul>
                </div>
            )} */}
        </div>
    );
};

export default Search;
