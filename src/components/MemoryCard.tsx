import jumiaLogo from "@/assets/jumia-logo.png";
import smartphoneImg from "@/assets/products/smartphone.png";
import sneakersImg from "@/assets/products/sneakers.png";
import watchImg from "@/assets/products/watch.png";
import laptopImg from "@/assets/products/laptop.png";
import headphonesImg from "@/assets/products/headphones.png";
import backpackImg from "@/assets/products/backpack.png";
import cameraImg from "@/assets/products/camera.png";
import sunglassesImg from "@/assets/products/sunglasses.png";

const PRODUCT_IMAGES: Record<string, string> = {
  smartphone: smartphoneImg,
  sneakers: sneakersImg,
  watch: watchImg,
  laptop: laptopImg,
  headphones: headphonesImg,
  backpack: backpackImg,
  camera: cameraImg,
  sunglasses: sunglassesImg,
};

interface MemoryCardProps {
  icon: string;
  imageUrl?: string;
  isFlipped: boolean;
  isMatched: boolean;
  animState: "idle" | "shake" | "match";
  onClick: () => void;
}

const MemoryCard = ({ icon, imageUrl, isFlipped, isMatched, animState, onClick }: MemoryCardProps) => {
  const animClass =
    animState === "shake" ? "animate-shake" :
      animState === "match" ? "animate-match-pop" : "";

  const productSrc = PRODUCT_IMAGES[icon];

  return (
    <button
      onClick={onClick}
      disabled={isFlipped || isMatched}
      className={`card-flip aspect-square w-full transition-transform active:scale-95 ${isMatched ? "opacity-50" : ""}`}
      aria-label={isFlipped ? `Card showing ${icon}` : "Face-down card"}
    >
      <div className={`card-inner relative w-full h-full ${isFlipped || isMatched ? "flipped" : ""}`}>
        {/* Back */}
        <div className="card-back absolute inset-0 rounded-2xl flex items-center justify-center shadow-lg cursor-pointer border-2" style={{ background: 'linear-gradient(to bottom right, #6ac1d5, #5ab0c4)', borderColor: 'rgba(106,193,213,0.3)' }}>
          <div className="absolute inset-1.5 rounded-xl border-2 border-primary-foreground/15" />
          <img src={jumiaLogo} alt="Jumia" className="w-14 h-14 sm:w-16 sm:h-16 object-contain drop-shadow-md" />
        </div>

        {/* Front */}
        <div
          className={`card-front absolute inset-0 rounded-2xl flex items-center justify-center shadow-lg transition-all border-2 ${
            isMatched
              ? "bg-success/5 border-success"
              : "bg-card border-border"
          } ${animClass}`}
        >
          {imageUrl ? (
            <img src={imageUrl} alt={icon} className="w-3/4 h-3/4 object-contain select-none drop-shadow-sm" />
          ) : productSrc ? (
            <img src={productSrc} alt={icon} className="w-3/4 h-3/4 object-contain select-none drop-shadow-sm" />
          ) : (
            <span className="text-4xl sm:text-5xl select-none drop-shadow-sm">{icon}</span>
          )}
          {isMatched && (
            <div className="absolute -top-1.5 -right-1.5 bg-success text-success-foreground rounded-full p-1 shadow-md">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </div>
          )}
        </div>
      </div>
    </button>
  );
};

export default MemoryCard;
