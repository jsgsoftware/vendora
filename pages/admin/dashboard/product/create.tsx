import Layout from "@/components/admin/layout/Layout";
import CreateProduct from "@/components/admin/product/CreateProduct";
import db from "../../../../utils/db";
import Category from "../../../../models/Category";
import { useEffect, useState } from "react";
import axios from "axios";
import { requirePortalSession } from "@/utils/portalAuth";

const initialState = {
    name: "",
    description: "",
    productType: "physical",
    brand: "",
    weight: 0,
    sku: "",
    discount: 0,
    images: [],
    description_images: [],
    parent: "",
    category: "",
    subCategories: [],
    color: {
        color: "",
        image: "",
    },
    sizes: [
        {
            size: "",
            qty: "",
            price: "",
        },
    ],
    details: [
        {
            name: "",
            value: "",
        },
    ],
    questions: [
        {
            question: "",
            answer: "",
        },
    ],
    shippingFee: "",
    bookingType: "date_time",
    bookingDuration: "60",
    subscriptionIntervals: [],
    subscriptionDeliveries: [],
};

const Create = ({ categories }: any) => {
    const [product, setProduct] = useState(initialState);
    const [subs, setSubs] = useState([]);
    const [colorImage, setColorImage] = useState("");
    const [images, setImages] = useState([]);
    const [description_images, setDescription_images] = useState("");
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        async function getSubs() {
            if (!product.category) {
                setSubs([]);
                return;
            }
            try {
                const { data } = await axios.get("/api/admin/subcategory", {
                    params: {
                        category: product.category,
                    },
                });
                setSubs(Array.isArray(data) ? data : []);
            } catch {
                setSubs([]);
            }
        }
        getSubs();
    }, [product.category]);

    return (
        <Layout>
            <CreateProduct
                product={product}
                setProduct={setProduct}
                categories={categories}
                subs={subs}
                images={images}
                setImages={setImages}
                setColorImage={setColorImage}
                colorImage={colorImage}
                setLoading={setLoading}
                loading={loading}
                initialProduct={initialState}
            />
        </Layout>
    );
};

export default Create;

export async function getServerSideProps(ctx: any) {
    const auth = await requirePortalSession(ctx, ["admin"]);
    if (!auth.ok) {
        return auth.redirect;
    }

    db.connectDb();
    const categories = (await Category.find().lean()).filter(
        (cat: any) => (cat?.status || "active") === "active"
    );
    db.disconnectDb();

    return {
        props: {
            categories: JSON.parse(JSON.stringify(categories)),
        },
    };
}
