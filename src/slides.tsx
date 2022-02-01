export const slide = (number: number) => (
  <div className="slide">Slide {number}</div>
);
export const slides = [...new Array(5)].map((_, index) => slide(index + 1));
