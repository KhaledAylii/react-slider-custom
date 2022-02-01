import { ReactElement, useCallback, useEffect, useRef, useState } from "react";
import { slides as defaultSlides } from "./slides";

// percentage of carousel width user needs to drag in any direction before letting go to activate a navigation behaviour
const dragSensitivity = 0.3;

export const Carousel = ({
  slides = defaultSlides
}: {
  slides: ReactElement[];
}) => {
  const carouselRef = useRef<HTMLDivElement>(null);
  const [offsetX, setOffsetX] = useState(0);
  const [slide, setSlide] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  const draggingRef = useRef(false);
  const [startOffset, setStartOffset] = useState(0);
  const [startPosX, setStartPosX] = useState(0);

  // const moveToChapter = useCallback(() => {
  //   const distance = (chapter - 1) * 500 - offset;
  //   const direction = distance === 0 ? 0 : distance / Math.abs(distance);

  //   setDirection(direction);
  //   setOffset(offset + direction);
  // }, [offset, chapter]);

  // useEffect(() => {
  //   const distance = Math.abs((chapter - 1) * 500 - offset);
  //   if (distance !== 0) {
  //     setIsRunning(true);
  //     setTimeout(() => {
  //       moveToChapter();
  //     }, 3 - Math.max((distance - 300) / 100, 0));
  //   } else {
  //     setIsRunning(false);
  //   }
  // }, [offset, chapter, moveToChapter]);

  const animateToSlide = useCallback(
    (speed = 1) => {
      if (carouselRef.current) {
        setIsAnimating(true);
        const distance = -slide * carouselRef.current.clientWidth - offsetX;
        const direction = distance / Math.abs(distance) || 0;
        const pixelsPerFrame = distance > 10 ? direction * speed : direction;
        console.log(
          "dir",
          direction,
          "distance",
          distance,
          "pixelsperframe",
          pixelsPerFrame
        );
        setOffsetX(offsetX + pixelsPerFrame);
        setIsAnimating(false);
      }
    },
    [offsetX, setOffsetX, slide, carouselRef.current]
  );

  const handleNext = () => {
    const targetSlide = slide + 1;
    if (targetSlide < slides.length) {
      setSlide(targetSlide);
      // animateToSlide();
    }
  };

  const handlePrev = () => {
    const targetSlide = slide - 1;
    if (targetSlide >= 0) {
      setSlide(targetSlide);
      // animateToSlide();
    }
  };

  const clampOffsetToNearestSlide = useCallback(
    (delta = 0) => {
      if (carouselRef.current) {
        const clientWidth = carouselRef.current.clientWidth;
        const percentDelta = delta / clientWidth;
        if (Math.abs(percentDelta) > dragSensitivity) {
          console.log(percentDelta);
          const isDirectionNext = percentDelta < 0 ? true : false;
          if (isDirectionNext) {
            handleNext();
          } else {
            handlePrev();
          }
        }
      }
    },
    [carouselRef.current, handleNext, handlePrev]
  );

  useEffect(() => {
    let timeout: any;
    if (carouselRef.current) {
      const distance = -slide * carouselRef?.current?.clientWidth - offsetX;
      console.log(draggingRef.current);
    }
    if (
      !isAnimating &&
      carouselRef.current &&
      -slide * carouselRef.current.clientWidth - offsetX &&
      -slide * carouselRef.current.clientWidth - offsetX !== 0
    ) {
      timeout = setTimeout(() => {
        animateToSlide();
      }, 1);
    }
    return () => {
      clearTimeout(timeout);
    };
  }, [offsetX, animateToSlide, slide, isAnimating]);

  useEffect(() => {
    const handleMouseDown = (e: MouseEvent) => {
      // console.log("down");
      setStartOffset(offsetX);
      setStartPosX(e.offsetX);
      draggingRef.current = true;
    };
    const handleMouseUp = (e: any) => {
      if (draggingRef.current) {
        draggingRef.current = false;
        const delta = offsetX - startOffset;
        console.log("up", startOffset, offsetX, delta);
        clampOffsetToNearestSlide(delta);
      }
    };
    const handleMouseMove = (e: any) => {
      if (draggingRef.current) {
        console.log("move", e.clientX - startPosX, e.target.clientWidth);
        let delta = e.clientX - startPosX;
        const containerWidth = e.target.clientWidth;
        // if (delta !== 0) {
        //   delta = (delta / Math.abs(delta)) * 10;
        // }
        // if (delta !== 0) {
        // }
        // delta = (delta / Math.abs(delta)) * Math.min(Math.abs(delta), 100);
        setOffsetX(
          Math.max(
            Math.min(offsetX + delta, 0),
            -(slides.length - 1) * containerWidth
          )
        );
      }
    };
    document.addEventListener("mouseup", handleMouseUp);
    document.addEventListener("mousedown", handleMouseDown);
    if (carouselRef.current) {
      carouselRef.current.addEventListener("mousemove", handleMouseMove);
    }
    return () => {
      document.removeEventListener("mousedown", handleMouseDown);
      document.removeEventListener("mouseup", handleMouseUp);
      if (carouselRef.current) {
        carouselRef.current.removeEventListener("mousemove", handleMouseMove);
      }
    };
  }, [
    startPosX,
    offsetX,
    clampOffsetToNearestSlide,
    setStartOffset,
    slides.length,
    startOffset
  ]);
  return (
    <div className="carouselContainer" ref={carouselRef}>
      <div
        className="carouselInner"
        style={{ transform: `translateX(${offsetX}px)` }}
      >
        {slides?.map((slide) => slide)}
      </div>
    </div>
  );
};
