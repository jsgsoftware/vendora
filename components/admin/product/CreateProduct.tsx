import { Field, Form, Formik } from "formik";
import Image from "next/image";
import DialogModal from "@/components/dialogModal";
import { useDispatch } from "react-redux";
import { showDialog } from "@/redux/slices/DialogSlice";
import ImagesProduct from "./images/ImagesProduct";
import Style from "./style/Style";
import { validateCreateProduct } from "../../../utils/validation";
import dataURItoBlob from "../../../utils/dataURItoBlob";
import { uploadImages } from "../../../request/upload";
import axios from "axios";
import Link from "next/link";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";
import { useEffect, useRef, useState } from "react";

const PRODUCT_TYPES = [
    { value: "physical", label: "Fisico" },
    { value: "digital", label: "Digital" },
    { value: "booking", label: "Reserva" },
    { value: "subscription", label: "Suscripcion" },
    { value: "other", label: "Otros" },
];

const SUBSCRIPTION_INTERVALS = [
    { value: "weekly", label: "Cada semana" },
    { value: "biweekly", label: "Cada 2 semanas" },
    { value: "monthly", label: "Cada 4 semanas" },
];

const SUBSCRIPTION_DELIVERIES = [
    { value: "4", label: "4 veces" },
    { value: "8", label: "8 veces" },
    { value: "12", label: "12 veces" },
];

