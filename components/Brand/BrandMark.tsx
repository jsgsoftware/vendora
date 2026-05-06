type BrandMarkProps = {
    size?: "sm" | "md" | "lg";
    light?: boolean;
    className?: string;
};

const sizeMap = {
    sm: {
        brand: "text-[1.95rem]",
        smile: "w-10 h-4",
        smileDots: "w-1.5 h-1.5",
        spacing: "gap-1",
    },
    md: {
        brand: "text-[2.6rem]",
        smile: "w-12 h-5",
        smileDots: "w-2 h-2",
        spacing: "gap-1.5",
    },
    lg: {
        brand: "text-[3.4rem]",
        smile: "w-16 h-6",
        smileDots: "w-2.5 h-2.5",
        spacing: "gap-2",
    },
};

export default function BrandMark({
    size = "md",
    light = false,
    className = "",
}: BrandMarkProps) {
    const styles = sizeMap[size];
    const textColor = light ? "text-white" : "text-[#0B1A33]";

    return (
        <span className={`inline-flex items-end ${styles.spacing} ${className}`}>
            <span className={`${styles.brand} ${textColor} font-black leading-none tracking-[-0.04em]`}>
                vendor
            </span>
            <span className="relative inline-flex items-end">
                <span className={`${styles.brand} font-black leading-none tracking-[-0.04em] bg-gradient-to-b from-[#B06CFF] to-[#7B2FF7] bg-clip-text text-transparent`}>
                    a
                </span>
                <span className={`absolute ${styles.smileDots} rounded-full bg-[#7B2FF7] left-[10%] -bottom-[14%]`} />
                <span className={`absolute ${styles.smileDots} rounded-full bg-[#7B2FF7] left-[36%] -bottom-[14%]`} />
                <span className={`absolute ${styles.smile} border-b-[4px] border-[#7B2FF7] rounded-full left-[-2%] -bottom-[44%]`} />
            </span>
        </span>
    );
}
