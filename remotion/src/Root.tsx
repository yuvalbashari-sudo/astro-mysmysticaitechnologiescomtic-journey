import { Composition } from "remotion";
import { PromoAd } from "./PromoAd";

export const RemotionRoot = () => (
  <Composition
    id="promo-ad"
    component={PromoAd}
    durationInFrames={180}
    fps={30}
    width={1080}
    height={1920}
  />
);
