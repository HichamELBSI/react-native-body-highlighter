"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = __importStar(require("react"));
const react_native_svg_1 = require("react-native-svg");
const bodyFront_1 = require("./assets/bodyFront");
const bodyBack_1 = require("./assets/bodyBack");
const SvgMaleWrapper_1 = require("./components/SvgMaleWrapper");
const bodyFemaleFront_1 = require("./assets/bodyFemaleFront");
const bodyFemaleBack_1 = require("./assets/bodyFemaleBack");
const SvgFemaleWrapper_1 = require("./components/SvgFemaleWrapper");
const comparison = (a, b) => a.slug === b.slug;
const Body = ({ colors = ["#0984e3", "#74b9ff"], data, scale = 1, side = "front", gender = "male", onBodyPartPress, border = "#dfdfdf", disabledParts = [], hiddenParts = [], defaultFill = "#3f3f3f", defaultStroke = "none", defaultStrokeWidth = 0 }) => {
    const getPartStyles = (0, react_1.useCallback)((bodyPart) => {
        var _a, _b, _c, _d, _e, _f;
        // Per-part styles override global defaults
        return {
            fill: (_b = (_a = bodyPart.styles) === null || _a === void 0 ? void 0 : _a.fill) !== null && _b !== void 0 ? _b : defaultFill,
            stroke: (_d = (_c = bodyPart.styles) === null || _c === void 0 ? void 0 : _c.stroke) !== null && _d !== void 0 ? _d : defaultStroke,
            strokeWidth: (_f = (_e = bodyPart.styles) === null || _e === void 0 ? void 0 : _e.strokeWidth) !== null && _f !== void 0 ? _f : defaultStrokeWidth,
        };
    }, [defaultFill, defaultStroke, defaultStrokeWidth]);
    const mergedBodyParts = (0, react_1.useCallback)((dataSource) => {
        const filteredDataSource = dataSource.filter((part) => !hiddenParts.includes(part.slug));
        // Create a map of user data by slug for faster lookup
        const userDataMap = new Map();
        data.forEach(userPart => {
            if (userPart.slug) {
                userDataMap.set(userPart.slug, userPart);
            }
        });
        // Merge asset body parts with user data
        return filteredDataSource.map((assetPart) => {
            var _a;
            const userPart = userDataMap.get(assetPart.slug);
            if (!userPart) {
                // No user data for this part, return as-is
                return assetPart;
            }
            // Merge asset part (has path) with user part (has styles, color, etc.)
            const merged = Object.assign(Object.assign({}, assetPart), { 
                // Explicitly copy user properties
                styles: userPart.styles, intensity: userPart.intensity, side: userPart.side, color: userPart.color });
            // Set color fallback based on intensity if provided
            if (!((_a = merged.styles) === null || _a === void 0 ? void 0 : _a.fill) && !merged.color && merged.intensity) {
                merged.color = colors[merged.intensity - 1];
            }
            return merged;
        });
    }, [data, colors, hiddenParts]);
    const getColorToFill = (bodyPart) => {
        var _a;
        if (bodyPart.slug && disabledParts.includes(bodyPart.slug)) {
            return "#EBEBE4";
        }
        // Priority: per-part styles.fill > color prop > intensity-based color > default
        if ((_a = bodyPart.styles) === null || _a === void 0 ? void 0 : _a.fill) {
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
    const isPartDisabled = (slug) => slug && disabledParts.includes(slug);
    const renderBodySvg = (bodyToRender) => {
        const SvgWrapper = gender === "male" ? SvgMaleWrapper_1.SvgMaleWrapper : SvgFemaleWrapper_1.SvgFemaleWrapper;
        return (<SvgWrapper side={side} scale={scale} border={border}>
        {mergedBodyParts(bodyToRender).map((bodyPart) => {
                var _a, _b, _c;
                const commonPaths = (((_a = bodyPart.path) === null || _a === void 0 ? void 0 : _a.common) || []).map((path) => {
                    const partStyles = getPartStyles(bodyPart);
                    const fillColor = getColorToFill(bodyPart);
                    return (<react_native_svg_1.Path key={path} onPress={isPartDisabled(bodyPart.slug)
                            ? undefined
                            : () => onBodyPartPress === null || onBodyPartPress === void 0 ? void 0 : onBodyPartPress(bodyPart)} aria-disabled={isPartDisabled(bodyPart.slug)} id={bodyPart.slug} fill={fillColor !== null && fillColor !== void 0 ? fillColor : partStyles.fill} stroke={partStyles.stroke} strokeWidth={partStyles.strokeWidth} d={path}/>);
                });
                const leftPaths = (((_b = bodyPart.path) === null || _b === void 0 ? void 0 : _b.left) || []).map((path) => {
                    var _a;
                    const isOnlyRight = ((_a = data.find((d) => d.slug === bodyPart.slug)) === null || _a === void 0 ? void 0 : _a.side) === "right";
                    const partStyles = getPartStyles(bodyPart);
                    const fillColor = isOnlyRight ? defaultFill : getColorToFill(bodyPart);
                    return (<react_native_svg_1.Path key={path} onPress={isPartDisabled(bodyPart.slug)
                            ? undefined
                            : () => onBodyPartPress === null || onBodyPartPress === void 0 ? void 0 : onBodyPartPress(bodyPart, "left")} id={bodyPart.slug} fill={fillColor !== null && fillColor !== void 0 ? fillColor : partStyles.fill} stroke={partStyles.stroke} strokeWidth={partStyles.strokeWidth} d={path}/>);
                });
                const rightPaths = (((_c = bodyPart.path) === null || _c === void 0 ? void 0 : _c.right) || []).map((path) => {
                    var _a;
                    const isOnlyLeft = ((_a = data.find((d) => d.slug === bodyPart.slug)) === null || _a === void 0 ? void 0 : _a.side) === "left";
                    const partStyles = getPartStyles(bodyPart);
                    const fillColor = isOnlyLeft ? defaultFill : getColorToFill(bodyPart);
                    return (<react_native_svg_1.Path key={path} onPress={isPartDisabled(bodyPart.slug)
                            ? undefined
                            : () => onBodyPartPress === null || onBodyPartPress === void 0 ? void 0 : onBodyPartPress(bodyPart, "right")} id={bodyPart.slug} fill={fillColor !== null && fillColor !== void 0 ? fillColor : partStyles.fill} stroke={partStyles.stroke} strokeWidth={partStyles.strokeWidth} d={path}/>);
                });
                return [...commonPaths, ...leftPaths, ...rightPaths];
            })}
      </SvgWrapper>);
    };
    if (gender === "female") {
        return renderBodySvg(side === "front" ? bodyFemaleFront_1.bodyFemaleFront : bodyFemaleBack_1.bodyFemaleBack);
    }
    return renderBodySvg(side === "front" ? bodyFront_1.bodyFront : bodyBack_1.bodyBack);
};
exports.default = Body;
