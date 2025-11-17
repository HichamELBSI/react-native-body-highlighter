import React, { memo, useCallback } from "react";
import { Path } from "react-native-svg";
import { differenceWith } from "./utils/differenceWith";

import { bodyFront } from "./assets/bodyFront";
import { bodyBack } from "./assets/bodyBack";
import { SvgMaleWrapper } from "./components/SvgMaleWrapper";
import { bodyFemaleFront } from "./assets/bodyFemaleFront";
import { bodyFemaleBack } from "./assets/bodyFemaleBack";
import { SvgFemaleWrapper } from "./components/SvgFemaleWrapper";

export type Slug =
  | "abs"
  | "adductors"
  | "ankles"
  | "biceps"
  | "calves"
  | "chest"
  | "deltoids"
  | "deltoids"
  | "feet"
  | "forearm"
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

export interface BodyPartStyles {
  fill?: string;
  stroke?: string;
  strokeWidth?: number;
}

export interface BodyPart {
  color?: string;
  slug?: Slug;
  path?: {
    common?: string[];
    left?: string[];
    right?: string[];
  };
}

export interface ExtendedBodyPart extends BodyPart {
  color?: string;
  intensity?: number;
  side?: "left" | "right";
  styles?: BodyPartStyles;
}

export type BodyProps = {
  colors?: ReadonlyArray<string>;
  data: ReadonlyArray<ExtendedBodyPart>;
  scale?: number;
  side?: "front" | "back";
  gender?: "male" | "female";
  onBodyPartPress?: (b: ExtendedBodyPart, side?: "left" | "right") => void;
  border?: string | "none";
  disabledParts?: Slug[];
  hiddenParts?: Slug[];
  defaultFill?: string;
  defaultStroke?: string;
  defaultStrokeWidth?: number;
};

const comparison = (a: ExtendedBodyPart, b: ExtendedBodyPart) =>
  a.slug === b.slug;

const Body = ({
  colors = ["#0984e3", "#74b9ff"],
  data,
  scale = 1,
  side = "front",
  gender = "male",
  onBodyPartPress,
  border = "#dfdfdf",
  disabledParts = [],
  hiddenParts = [],
  defaultFill = "#3f3f3f",
  defaultStroke = "none",
  defaultStrokeWidth = 0
}: BodyProps) => {
  const getPartStyles = useCallback(
    (bodyPart: ExtendedBodyPart): BodyPartStyles => {
      // Per-part styles override global defaults
      return {
        fill: bodyPart.styles?.fill ?? defaultFill,
        stroke: bodyPart.styles?.stroke ?? defaultStroke,
        strokeWidth: bodyPart.styles?.strokeWidth ?? defaultStrokeWidth,
      };
    },
    [defaultFill, defaultStroke, defaultStrokeWidth]
  );

  const mergedBodyParts = useCallback(
    (dataSource: ReadonlyArray<BodyPart>) => {
      const filteredDataSource = dataSource.filter(
        (part) => !hiddenParts.includes(part.slug!)
      );

      // Create a map of user data by slug for faster lookup
      const userDataMap = new Map<string, ExtendedBodyPart>();
      data.forEach(userPart => {
        if (userPart.slug) {
          userDataMap.set(userPart.slug, userPart);
        }
      });

      // Merge asset body parts with user data
      return filteredDataSource.map((assetPart): ExtendedBodyPart => {
        const userPart = userDataMap.get(assetPart.slug!);

        if (!userPart) {
          // No user data for this part, return as-is
          return assetPart;
        }

        // Merge asset part (has path) with user part (has styles, color, etc.)
        const merged: ExtendedBodyPart = {
          ...assetPart,
          // Explicitly copy user properties
          styles: userPart.styles,
          intensity: userPart.intensity,
          side: userPart.side,
          color: userPart.color,
        };

        // Set color fallback based on intensity if provided
        if (!merged.styles?.fill && !merged.color && merged.intensity) {
          merged.color = colors[merged.intensity - 1];
        }

        return merged;
      });
    },
    [data, colors, hiddenParts]
  );

  const getColorToFill = (bodyPart: ExtendedBodyPart) => {
    if (bodyPart.slug && disabledParts.includes(bodyPart.slug)) {
      return "#EBEBE4";
    }

    // Priority: per-part styles.fill > color prop > intensity-based color > default
    if (bodyPart.styles?.fill) {
      return bodyPart.styles.fill;
    }

    if (bodyPart.color) {
      return bodyPart.color;
    }

    if (bodyPart.intensity && bodyPart.intensity > 0) {
      return colors[bodyPart.intensity - 1];
    }

    return undefined; // Let getPartStyles provide the default
  };

  const isPartDisabled = (slug?: Slug) => slug && disabledParts.includes(slug);

  const renderBodySvg = (bodyToRender: ReadonlyArray<BodyPart>) => {
    const SvgWrapper = gender === "male" ? SvgMaleWrapper : SvgFemaleWrapper;

    return (
      <SvgWrapper side={side} scale={scale} border={border}>
        {mergedBodyParts(bodyToRender).map((bodyPart: ExtendedBodyPart) => {
          const commonPaths = (bodyPart.path?.common || []).map((path) => {
            const partStyles = getPartStyles(bodyPart);
            const fillColor = getColorToFill(bodyPart);

            return (
              <Path
                key={path}
                onPress={
                  isPartDisabled(bodyPart.slug)
                    ? undefined
                    : () => onBodyPartPress?.(bodyPart)
                }
                aria-disabled={isPartDisabled(bodyPart.slug)}
                id={bodyPart.slug}
                fill={fillColor ?? partStyles.fill}
                stroke={partStyles.stroke}
                strokeWidth={partStyles.strokeWidth}
                d={path}
              />
            );
          });

          const leftPaths = (bodyPart.path?.left || []).map((path) => {
            const isOnlyRight =
              data.find((d) => d.slug === bodyPart.slug)?.side === "right";
            const partStyles = getPartStyles(bodyPart);
            const fillColor = isOnlyRight ? defaultFill : getColorToFill(bodyPart);

            return (
              <Path
                key={path}
                onPress={
                  isPartDisabled(bodyPart.slug)
                    ? undefined
                    : () => onBodyPartPress?.(bodyPart, "left")
                }
                id={bodyPart.slug}
                fill={fillColor ?? partStyles.fill}
                stroke={partStyles.stroke}
                strokeWidth={partStyles.strokeWidth}
                d={path}
              />
            );
          });
          const rightPaths = (bodyPart.path?.right || []).map((path) => {
            const isOnlyLeft =
              data.find((d) => d.slug === bodyPart.slug)?.side === "left";
            const partStyles = getPartStyles(bodyPart);
            const fillColor = isOnlyLeft ? defaultFill : getColorToFill(bodyPart);

            return (
              <Path
                key={path}
                onPress={
                  isPartDisabled(bodyPart.slug)
                    ? undefined
                    : () => onBodyPartPress?.(bodyPart, "right")
                }
                id={bodyPart.slug}
                fill={fillColor ?? partStyles.fill}
                stroke={partStyles.stroke}
                strokeWidth={partStyles.strokeWidth}
                d={path}
              />
            );
          });

          return [...commonPaths, ...leftPaths, ...rightPaths];
        })}
      </SvgWrapper>
    );
  };

  if (gender === "female") {
    return renderBodySvg(side === "front" ? bodyFemaleFront : bodyFemaleBack);
  }

  return renderBodySvg(side === "front" ? bodyFront : bodyBack);
};

export default Body;
