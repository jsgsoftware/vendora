import CarouselContainer from "@/components/Home/CarouselContainer";
import Footer from "@/components/Footer";
import Header from "@/components/Header/Header";
import MenuSideBar from "@/components/Header/MenuSidebar";
import HomeProductSwiper from "@/components/Home/HomeProductSwiper";
import CategoriesProduct from "@/components/Home/CategoriesProduct/CategoriesProducts";
import HomeSectionsRenderer from "@/components/Home/HomeSectionsRenderer";
import { getHomeData } from "@/utils/mvCatalogRead";

export default function Home({ products, categories, homeSections }: any) {
    const topGridCategories = categories.slice(0, 4);
    const topSliderCategories = categories.slice(0, 6);
    const enabledSections = Array.isArray(homeSections)
        ? homeSections.filter((section: any) => section?.enabled !== false)
        : [];
    const heroSection = enabledSections.find((section: any) => section?.type === "hero_carousel");
    const contentSections = enabledSections.filter((section: any) => section?.type !== "hero_carousel");
    const hasCustomSections = contentSections.length > 0;

    return (
        <>
            <Header title="Full Amazon Clone React" />
            <main className="max-w-screen-2xl mx-auto bg-gray-100">
                <CarouselContainer slides={heroSection?.payload?.slides || []} />
                {hasCustomSections ? (
                    <HomeSectionsRenderer sections={contentSections} products={products} />
                ) : (
                    <>
                        <CategoriesProduct products={products} categories={topGridCategories} />
                        <div className="z-10 relative">
                            {topSliderCategories.map((category: any) => (
                                <HomeProductSwiper
                                    key={category._id}
                                    products={products}
                                    categoryId={category._id}
                                    categoryName={category.name}
                                />
                            ))}
                        </div>
                    </>
                )}
            </main>
            <Footer />
            <MenuSideBar />
        </>
    );
}

export const getServerSideProps = async (context: any) => {
    const data = await getHomeData();
    return {
        props: {
            products: JSON.parse(JSON.stringify(data.products)),
            categories: JSON.parse(JSON.stringify(data.categories)),
            homeSections: JSON.parse(JSON.stringify(data.homeSections || [])),
        },
    };
};
