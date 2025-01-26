import { parse } from '../external/gradient-parser/build/node.mjs';
import { Color } from 'pixi.js';

function parseCssGradient(cssGradient) {
  const cssGradientNodes = parse(trimCssGradient(cssGradient));
  if (cssGradientNodes.length === 0) {
    throw new Error("Invalid CSS gradient.");
  } else if (cssGradientNodes.length !== 1) {
    throw new Error("Unsupported CSS gradient (multiple gradients is not supported).");
  }
  const cssGradientNode = cssGradientNodes[0];
  const type = typeFromCssType(cssGradientNode.type);
  const stops = stopsFromCssStops(cssGradientNode.colorStops);
  const angle = angleFromCssOrientation(cssGradientNode.orientation);
  return {
    type,
    stops,
    angle
  };
}
function typeFromCssType(type) {
  const supportedTypes = {
    "linear-gradient": 0,
    "radial-gradient": 1
  };
  if (!(type in supportedTypes)) {
    throw new Error(`Unsupported gradient type "${type}"`);
  }
  return supportedTypes[type];
}
function stopsFromCssStops(stops) {
  const offsets = offsetsFromCssColorStops(stops);
  const result = [];
  const color = new Color();
  for (let i = 0; i < stops.length; i++) {
    const colorString = colorAsStringFromCssStop(stops[i]);
    const rgbaColor = color.setValue(colorString).toArray();
    result.push({
      offset: offsets[i],
      color: rgbaColor.slice(0, 3),
      alpha: rgbaColor[3]
    });
  }
  return result;
}
function colorAsStringFromCssStop(stop) {
  switch (stop.type) {
    case "hex":
      return `#${stop.value}`;
    case "literal":
      return stop.value;
    default:
      return `${stop.type}(${stop.value.join(",")})`;
  }
}
function offsetsFromCssColorStops(stops) {
  const offsets = [];
  const dynamicOffset = -1;
  for (let i = 0; i < stops.length; i++) {
    const cssStop = stops[i];
    let stopOffset = dynamicOffset;
    if (cssStop.type === "literal") {
      if (cssStop.length && "type" in cssStop.length && cssStop.length.type === "%" && "value" in cssStop.length) {
        stopOffset = parseFloat(cssStop.length.value) / 100;
      }
    }
    offsets.push(stopOffset);
  }
  const findNextFixedStop = (fromIndex) => {
    for (let k = fromIndex; k < offsets.length; k++) {
      if (offsets[k] !== dynamicOffset) {
        return {
          indexDelta: k - fromIndex,
          offset: offsets[k]
        };
      }
    }
    return {
      indexDelta: offsets.length - 1 - fromIndex,
      offset: 1
    };
  };
  let prevFixedOffset = 0;
  for (let i = 0; i < offsets.length; i++) {
    const offset = offsets[i];
    if (offset !== dynamicOffset) {
      prevFixedOffset = offset;
    } else if (i === 0) {
      offsets[i] = 0;
    } else if (i + 1 === offsets.length) {
      offsets[i] = 1;
    } else {
      const nextFixed = findNextFixedStop(i);
      const offsetDelta = nextFixed.offset - prevFixedOffset;
      const stepSize = offsetDelta / (1 + nextFixed.indexDelta);
      for (let s = 0; s <= nextFixed.indexDelta; s++) {
        offsets[i + s] = prevFixedOffset + (s + 1) * stepSize;
      }
      i += nextFixed.indexDelta;
      prevFixedOffset = offsets[i];
    }
  }
  return offsets.map(fixFloatRounding);
}
function fixFloatRounding(value) {
  const maxLength = 6;
  if (value.toString().length > maxLength) {
    return parseFloat(value.toString().substring(0, maxLength));
  }
  return value;
}
function angleFromCssOrientation(orientation) {
  if (typeof orientation === "undefined") {
    return 0;
  }
  if ("type" in orientation && "value" in orientation) {
    switch (orientation.type) {
      case "angular":
        return parseFloat(orientation.value);
      case "directional":
        return angleFromDirectionalValue(orientation.value);
    }
  }
  return 0;
}
function angleFromDirectionalValue(value) {
  const supportedValues = {
    left: 270,
    top: 0,
    bottom: 180,
    right: 90,
    "left top": 315,
    "top left": 315,
    "left bottom": 225,
    "bottom left": 225,
    "right top": 45,
    "top right": 45,
    "right bottom": 135,
    "bottom right": 135
  };
  if (!(value in supportedValues)) {
    throw new Error(`Unsupported directional value "${value}"`);
  }
  return supportedValues[value];
}
function trimCssGradient(value) {
  let value_ = value.replace(/\s{2,}/gu, " ");
  value_ = value_.replace(/;/g, "");
  value_ = value_.replace(/ ,/g, ",");
  value_ = value_.replace(/\( /g, "(");
  value_ = value_.replace(/ \)/g, ")");
  return value_.trim();
}

export { angleFromCssOrientation, angleFromDirectionalValue, colorAsStringFromCssStop, offsetsFromCssColorStops, parseCssGradient, stopsFromCssStops, trimCssGradient, typeFromCssType };
//# sourceMappingURL=CssGradientParser.mjs.map
