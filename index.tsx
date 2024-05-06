import React, { memo, useCallback } from "react";
import { Path } from "react-native-svg";
import differenceWith from "ramda/src/differenceWith";

import { bodyFront } from "./assets/bodyFront";
import { bodyBack } from "./assets/bodyBack";
import { SvgMaleWrapper } from "./components/SvgMaleWrapper";
import { bodyFemaleFront } from "./assets/bodyFemaleFront";
import { bodyFemaleBack } from "./assets/bodyFemaleBack";
import { SvgFemaleWrapper } from "./components/SvgFemaleWrapper";
import { SkinType, skinColorMapping } from './assets/skinTypes'

export type Slug =
  | "abs"
  | "adductors"
  | "ankles"
  | "biceps"
  | "calves"
  | "chest"
  | "shoulders"
  | "shoulders"
  | "feet"
  | "forearm"
  | "genitals"
  | "gluteal"
  | "hamstring"
  | "hands"
  | "hair"
  | "head"
  | "knees"
  | "lower-back"
  | "neck"
  | "obliques"
  | "quadriceps"
  | "tibialis"
  | "trapezius"
  | "triceps"
  | "upper-back";

export interface BodyPart {
  intensity?: number;
  color: string;
  slug: Slug;
  pathArray?: string[];
}

type Props = {
  colors: ReadonlyArray<string>;
  data: ReadonlyArray<BodyPart>;
  scale: number;
  frontOnly: boolean;
  backOnly: boolean;
  side: "front" | "back";
  gender?: "male" | "female";
  skinType: SkinType;
  onBodyPartPress: (b: BodyPart) => void;
};

const comparison = (a: BodyPart, b: BodyPart) => a.slug === b.slug;

const Body = ({
  colors,
  data,
  scale,
  side,
  gender = "male",
  skinType = 3,
  onBodyPartPress,
}: Props) => {
  const mergedBodyParts = useCallback(
    (dataSource: ReadonlyArray<BodyPart>) => {
      const innerData = data
        .map((d) => {
          return dataSource.find((t) => t.slug === d.slug);
        })
        .filter(Boolean);

      const coloredBodyParts = innerData.map((d) => {
        const bodyPart = data.find((e) => e.slug === d?.slug);
        let colorIntensity = 1;
        if (bodyPart?.intensity) colorIntensity = bodyPart.intensity;
        return { ...d, color: colors[colorIntensity - 1] };
      });

      const formattedBodyParts = differenceWith(comparison, dataSource, data);

      return [...formattedBodyParts, ...coloredBodyParts];
    },
    [data, colors]
  );

  const getColorToFill = (bodyPart: BodyPart) => {
    let color;
    if (bodyPart.intensity) color = colors[bodyPart.intensity];
    else color = bodyPart.color;
    return color;
  };

  const skinColor = skinColorMapping[skinType];
  const renderBodySvg = (data: ReadonlyArray<BodyPart>) => {
    const SvgWrapper = gender === "male" ? SvgMaleWrapper : SvgFemaleWrapper;
    return (
      <SvgWrapper side={side} scale={scale} skinColor={skinColor}>
        {mergedBodyParts(data).map((bodyPart: BodyPart) => {
          if (bodyPart.pathArray) {
            return bodyPart.pathArray.map((path: string) => {
              return (
                <Path
                  key={path}
                  onPress={() => onBodyPartPress?.(bodyPart)}
                  id={bodyPart.slug}
                  fill={getColorToFill(bodyPart)}
                  d={path}
                />
              );
            });
          }
        })}
      </SvgWrapper>
    );
  };

  if (gender === "female") {
    return renderBodySvg(side === "front" ? bodyFemaleFront(skinColor) : bodyFemaleBack(skinColor));
  }

  return renderBodySvg(side === "front" ? bodyFront(skinColor) : bodyBack(skinColor));
};

Body.defaultProps = {
  scale: 1,
  colors: ["#ff9800", "#ffecb3"],
  zoomOnPress: false,
  side: "front",
  skinType: 3,
};

export default memo(Body);
