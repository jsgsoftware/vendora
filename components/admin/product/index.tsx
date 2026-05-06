import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";

const AllProcuct = ({ products }: any) => {
    const [query, setQuery] = useState("");

    const filteredProducts = useMemo(() => {
        const needle = String(query || "").toLowerCase();
        if (!needle) {
            return products || [];
        }
        return (products || []).filter((product: any) => {
            const sku = product?.subProducts?.[0]?.sku || "";
            return (
                String(product?.name || "").toLowerCase().includes(needle) ||
                String(sku).toLowerCase().includes(needle)
            );
        });
    }, [products, query]);

    return (
        <div className="my-4 p-4 md:p-6">
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-vendora-ink">Products</h2>
                <div className="flex gap-2">
                    <button className="px-3 py-2 text-sm border rounded-md bg-white">Import</button>
                    <button className="px-3 py-2 text-sm border rounded-md bg-white">Bulk Edit</button>
                    <Link
                        href="/admin/dashboard/product/create"
                        className="text-sm bg-vendora-accent text-white px-3 py-2 rounded-md hover:opacity-90"
                    >
                        Add Product
                    </Link>
                </div>
            </div>

            <div className="bg-white rounded-xl border overflow-hidden">
                <div className="p-3 border-b flex items-center justify-between gap-3">
                    <div className="relative flex-1 max-w-2xl">
                        <MagnifyingGlassIcon className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            className="w-full border rounded-md pl-9 pr-3 py-2 text-sm"
                            placeholder="Search by product name or SKU"
                        />
                    </div>
                    <button className="px-3 py-2 text-sm border rounded-md">Export</button>
                </div>

                <div className="overflow-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-gray-50 text-gray-600">
                            <tr>
                                <th className="p-3 text-left">Name</th>
                                <th className="p-3 text-left">Price</th>
                                <th className="p-3 text-left">Inventory</th>
                                <th className="p-3 text-left">Visibility</th>
                                <th className="p-3 text-left">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredProducts.map((product: any, i: number) => {
                                const image = product?.subProducts?.[0]?.images?.[0]?.url || "/assets/images/no-image.png";
                                const sku = product?.subProducts?.[0]?.sku || "-";
                                const prices = (product?.subProducts || [])
                                    .flatMap((sp: any) => sp?.sizes || [])
                                    .map((s: any) => Number(s?.price || 0));
                                const qty = (product?.subProducts || [])
                                    .flatMap((sp: any) => sp?.sizes || [])
                                    .reduce((sum: number, s: any) => sum + Number(s?.qty || 0), 0);
                                const minPrice = prices.length ? Math.min(...prices) : 0;
                                const created = new Date(product.createdAt);

                                return (
                                    <tr className="border-t" key={i}>
                                        <td className="p-3">
                                            <div className="flex items-center gap-3">
                                                <div className="relative w-14 h-14 rounded border overflow-hidden bg-gray-50">
                                                    <Image fill src={image} alt={product.name} className="object-cover" />
                                                </div>
                                                <div>
                                                    <p className="font-medium text-vendora-ink">{product.name}</p>
                                                    <p className="text-xs text-gray-500">SKU: {sku}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-3">${minPrice.toFixed(2)}</td>
                                        <td className="p-3">{qty}</td>
                                        <td className="p-3">
                                            <span className="text-[11px] px-2 py-1 rounded-full bg-green-100 text-green-700">VISIBLE</span>
                                        </td>
                                        <td className="p-3">
                                            <Link href={`/product/${product.slug}`} target="_blank" className="text-blue-600 hover:underline text-xs">View</Link>
                                            <div className="text-xs text-gray-500 mt-1">{`${created.getFullYear()}-${created.getMonth() + 1}-${created.getDate()}`}</div>
                                        </td>
                                    </tr>
                                );
                            })}
                            {!filteredProducts.length && (
                                <tr>
                                    <td colSpan={5} className="p-8 text-center text-gray-500">No products found.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                <div className="p-3 border-t text-sm text-gray-600">Total {filteredProducts.length}</div>
            </div>
        </div>
    );
};

export default AllProcuct;