const CreateProduct = ({
    product,
    setProduct,
    categories,
    subs,
    images,
    setImages,
    setColorImage,
    colorImage,
    setLoading,
    loading,
    initialProduct,
}: any) => {
    const dispatch = useDispatch();
    const [subCategoryOpen, setSubCategoryOpen] = useState(false);
    const [subCategoryQuery, setSubCategoryQuery] = useState("");
    const subCategoryBoxRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (!subCategoryBoxRef.current) return;
            if (!subCategoryBoxRef.current.contains(event.target as Node)) {
                setSubCategoryOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const CreateProduct = async () => {
        let test = validateCreateProduct(product, images);
        if (test == "valid") {
            createProductHnadler();
        } else {
            dispatch(
                showDialog({
                    header: "Please follow our instructions.",
                    msgs: test,
                })
            );
        }
    };

    let uploaded_images: any = [];
    let style_img = "";
    const createProductHnadler = async () => {
        setLoading(true);
        if (images) {
            let temp = images.map((img: any) => {
                return dataURItoBlob(img);
            });
            const path = "product images";
            let formData = new FormData();
            formData.append("path", path);
            temp.forEach((image: any) => {
                formData.append("file", image);
            });
            uploaded_images = await uploadImages(formData);
            console.log("uploaded images: ", uploaded_images);
        }
        if (product.color.image) {
            let temp = dataURItoBlob(product.color.image);
            let path = "product style images";
            let formData = new FormData();
            formData.append("path", path);
            formData.append("file", temp);
            let cloudinary_style_img = await uploadImages(formData);
            style_img = cloudinary_style_img[0].url;
            console.log("uploaded style image: ", style_img);
        }
        try {
            const detailsPayload = buildDetailsPayload();
            const { data } = await axios.post("/api/admin/product/product", {
                ...product,
                details: detailsPayload,
                images: uploaded_images,
                color: {
                    color: product.color.color,
                    image: style_img,
                },
            });
            setProduct(initialProduct);
            setImages([]);
            setColorImage("");
            dispatch(
                showDialog({
                    header: "post created.",
                    msgs:[{
                        msg: data.message,
                        type: "success",
                    }],
                })
            );
            setLoading(false);
        } catch (error: any) {
            setLoading(false);
            console.log(error.response.data.message);
        }
    };

    const handleChange = (e: any) => {
        const { value, name } = e.target;
        setProduct({
            ...product,
            [name]: value,
        });
    };

    const toggleSubCategory = (subId: string) => {
        const current = Array.isArray(product.subCategories) ? product.subCategories : [];
        const exists = current.includes(subId);
        setProduct({
            ...product,
            subCategories: exists ? current.filter((id: string) => id !== subId) : [...current, subId],
        });
    };

    const handleMultiToggle = (field: "subscriptionIntervals" | "subscriptionDeliveries", value: string) => {
        const current = Array.isArray(product[field]) ? product[field] : [];
        const exists = current.includes(value);
        setProduct({
            ...product,
            [field]: exists ? current.filter((item: string) => item !== value) : [...current, value],
        });
    };

    const selectedSubCategories = subs.filter((item: any) => (product.subCategories || []).includes(item._id));
    const filteredSubCategories = subs.filter((item: any) => {
        const name = String(item?.name || "").toLowerCase();
        return name.includes(subCategoryQuery.toLowerCase());
    });

    const handleStockChange = (key: "qty" | "price" | "size", value: string) => {
        const nextSizes = [...(product.sizes || [])];
        if (!nextSizes.length) {
            nextSizes.push({ size: "", qty: "", price: "" });
        }
        nextSizes[0] = {
            ...nextSizes[0],
            [key]: value,
        };
        setProduct({
            ...product,
            sizes: nextSizes,
        });
    };

    const buildDetailsPayload = () => {
        const cleanDetails = Array.isArray(product.details)
            ? product.details.filter((item: any) => item?.name || item?.value)
            : [];

        const typeMeta = [
            { name: "__type", value: product.productType || "physical" },
            { name: "__weight", value: String(product.weight || 0) },
            { name: "__bookingType", value: String(product.bookingType || "") },
            {
                name: "__bookingDuration",
                value: product.bookingType === "date_time" ? String(product.bookingDuration || "") : "",
            },
            {
                name: "__subscriptionIntervals",
                value: JSON.stringify(Array.isArray(product.subscriptionIntervals) ? product.subscriptionIntervals : []),
            },
            {
                name: "__subscriptionDeliveries",
                value: JSON.stringify(Array.isArray(product.subscriptionDeliveries) ? product.subscriptionDeliveries : []),
            },
        ];

        return [...cleanDetails, ...typeMeta];
    };

    return (
        <div className="p-4 md:p-8">
            <div className="mb-6 flex items-center gap-3">
                <Link href="/admin/dashboard/product" className="rounded-md border border-vendora bg-white p-2 text-vendora-ink hover:bg-vendora-accent-soft">
                    <ArrowLeftIcon className="h-4 w-4" />
                </Link>
                <div>
                    <h1 className="text-2xl font-bold text-vendora-ink">Producto</h1>
                    <p className="text-sm text-slate-500">Configura detalles, inventario e imAgenes.</p>
                </div>
            </div>

            <DialogModal />
            <Formik
                enableReinitialize
                initialValues={{
                    name: product.name,
                    brand: product.brand,
                    description: product.description,
                    category: product.category,
                    subCategories: product.subCategories,
                    parent: product.parent,
                    sku: product.sku,
                    discount: product.discount,
                    color: product.color.color,
                    imageInputFile: "",
                    styleInput: "",
                }}
                onSubmit={() => {
                    CreateProduct();
                }}
            >
                {() => (
                    <Form>
                        <Field name="imageInputFile" type="hidden" />
                        <Field name="styleInput" type="hidden" />

                        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
                            <div className="space-y-4">
                                <section className="rounded-xl border border-vendora bg-white p-4">
                                    <h2 className="mb-4 text-sm font-semibold text-vendora-ink">Informacion basica</h2>
                                    <div className="grid gap-3 sm:grid-cols-2">
                                        <div className="sm:col-span-2">
                                            <label className="mb-1 block text-xs font-medium text-slate-600">Nombre *</label>
                                            <input
                                                type="text"
                                                name="name"
                                                value={product.name}
                                                onChange={handleChange}
                                                placeholder="Nombre del producto"
                                                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-vendora-accent"
                                            />
                                        </div>
                                        <div>
                                            <label className="mb-1 block text-xs font-medium text-slate-600">Tipo</label>
                                            <select
                                                name="productType"
                                                value={product.productType || "physical"}
                                                onChange={handleChange}
                                                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-vendora-accent"
                                            >
                                                {PRODUCT_TYPES.map((type) => (
                                                    <option key={type.value} value={type.value}>{type.label}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="mb-1 block text-xs font-medium text-slate-600">Categoria *</label>
                                            <select
                                                name="category"
                                                value={product.category}
                                                onChange={(e) => {
                                                    const value = e.target.value;
                                                    setProduct({
                                                        ...product,
                                                        category: value,
                                                        subCategories: [],
                                                    });
                                                }}
                                                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-vendora-accent"
                                            >
                                                <option value="">Selecciona categoria</option>
                                                {categories.map((item: any) => (
                                                    <option key={item._id} value={item._id}>{item.name}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="mb-1 block text-xs font-medium text-slate-600">Marca *</label>
                                            <input
                                                type="text"
                                                name="brand"
                                                value={product.brand}
                                                onChange={handleChange}
                                                placeholder="Marca"
                                                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-vendora-accent"
                                            />
                                        </div>
                                        <div>
                                            <label className="mb-1 block text-xs font-medium text-slate-600">Peso</label>
                                            <input
                                                type="number"
                                                name="weight"
                                                value={product.weight ?? 0}
                                                onChange={handleChange}
                                                placeholder="0"
                                                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-vendora-accent"
                                            />
                                        </div>
                                        <div className="sm:col-span-2">
                                            <label className="mb-1 block text-xs font-medium text-slate-600">Subcategorias</label>
                                            {!product.category ? (
                                                <div className="rounded-md border border-dashed border-slate-300 px-3 py-2 text-sm text-slate-500">
                                                    Primero selecciona una categoria.
                                                </div>
                                            ) : (
                                                <div ref={subCategoryBoxRef} className="relative">
                                                    <div
                                                        className="min-h-[42px] w-full rounded-md border border-slate-300 px-2 py-1 text-sm focus-within:border-vendora-accent"
                                                        onClick={() => setSubCategoryOpen(true)}
                                                    >
                                                        <div className="flex flex-wrap items-center gap-1">
                                                            {selectedSubCategories.map((item: any) => (
                                                                <span
                                                                    key={item._id}
                                                                    className="inline-flex items-center gap-1 rounded-full border border-slate-300 bg-slate-100 px-2 py-0.5 text-xs text-slate-700"
                                                                >
                                                                    {item.name}
                                                                    <button
                                                                        type="button"
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            toggleSubCategory(item._id);
                                                                        }}
                                                                        className="text-slate-500 hover:text-slate-700"
                                                                        aria-label={`Quitar ${item.name}`}
                                                                    >
                                                                        x
                                                                    </button>
                                                                </span>
                                                            ))}
                                                            <input
                                                                type="text"
                                                                value={subCategoryQuery}
                                                                onFocus={() => setSubCategoryOpen(true)}
                                                                onChange={(e) => {
                                                                    setSubCategoryQuery(e.target.value);
                                                                    setSubCategoryOpen(true);
                                                                }}
                                                                placeholder={selectedSubCategories.length ? "Buscar subcategoria" : "Buscar o seleccionar subcategoria"}
                                                                className="min-w-[160px] flex-1 bg-transparent px-1 py-1 text-sm outline-none"
                                                            />
                                                        </div>
                                                    </div>

                                                    {subCategoryOpen && (
                                                        <div className="absolute z-20 mt-1 max-h-56 w-full overflow-auto rounded-md border border-slate-200 bg-white py-1 shadow-lg">
                                                            {filteredSubCategories.length ? (
                                                                filteredSubCategories.map((item: any) => {
                                                                    const checked = (product.subCategories || []).includes(item._id);
                                                                    return (
                                                                        <button
                                                                            key={item._id}
                                                                            type="button"
                                                                            onClick={() => {
                                                                                toggleSubCategory(item._id);
                                                                                setSubCategoryQuery("");
                                                                            }}
                                                                            className={`flex w-full items-center justify-between px-3 py-2 text-left text-sm ${
                                                                                checked
                                                                                    ? "bg-vendora-accent-soft text-vendora-ink"
                                                                                    : "text-slate-700 hover:bg-slate-50"
                                                                            }`}
                                                                        >
                                                                            <span>{item.name}</span>
                                                                            {checked ? <span className="text-xs">Seleccionada</span> : null}
                                                                        </button>
                                                                    );
                                                                })
                                                            ) : (
                                                                <div className="px-3 py-2 text-sm text-slate-500">No hay coincidencias.</div>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </section>

                                <section className="rounded-xl border border-vendora bg-white p-4">
                                    <h2 className="mb-4 text-sm font-semibold text-vendora-ink">Stock</h2>
                                    <div className="grid gap-3 sm:grid-cols-3">
                                        <div>
                                            <label className="mb-1 block text-xs font-medium text-slate-600">SKU *</label>
                                            <input
                                                type="text"
                                                name="sku"
                                                value={product.sku}
                                                onChange={handleChange}
                                                placeholder="SKU"
                                                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-vendora-accent"
                                            />
                                        </div>
                                        <div>
                                            <label className="mb-1 block text-xs font-medium text-slate-600">Cantidad *</label>
                                            <input
                                                type="number"
                                                value={product?.sizes?.[0]?.qty || ""}
                                                onChange={(e) => handleStockChange("qty", e.target.value)}
                                                placeholder="0"
                                                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-vendora-accent"
                                            />
                                        </div>
                                        <div>
                                            <label className="mb-1 block text-xs font-medium text-slate-600">Precio *</label>
                                            <input
                                                type="number"
                                                value={product?.sizes?.[0]?.price || ""}
                                                onChange={(e) => handleStockChange("price", e.target.value)}
                                                placeholder="0"
                                                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-vendora-accent"
                                            />
                                        </div>
                                        <div>
                                            <label className="mb-1 block text-xs font-medium text-slate-600">Talla (opcional)</label>
                                            <input
                                                type="text"
                                                value={product?.sizes?.[0]?.size || ""}
                                                onChange={(e) => handleStockChange("size", e.target.value)}
                                                placeholder="Ej: S, M, XL"
                                                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-vendora-accent"
                                            />
                                        </div>
                                        <div>
                                            <label className="mb-1 block text-xs font-medium text-slate-600">Descuento</label>
                                            <input
                                                type="number"
                                                name="discount"
                                                value={product.discount}
                                                onChange={handleChange}
                                                placeholder="0"
                                                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-vendora-accent"
                                            />
                                        </div>
                                        <div>
                                            <label className="mb-1 block text-xs font-medium text-slate-600">Precio original</label>
                                            <input
                                                type="number"
                                                value={product?.sizes?.[0]?.price || ""}
                                                onChange={(e) => handleStockChange("price", e.target.value)}
                                                placeholder="0"
                                                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-vendora-accent"
                                            />
                                        </div>
                                    </div>
                                </section>

                                {product.productType === "booking" && (
                                    <section className="rounded-xl border border-vendora bg-white p-4">
                                        <h2 className="mb-4 text-sm font-semibold text-vendora-ink">Reserva</h2>
                                        <div className="grid gap-3 sm:grid-cols-2">
                                            <div>
                                                <label className="mb-1 block text-xs font-medium text-slate-600">Tipo de reserva</label>
                                                <select
                                                    name="bookingType"
                                                    value={product.bookingType || "date_time"}
                                                    onChange={(e) => {
                                                        const value = e.target.value;
                                                        setProduct({
                                                            ...product,
                                                            bookingType: value,
                                                            bookingDuration: value === "date_time" ? (product.bookingDuration || "60") : "",
                                                        });
                                                    }}
                                                    className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-vendora-accent"
                                                >
                                                    <option value="date_time">Fecha y hora</option>
                                                    <option value="date_only">Solo fecha</option>
                                                </select>
                                            </div>
                                            {product.bookingType === "date_time" && (
                                                <div>
                                                    <label className="mb-1 block text-xs font-medium text-slate-600">Duracion</label>
                                                    <select
                                                        name="bookingDuration"
                                                        value={product.bookingDuration || "60"}
                                                        onChange={handleChange}
                                                        className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-vendora-accent"
                                                    >
                                                        <option value="30">30 min</option>
                                                        <option value="60">1 hora</option>
                                                        <option value="90">1.5 horas</option>
                                                        <option value="120">2 horas</option>
                                                    </select>
                                                </div>
                                            )}
                                        </div>
                                    </section>
                                )}

                                {product.productType === "subscription" && (
                                    <section className="rounded-xl border border-vendora bg-white p-4">
                                        <h2 className="mb-4 text-sm font-semibold text-vendora-ink">Opciones de suscripcion</h2>
                                        <div className="space-y-4">
                                            <div>
                                                <p className="mb-2 text-sm font-medium text-slate-700">Intervalos de entrega</p>
                                                <div className="grid gap-2 sm:grid-cols-3">
                                                    {SUBSCRIPTION_INTERVALS.map((item) => (
                                                        <label key={item.value} className="flex items-center gap-2 rounded-md border border-slate-200 px-3 py-2 text-sm">
                                                            <input
                                                                type="checkbox"
                                                                checked={(product.subscriptionIntervals || []).includes(item.value)}
                                                                onChange={() => handleMultiToggle("subscriptionIntervals", item.value)}
                                                            />
                                                            {item.label}
                                                        </label>
                                                    ))}
                                                </div>
                                            </div>
                                            <div>
                                                <p className="mb-2 text-sm font-medium text-slate-700">Numero de entregas</p>
                                                <div className="grid gap-2 sm:grid-cols-3">
                                                    {SUBSCRIPTION_DELIVERIES.map((item) => (
                                                        <label key={item.value} className="flex items-center gap-2 rounded-md border border-slate-200 px-3 py-2 text-sm">
                                                            <input
                                                                type="checkbox"
                                                                checked={(product.subscriptionDeliveries || []).includes(item.value)}
                                                                onChange={() => handleMultiToggle("subscriptionDeliveries", item.value)}
                                                            />
                                                            {item.label}
                                                        </label>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </section>
                                )}

                                <section className="rounded-xl border border-vendora bg-white p-4">
                                    <h2 className="mb-2 text-sm font-semibold text-vendora-ink">Descripcion</h2>
                                    <textarea
                                        name="description"
                                        value={product.description}
                                        onChange={handleChange}
                                        placeholder="Describe el producto"
                                        className="h-28 w-full resize-none rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-vendora-accent"
                                    />
                                </section>

                                <section className="rounded-xl border border-vendora bg-white p-4">
                                    <ImagesProduct
                                        name="imageInputFile"
                                        header="Imagenes"
                                        text="Agregar imagenes"
                                        images={images}
                                        setImages={setImages}
                                        setColorImage={setColorImage}
                                    />
                                    <div className="mt-4 border-t pt-4">
                                        <h3 className="mb-2 text-sm font-semibold text-vendora-ink">Pick estilo (obligatorio)</h3>
                                        {product.color.image && (
                                            <div className="mb-3 relative h-16 w-16 overflow-hidden rounded border border-slate-200">
                                                <Image src={product.color.image} alt="style-image" fill className="object-cover" />
                                            </div>
                                        )}
                                        <Style
                                            name="styleInput"
                                            product={product}
                                            setProduct={setProduct}
                                            colorImage={colorImage}
                                        />
                                    </div>
                                </section>

                                <button
                                    disabled={loading}
                                    type="submit"
                                    className={`w-44 rounded-md px-4 py-2 text-sm font-medium text-white ${loading ? "bg-slate-400" : "bg-vendora-accent hover:opacity-90"}`}
                                >
                                    {loading ? "Guardando..." : "Guardar"}
                                </button>
                            </div>

                            <aside className="space-y-4">
                                <section className="rounded-xl border border-vendora bg-white p-4">
                                    <h3 className="mb-3 text-sm font-semibold text-vendora-ink">Disponibilidad</h3>
                                    <label className="mb-2 flex items-center justify-between text-sm text-slate-600">
                                        <span>Visible</span>
                                        <input type="checkbox" defaultChecked className="h-4 w-4" />
                                    </label>
                                    <label className="mb-2 flex items-center justify-between text-sm text-slate-600">
                                        <span>Marcar como agotado</span>
                                        <input type="checkbox" className="h-4 w-4" />
                                    </label>
                                    <p className="text-xs text-slate-500">Puedes ajustar esta configuraciOn luego desde Products.</p>
                                </section>

                                <section className="rounded-xl border border-vendora bg-white p-4">
                                    <h3 className="mb-3 text-sm font-semibold text-vendora-ink">Inventario</h3>
                                    <p className="text-sm text-slate-600">La talla es opcional. Solo debes completar SKU, cantidad y precio.</p>
                                </section>

                                <section className="rounded-xl border border-vendora bg-white p-4">
                                    <h3 className="mb-2 text-sm font-semibold text-vendora-ink">Etiquetas</h3>
                                    <input
                                        type="text"
                                        value={product.brand}
                                        onChange={(e) => setProduct({ ...product, brand: e.target.value })}
                                        placeholder="ej: nuevo, promo"
                                        className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-vendora-accent"
                                    />
                                </section>
                            </aside>
                        </div>
                    </Form>
                )}
            </Formik>
        </div>
    );
};

export default CreateProduct;
