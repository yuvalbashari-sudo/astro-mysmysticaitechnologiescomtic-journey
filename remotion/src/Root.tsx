import { Composition } from "remotion";
import { NewAstralTransformationScene } from "./NewAstralTransformationScene";

export const RemotionRoot = () => (
  <Composition
    id="promo-ad"
    component={NewAstralTransformationScene}
    durationInFrames={300}
    fps={30}
    width={1080}
    height={1920}
  />
);
