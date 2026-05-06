import "react-responsive-carousel/lib/styles/carousel.min.css"; // requires a loader
import { Carousel } from "react-responsive-carousel";
import { CSSProperties } from "react";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/outline";

const defaultSlides = [
    { image: "/assets/images/slider-1.jpg", href: "/", alt: "slider 1" },
    { image: "/assets/images/slider-2.jpg", href: "/", alt: "slider 2" },
    { image: "/assets/images/slider-3.jpg", href: "/", alt: "slider 3" },
    { image: "/assets/images/slider-4.jpg", href: "/", alt: "slider 4" },
    { image: "/assets/images/slider-5.jpg", href: "/", alt: "slider 5" },
];

const CarouselContainer = ({ slides = [] }: any) => {
    const arrowStyles: CSSProperties = {
        position: "absolute",
        zIndex: 2,
        top: "calc(30% - 15px)",
        width: 50,
        height: 50,
        cursor: "pointer",
        filter: "drop-shadow(1px 3px 1px rgb(255 255 255 / 0.8))",
        color: "#404040",
    };

    const activeSlides = Array.isArray(slides) && slides.length
        ? slides.filter((slide: any) => slide?.image)
        : defaultSlides;

    return (
        <div className="relative">
            <Carousel
                renderArrowPrev={(onClickHandler, hasPrev, label) =>
                    hasPrev && (
                        <button
                            className=""
                            type="button"
                            onClick={onClickHandler}
                            title={label}
                            style={{ ...arrowStyles, left: 15 }}
                        >
                            <ChevronLeftIcon />
                        </button>
                    )
                }
                renderArrowNext={(onClickHandler, hasNext, label) =>
                    hasNext && (
                        <button
                            type="button"
                            onClick={onClickHandler}
                            title={label}
                            style={{ ...arrowStyles, right: 15 }}
                        >
                            <ChevronRightIcon />
                        </button>
                    )
                }
                showStatus={false}
                showArrows={true}
                infiniteLoop={true}
                emulateTouch={true}
                autoPlay={true}
                showIndicators={false}
                showThumbs={false}
            >
                {activeSlides.map((slide: any, index: number) => (
                    <div key={`${slide.image}-${index}`}>
                        <a href={slide?.href || "/"}>
                            <img
                                src={slide.image}
                                alt={slide?.alt || `slider ${index + 1}`}
                                className="w-full h-[240px] sm:h-[300px] md:h-[380px] lg:h-[460px] object-cover object-top"
                            />
                        </a>
                    </div>
                ))}
            </Carousel>
            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-gradient-to-b from-transparent to-gray-100" />
        </div>
    );
};

export default CarouselContainer;
