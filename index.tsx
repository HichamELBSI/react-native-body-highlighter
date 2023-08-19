import React, { memo, useEffect, useState, useCallback } from "react";
import {
  View,
  TouchableWithoutFeedback,
  Modal,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import Svg, { Polygon, Path } from "react-native-svg";
import differenceWith from "ramda/src/differenceWith";

import { bodyFront } from "./assets/bodyFront";
import { bodyBack } from "./assets/bodyBack";
import { SvgWrapper } from "./components/SvgWrapper";

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

export interface Muscle {
  intensity?: number;
  color: string;
  slug: Slug;
  pathArray?: string[];
}

type Props = {
  colors: ReadonlyArray<string>;
  data: ReadonlyArray<Muscle>;
  scale: number;
  frontOnly: boolean;
  backOnly: boolean;
};

const comparison = (a: Muscle, b: Muscle) => a.slug === b.slug;

const Body = ({ colors, data, scale, frontOnly, backOnly }: Props) => {
  const [openInModal, setOpenInModal] = useState(false);

  const mergedMuscles = useCallback(
    (dataSource: ReadonlyArray<Muscle>) => {
      const innerData = data
        .map((d) => {
          return dataSource.find((t) => t.slug === d.slug);
        })
        .filter(Boolean);

      const coloredMuscles = innerData.map((d) => {
        const muscle = data.find((e) => e.slug === d?.slug);
        let colorIntensity = 1;
        if (muscle?.intensity) colorIntensity = muscle.intensity;
        return { ...d, color: colors[colorIntensity - 1] };
      });

      const formattedMuscles = differenceWith(comparison, dataSource, data);

      return [...formattedMuscles, ...coloredMuscles];
    },
    [data, colors]
  );

  const getColorToFill = (muscle: Muscle) => {
    let color;
    if (muscle.intensity) color = colors[muscle.intensity];
    else color = muscle.color;

    return color;
  };

  const renderBodySvg = (data: ReadonlyArray<Muscle>) => {
    const viewBox = frontOnly
      ? "0 0 1448 1448"
      : backOnly
      ? "724 0 1448 1448"
      : "0 0 1448 1448";
    return (
      <SvgWrapper
        frontOnly={frontOnly}
        backOnly={backOnly}
        viewBox={viewBox}
        height={200 * scale}
        width={200 * scale}
      >
        {mergedMuscles(data).map((muscle: any) => {
          if (muscle.pathArray) {
            return muscle.pathArray.map((path: string) => {
              return (
                <Path
                  key={path}
                  id={muscle.slug}
                  fill={getColorToFill(muscle)}
                  d={path}
                />
              );
            });
          }
        })}
      </SvgWrapper>
    );
  };

  return (
    <View>
      <View style={styles.bodyContainer}>
        <View style={{ width: 0 }}>
          {!backOnly && renderBodySvg(bodyFront)}
        </View>
        <View
          style={{ width: frontOnly || backOnly ? 100 * scale : undefined }}
        >
          {!frontOnly && renderBodySvg(bodyBack)}
        </View>
      </View>
    </View>
  );
};

Body.defaultProps = {
  scale: 1,
  colors: ["#0984e3", "#74b9ff"],
  backOnly: false,
  frontOnly: false,
  zoomOnPress: false,
};

const styles = StyleSheet.create({
  bodyContainer: {
    flexDirection: "row",
  },
});

export default memo(Body);
