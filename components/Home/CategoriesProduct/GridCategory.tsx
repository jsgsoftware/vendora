import Image from "next/image";
import Link from "next/link";

const GridCategory = ({ category, products, gridCols}: any) => {
    const length = gridCols * gridCols;
    const selectedProducts = products
        .filter((product: any) => String(product.category?._id) === String(category._id))
        .slice(0, length);

    const gridClass = gridCols === 2 ? "grid grid-cols-2 gap-4 m-1 items-center" : "grid grid-cols-1 gap-4 m-1 items-center";

    return ( 
        <div className="flex flex-col bg-white border rounded p-2">
                <h3 className="font-bold my-2 uppercase">{category.name}</h3>
                <div className={`h-full ${gridClass}`}>
                
                {selectedProducts.map((product: any) => (
                        <Link href={`/product/${product.slug}`} key={product._id}>
                            <div className={`relative  ${length > 1 ? 'h-[200px]' : 'h-[420px]'}`}>
                                <Image
                                    src={product.subProducts[0].images[0].url}
                                    alt={product.name}
                                    fill
                                    className="object-cover rounded"
                                />  
                            </div>
                            {length > 1 && (<h4 className="text-xs mt-1">{product.name}</h4>)}
                        </Link>
                    ))}

                

                </div>
                {length > 1 ? (
                    <h4 className="text-xs cursor-pointer hover:underline text-blue-500 my-2">See more</h4>
                ) : (
                    <h4 className="text-xs cursor-pointer hover:underline text-blue-500 my-2">Shop now</h4>
                )}
        </div>
     );
}
 
export default GridCategory;
