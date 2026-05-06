import Footer from "@/components/Footer";
import Header from "@/components/Header/Header";
import MenuSideBar from "@/components/Header/MenuSidebar";
import ProductPage from "@/components/ProductPage/ProductPage";
import { getProductBySlug } from "@/utils/mvCatalogRead";

const SingleProduct = ({ product }: any) => {
    // console.log(product);
    return (
        <>
            <Header title={product.name} />
            <main className="bg-white w-full">
                <ProductPage product={product} />
            </main>
            <Footer />
            <MenuSideBar />
        </>
    );
};

export default SingleProduct;

export const getServerSideProps = async (context: any) => {
    const { query } = context;
    const slug = query.slug;
    const requestedStyle = Number(query.style);
    const requestedSize = Number(query.size);
    let product = await getProductBySlug(slug);

    if (!product) {
        return {
            notFound: true,
        };
    }

    const subProducts = Array.isArray(product.subProducts) ? product.subProducts : [];
    if (!subProducts.length) {
        return {
            notFound: true,
        };
    }

    const style = Number.isInteger(requestedStyle) && requestedStyle >= 0 && requestedStyle < subProducts.length
        ? requestedStyle
        : 0;

    let subProduct = subProducts[style] || subProducts[0];
    const subSizes = Array.isArray(subProduct?.sizes) ? subProduct.sizes : [];
    if (!subSizes.length) {
        subProduct = {
            ...subProduct,
            sizes: [{ size: "ONE", qty: 0, price: 0 }],
        };
    }

    const sizes = subProduct.sizes;
    const size = Number.isInteger(requestedSize) && requestedSize >= 0 && requestedSize < sizes.length
        ? requestedSize
        : 0;

    let prices = sizes
        .map((s: any) => s.price)
        .sort((a: any, b: any) => a - b);

    let newProduct = {
        ...product,
        style,
        images: subProduct.images,
        sizes,
        discount: subProduct.discount,
        sku: subProduct.sku,
        colors: subProducts.map((p: any) => p.color),
        priceRange:
            subProduct.discount > 0
                ? `From ${(prices[0] - prices[0] / subProduct.discount).toFixed(
                      2
                  )} to ${(
                      prices[prices.length - 1] -
                      prices[prices.length - 1] / subProduct.discount
                  ).toFixed(2)} `
                : `From ${prices[0]} to ${prices[prices.length - 1]}$`,
        price:
            subProduct.discount > 0
                ? Number((
                      sizes[size].price -
                      sizes[size].price / subProduct.discount
                  ).toFixed(2))
                : sizes[size].price,
        priceBefore: sizes[size].price,
        quantity: sizes[size].qty,
        ratings: [
            {
                percentage: calculatePercentage("5"),
            },
            {
                percentage: calculatePercentage("4"),
            },
            {
                percentage: calculatePercentage("3"),
            },
            {
                percentage: calculatePercentage("2"),
            },
            {
                percentage: calculatePercentage("1"),
            },
        ],
        allSizes: subProducts
            .map((p: any) => p.sizes)
            .flat()
            .sort((a: any, b: any) => a.size - b.size)
            .filter(
                (element: any, index: any, array: any) =>
                    array.findIndex((el2: any) => el2.size === element.size) ===
                    index
            ),
    };
    
    function calculatePercentage(num: any) {
        if (!Array.isArray(product.reviews) || !product.reviews.length) {
            return "0.0";
        }
        return (
            (product.reviews.reduce((total: any, review: any) => {
                return (
                    total +
                    (review.rating == Number(num) ||
                        review.rating == Number(num) + 0.5)
                );
            }, 0) *
                100) /
            product.reviews.length
        ).toFixed(1);
    }

    return {
        props: {
            product: JSON.parse(JSON.stringify(newProduct)),
        },
    };
};
