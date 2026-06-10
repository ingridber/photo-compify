import styles from "./featured-slider.module.css";
import { useEffect, Children } from "react";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import type { ReactNode } from "react";

type FeaturedSliderProps = {
    children: ReactNode;
    autoplayDelay?: number;
};

export default function FeaturedSlider({ children, autoplayDelay = 5000, }: FeaturedSliderProps) {
    const itemCount = Children.count(children);
    const [emblaRef, emblaApi] = useEmblaCarousel({
        align: "center",
        dragFree: false,
        loop: false,
    },
        [ Autoplay({
                delay: autoplayDelay,
                stopOnMouseEnter: true,
                stopOnInteraction: false,
            }),]);

    useEffect(() => {
        if (!emblaApi) return;
        if (itemCount > 3) {emblaApi.scrollTo(1, false);}
    }, [emblaApi, itemCount]);

    const isSingleItem = itemCount < 2;

    return (
        <div className={styles.embla}>
            <div ref={emblaRef} className={`${styles.viewport} ${isSingleItem ? styles.centered : ""}`}>
                <div className={styles.container}>
                    {children}
                </div>
            </div>

            {!isSingleItem && (
                <div className={styles.btnContainer}>
                    <button className={styles.prevBtn} onClick={() => emblaApi?.scrollPrev()}>
                        <img src="./icons/arrow.svg" alt="previous slide" />
                    </button>
                    <button className={styles.nextBtn} onClick={() => emblaApi?.scrollNext()}>
                        <img src="./icons/arrow.svg" alt="next slide" />
                    </button>
                </div>
            )}
        </div>
    );
}