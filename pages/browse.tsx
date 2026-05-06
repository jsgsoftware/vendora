import { getBrowseData } from "@/utils/mvCatalogRead";
import Header from "@/components/Header/Header";
import Link from "next/link";
import ProductCard from "@/components/Home/productCard/ProductCard";
import { ChevronRightIcon } from "@heroicons/react/24/solid";
import CategoriesFilter from "@/components/browse/categoriesFilter/CategoriesFilter";
import SizesFilter from "@/components/browse/sizesFilter/SizesFilter";
import ColorsFilter from "@/components/browse/colorsFilter/ColorsFilter";
import BrandsFilter from "@/components/browse/brandsFilter/BrandsFilter";
import StylesFilter from "@/components/browse/stylesFilter/StylesFilter";
import MaterialsFilter from "@/components/browse/materialsFilter/MaterialsFilter";
import GenderFilter from "@/components/browse/genderFilter/GenderFilter";
import HeadingFilter from "@/components/browse/headingFilter/HeadingFilter";
import { useRouter } from "next/router";
import { Pagination } from "@mui/material";
import { useEffect, useRef, useState } from "react";
// import DotLoaderSpinner from "@/components/loaders/dotLoader/DotLoaderSpinner";

const Browse = ({
    categories,
    subCategories,
    products,
    sizes,
    colors,
    brands,
    styles,
    materials,
    paginationCount,
}: any) => {
    const router = useRouter();
    // const [loading, setloading] = useState(false);

    const filter = ({
        search,
        category,
        brand,
        style,
        size,
        color,
        material,
        gender,
        price,
        shipping,
        rating,
        sort,
        page,
    }: any) => {
        const path = router.pathname;
        const { query } = router;

        if (search) query.search = search;
        if (category) query.category = category;
        if (brand) query.brand = brand;
        if (style) query.style = style;
        if (size) query.size = size;
        if (color) query.color = color;
        if (material) query.material = material;
        if (gender) query.gender = gender;
        if (price) query.price = price;
        if (shipping) query.shipping = shipping;
        if (rating) query.rating = rating;
        if (sort) query.sort = sort;
        if (page) query.page = page;
        console.log("price > ", price);
        router.push({
            pathname: path,
            query: query,
        });
    };

    const searchHandler = (search: any) => {
        if (search == "") {
            filter({ search: {} });
        } else {
            filter({ search });
        }
    };
    const categoryHandler = (category: any) => {
        filter({ category });
    };
    const brandHandler = (brand: any) => {
        filter({ brand });
    };
    const styleHandler = (style: any) => {
        filter({ style });
    };
    const sizeHandler = (size: any) => {
        filter({ size });
    };
    const colorHandler = (color: any) => {
        filter({ color });
    };
    const materialHandler = (material: any) => {
        filter({ material });
    };
    const genderHandler = (gender: any) => {
        if (gender == "Unisex") {
            filter({ gender: {} });
        } else {
            filter({ gender });
        }
    };

    // function throttle(fn: any, delay: any) {
    //     let lastInvoke: any = null;
    //     console.log('throttle',delay);

    //     return (...args: any[]) => {
    //         console.log('not invoke',args[0]);
    //         if (lastInvoke + delay < Date.now()) {
    //             console.log('invoke ', args[0]);
    //             lastInvoke = Date.now();
    //             fn(args[0]);
    //         }
    //     };
    // }

    function debounce(fn: any, delay: any) {
        let timeout: any = null;
        return (...args: any) => {
            clearTimeout(timeout);
            timeout = setTimeout(() => {
                fn(args[0]);
            }, delay);
        };
    }

    const priceHandler = (price: any, type: any, delay: any) => {
        let priceQuery = router.query.price?.split("_") || "";
        let min = priceQuery[0] || "";
        let max = priceQuery[1] || "";
        let newPrice = "";
        if (type == "min") {
            newPrice = `${price}_${max}`;
        } else {
            newPrice = `${min}_${price}`;
        }
        let filterPrice = debounce((price: any) => filter(price), delay);
        filterPrice({ price: newPrice });
    };

    const multiPriceHandler = (min: any, max: any) => {
        filter({ price: `${min}_${max}` });
    };

    const shippingHandler = (shipping: any) => {
        filter({ shipping });
    };
    const ratingHandler = (rating: any) => {
        filter({ rating });
    };
    const sortHandler = (sort: any) => {
        if (sort == "") {
            filter({ sort: {} });
        } else {
            filter({ sort });
        }
    };
    const pageHandler = (e: any, page: any) => {
        filter({ page });
    };

    const replaceQuery = (queryName: any, value: any) => {
        const existedQeury = router.query[queryName];
        const valueCheck = existedQeury?.search(value);
        const _check = existedQeury?.search(`_${value}`);
        let result = null;
        if (existedQeury) {
            if (existedQeury == value) {
                result = {};
            } else {
                if (valueCheck !== -1) {
                    // if filtered value is in query & we want to remove it.
                    if (_check !== -1) {
                        // last
                        result = existedQeury?.replace(`_${value}`, "");
                    } else if (valueCheck == 0) {
                        // first
                        result = existedQeury?.replace(`${value}_`, "");
                    } else {
                        // middle
                        result = existedQeury?.replace(value, "");
                    }
                } else {
                    // if filtered value doesn't exist in Query & we wan to add it.
                    result = `${existedQeury}_${value}`;
                }
            }
        } else {
            result = value;
        }

        return {
            result,
            active: existedQeury && valueCheck !== -1 ? true : false,
        };
    };
    // ----------------------------------------
    const [scrollY, setScrollY] = useState(0);
    const [height, setHeight] = useState(0);
    const headerRef = useRef(null);
    const el = useRef(null);
    useEffect(() => {
        const handleScroll = () => {
            setScrollY(window.scrollY);
        };
        handleScroll();
        window.addEventListener("scroll", handleScroll);
        setHeight(
            headerRef.current?.offsetHeight + el.current?.offsetHeight + 50
        );

        return () => {
            {
                window.removeEventListener("scroll", handleScroll);
            }
        };
    }, []);

    return (
        <>
            {/* {loading && <DotLoaderSpinner loading={loading} />} */}
            <Header title={"Browse Products"} searchHandler={searchHandler} />
            <div className="max-w-screen-2xl mx-auto bg-slate-100 p-1 md:p-6 gap-2">
                <div ref={headerRef}>
                    <div className="flex items-center text-sm">
                        <span className="text-slate-700">Home</span>
                        <ChevronRightIcon className="w-4 h-4 mx-1 fill-slate-600 " />
                        <span className="text-slate-700">Browse</span>
                        {router.query?.category !== "" && (
                            <>
                                <ChevronRightIcon className="w-4 h-4 mx-1 fill-slate-600 " />
                                <span className="text-slate-700">
                                    {
                                        categories.find(
                                            (x: any) =>
                                                x._id == router.query.category
                                        )?.name
                                    }
                                </span>
                            </>
                        )}
                    </div>

                    <div
                        ref={el}
                        className="mt-2 flex flex-wrap gap-3 flex-wrap"
                    >
                        {categories.map((c: any) => (
                            <span
                                onClick={() => categoryHandler(c._id)}
                                className={`cursor-pointer flex items-center justify-center w-40 md:w-56 h-10 border bg-white rounded  transition-all duration-300 hover:bg-amazon-blue_light hover:text-white hover:scale-95 hover:border-amazon-blue_dark`}
                                key={c._id}
                            >
                                {c.name}
                            </span>
                        ))}
                    </div>
                </div>

                <div className="relative mt-4 grid grid-cols-5 gap-1 md:gap-5">
                    <div
                        className={`h-[680px] col-span-5 md:col-span-1 flex flex-col md:items-center  overflow-y-auto overflow-x-hidden ${
                            scrollY >= height
                                ? "md:fixed md:w-[274px] md:top-2"
                                : ""
                        }`}
                    >
                        <button
                            onClick={() => router.push("/browse")}
                            className={`flex items-center justify-center w-56 md:w-full py-2 rounded transition-all duration-300 bg-amazon-blue_light text-white hover:scale-95 border-amazon-blue_dark`}
                        >
                            Clear All ({Object.keys(router.query).length})
                        </button>
                        <CategoriesFilter
                            categories={categories}
                            subCategories={subCategories}
                            categoryHandler={categoryHandler}
                            replaceQuery={replaceQuery}
                        />
                        <SizesFilter
                            sizes={sizes}
                            sizeHandler={sizeHandler}
                            replaceQuery={replaceQuery}
                        />
                        <ColorsFilter
                            colors={colors}
                            colorHandler={colorHandler}
                            replaceQuery={replaceQuery}
                        />
                        <BrandsFilter
                            brands={brands}
                            brandHandler={brandHandler}
                            replaceQuery={replaceQuery}
                        />
                        <StylesFilter
                            styles={styles}
                            styleHandler={styleHandler}
                            replaceQuery={replaceQuery}
                        />
                        <MaterialsFilter
                            materials={materials}
                            materialHandler={materialHandler}
                            replaceQuery={replaceQuery}
                        />
                        <GenderFilter
                            genderHandler={genderHandler}
                            replaceQuery={replaceQuery}
                        />
                    </div>

                    <div
                        className={`${
                            scrollY >= height ? "md:block" : "hidden"
                        } max-md:hidden md:col-span-1`}
                    ></div>

                    <div className="col-span-5 md:col-span-4 flex flex-col content-start">
                        <HeadingFilter
                            priceHandler={priceHandler}
                            multiPriceHandler={multiPriceHandler}
                            shippingHandler={shippingHandler}
                            ratingHandler={ratingHandler}
                            sortHandler={sortHandler}
                            replaceQuery={replaceQuery}
                        />
                        <div className="mt-6 flex flex-wrap items-start gap-4">
                            {products.map((product: any) => (
                                <ProductCard
                                    product={product}
                                    key={product._id}
                                />
                            ))}
                        </div>
                        <div className="w-full my-4 flex items-end justify-end">
                            <Pagination
                                count={paginationCount}
                                variant="outlined"
                                defaultPage={Number(router.query.page) || 1}
                                onChange={pageHandler}
                                size="large"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Browse;

export async function getServerSideProps(context: any) {
    const data = await getBrowseData(context.query);

    return {
        props: {
            categories: JSON.parse(JSON.stringify(data.categories)),
            products: JSON.parse(JSON.stringify(data.products)),
            subCategories: JSON.parse(JSON.stringify(data.subCategories)),
            sizes: data.sizes,
            colors: data.colors,
            brands: data.brands,
            styles: data.styles,
            materials: data.materials,
            paginationCount: data.paginationCount,
        },
    };
}
