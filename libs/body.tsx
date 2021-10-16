import React, { memo, useEffect, useState, useCallback } from "react";
import {
  View,
  TouchableWithoutFeedback,
  Modal,
  TouchableOpacity,
  StyleSheet
} from "react-native";
import Svg, { Polygon, Path } from "react-native-svg";
import differenceWith from "ramda/src/differenceWith";

import bodyFront from "./assets/bodyFront";
import bodyBack from "./assets/bodyBack";

type MuscleT = {
  intensity?: number;
  color: string;
  slug: string;
  pointsArray?: string[];
};

type Props = {
  onMusclePress?: (muscle: MuscleT) => void;
  zoomOnPress: boolean;
  colors: ReadonlyArray<string>;
  data: ReadonlyArray<MuscleT>;
  scale: number;
  frontOnly: boolean;
  backOnly: boolean;
};

const colorsIntensity = ["#0984e3", "#74b9ff"];
const comparison = (a: MuscleT, b: MuscleT) => a.slug === b.slug;

const Body = ({
  onMusclePress,
  zoomOnPress,
  colors,
  data,
  scale,
  frontOnly,
  backOnly
}: Props) => {
  const [openInModal, setOpenInModal] = useState(false);

  useEffect(() => {
    if (onMusclePress && zoomOnPress) {
      console.warn(
        "props 'onMusclePress' is disable if props 'zoomOnPress' is set to true"
      );
    }
  }, [onMusclePress, zoomOnPress]);

  const mergedMuscles = useCallback(
    (dataSource: ReadonlyArray<MuscleT>) => {
      const innerData = data
        .map(d => {
          return dataSource.find(t => t.slug === d.slug);
        })
        .filter(Boolean);
      const coloredMuscles = innerData.map((d: any) => {
        const muscle = data.find(e => e.slug === d.slug);
        let colorIntensity = 1;
        if (muscle && muscle.intensity) colorIntensity = muscle.intensity;
        return { ...d, color: colors[colorIntensity - 1] };
      });
      const formattedMuscles = differenceWith(comparison, dataSource, data);
      return [...formattedMuscles, ...coloredMuscles];
    },
    [data, colors]
  );

  const getColorToFill = (muscle: MuscleT) => {
    let color;
    if (muscle.intensity) color = colors[muscle.intensity];
    else color = muscle.color;

    return color;
  };

  const handleMusclePress = (muscle: MuscleT) => {
    if (onMusclePress && !zoomOnPress) onMusclePress(muscle);

    if (zoomOnPress && !openInModal) setOpenInModal(!openInModal);
  };

  const renderBodySvg = (data: ReadonlyArray<MuscleT>) => (
    <Svg height={200 * scale} width={100 * scale}>
      {mergedMuscles(data).map(
        (muscle: MuscleT) => {
           if (muscle.pointsArray) {
             muscle.pointsArray = muscle.pointsArray.map(
                 (points: string) => points.split(' ').map(p => `${parseFloat(p) * scale}`).join(' ')
             );

             return muscle.pointsArray.map((points: string) => {
               return (
                   <Polygon
                       key={points}
                       onPress={() => handleMusclePress(muscle)}
                       id={muscle.slug}
                       fill={getColorToFill(muscle)}
                       points={points}
                   />
               );
             });
           }
        }

      )}
    </Svg>
  );

  return (
    <TouchableWithoutFeedback
      onPress={() => zoomOnPress && setOpenInModal(!openInModal)}
    >
      <View>
        <View
          style={{
            flexDirection: "row",
          }}
        >
          {!backOnly && renderBodySvg(bodyFront)}
          {!frontOnly && renderBodySvg(bodyBack)}
        </View>
        <Modal
          hardwareAccelerated
          presentationStyle="fullScreen"
          animationType="none"
          transparent={false}
          visible={openInModal}
        >
          <View style={styles.modalContainer}>
            <TouchableOpacity
              style={styles.closeModal}
              onPress={() => setOpenInModal(!openInModal)}
            >
              <Svg height="24" width="24">
                <Path
                  d="M24 20.188l-8.315-8.209 8.2-8.282-3.697-3.697-8.212 8.318-8.31-8.203-3.666 3.666 8.321 8.24-8.206 8.313 3.666 3.666 8.237-8.318 8.285 8.203z"
                  fill="black"
                />
              </Svg>
            </TouchableOpacity>
            <View style={styles.modalContent}>
              {!backOnly && renderBodySvg(bodyFront)}
              {!frontOnly && renderBodySvg(bodyBack)}
            </View>
          </View>
        </Modal>
      </View>
    </TouchableWithoutFeedback>
  );
};

Body.defaultProps = {
  scale: 1,
  colors: colorsIntensity,
  backOnly: false,
  frontOnly: false,
  zoomOnPress: false
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center"
  },
  modalContent: {
    transform: [{ scale: 2 }],
    flexDirection: "row"
  },
  closeModal: {
    position: "absolute",
    top: 30,
    right: 10
  }
});

export default memo(Body);
