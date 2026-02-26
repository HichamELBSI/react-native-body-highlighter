import React from "react";
export type Slug = "abs" | "adductors" | "ankles" | "biceps" | "calves" | "chest" | "deltoids" | "deltoids" | "feet" | "forearm" | "gluteal" | "hamstring" | "hands" | "hair" | "head" | "knees" | "lower-back" | "neck" | "obliques" | "quadriceps" | "tibialis" | "trapezius" | "triceps" | "upper-back";
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
declare const Body: ({ colors, data, scale, side, gender, onBodyPartPress, border, disabledParts, hiddenParts, defaultFill, defaultStroke, defaultStrokeWidth }: BodyProps) => React.JSX.Element;
export default Body;
