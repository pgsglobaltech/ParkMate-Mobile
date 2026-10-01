import React from "react";
import Svg, { Circle, Ellipse, Path, Rect } from "react-native-svg";

export default function VehicleIllustration({ type, width = 116, height = 72 }) {
  if (type === "RICKSHAW") {
    return (
      <Svg width={width} height={height} viewBox="0 0 150 92" fill="none">
        <Ellipse cx="77" cy="81" rx="58" ry="5" fill="#000" fillOpacity=".3" />
        <Circle cx="39" cy="69" r="12" fill="#181818" />
        <Circle cx="39" cy="69" r="5" fill="#929b7c" />
        <Circle cx="112" cy="69" r="12" fill="#181818" />
        <Circle cx="112" cy="69" r="5" fill="#929b7c" />
        <Path d="M26 61h9l9-18h45l14 18h23v8H26z" fill="#d7f392" />
        <Path d="M48 42l8-19h25l8 19H48z" fill="#879a65" />
        <Path d="M59 27h17l5 12H54z" fill="#c6d5ab" />
        <Path d="M43 47h37v14H36z" fill="#b9d67b" />
        <Rect x="86" y="47" width="15" height="14" rx="3" fill="#f4ba58" />
        <Path d="M31 61h-8v-7h11z" fill="#f17c54" />
      </Svg>
    );
  }

  if (type === "BIKE") {
    return (
      <Svg width={width} height={height} viewBox="0 0 150 92" fill="none">
        <Ellipse cx="76" cy="80" rx="58" ry="5" fill="#000" fillOpacity=".3" />
        <Circle cx="38" cy="66" r="18" stroke="#d2d7c7" strokeWidth="4" />
        <Circle cx="112" cy="66" r="18" stroke="#d2d7c7" strokeWidth="4" />
        <Path d="M39 66l22-27 18 27H39l19-24 24 1 11 23m-34-1 26-31h18l9 31" stroke="#d7f392" strokeWidth="5" strokeLinejoin="round" strokeLinecap="round" />
        <Path d="M48 37h22m27-7h14l5 7H99" stroke="#e8e9e4" strokeWidth="4" strokeLinecap="round" />
        <Path d="M67 34l12-9 13 7-5 18-14 7-10-11z" fill="#f2a15c" />
        <Circle cx="81" cy="19" r="7" fill="#d7f392" />
        <Path d="M76 53l-9 10m25-28 12 2" stroke="#f3d07c" strokeWidth="5" strokeLinecap="round" />
      </Svg>
    );
  }

  return (
    <Svg width={width} height={height} viewBox="0 0 150 92" fill="none">
      <Ellipse cx="76" cy="80" rx="61" ry="5" fill="#000" fillOpacity=".3" />
      <Circle cx="42" cy="67" r="15" fill="#171717" />
      <Circle cx="42" cy="67" r="7" fill="#899276" />
      <Circle cx="112" cy="67" r="15" fill="#171717" />
      <Circle cx="112" cy="67" r="7" fill="#899276" />
      <Path d="M20 59l8-18c3-7 10-12 18-13l39-5c9-1 18 3 24 10l16 19 10 5v11h-9a14 14 0 00-28 0H56a14 14 0 00-28 0H20z" fill="#d7f392" />
      <Path d="M50 33l-7 22h36V29z" fill="#7e9060" />
      <Path d="M84 28l11-1c6 0 12 3 16 8l13 17H83z" fill="#b9c99b" />
      <Path d="M21 56h10l-4 7H19z" fill="#f2bc5d" />
      <Path d="M135 57h6v6h-7z" fill="#ef795c" />
    </Svg>
  );
}
