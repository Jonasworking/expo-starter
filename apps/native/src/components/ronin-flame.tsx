import Svg, { Defs, LinearGradient, Path, Stop } from "react-native-svg";

interface RoninFlameProps {
  size?: number;
  color?: string;
}

export function RoninFlame({ size = 24 }: RoninFlameProps) {
  return (
    <Svg fill="none" height={size} viewBox="0 0 24 24" width={size}>
      <Defs>
        <LinearGradient
          gradientUnits="userSpaceOnUse"
          id="flame-outer"
          x1="12"
          x2="12"
          y1="24"
          y2="0"
        >
          <Stop offset="0" stopColor="#FAC775" />
          <Stop offset="0.5" stopColor="#D85A30" />
          <Stop offset="1" stopColor="#993C1D" />
        </LinearGradient>
        <LinearGradient
          gradientUnits="userSpaceOnUse"
          id="flame-inner"
          x1="12"
          x2="12"
          y1="22"
          y2="8"
        >
          <Stop offset="0" stopColor="#FAC775" stopOpacity="1" />
          <Stop offset="1" stopColor="#FAC775" stopOpacity="0" />
        </LinearGradient>
      </Defs>
      <Path
        d="M12 2 C8 6, 6 10, 6 14 C6 18, 9 22, 12 22 C15 22, 18 18, 18 14 C18 10, 16 6, 12 2 Z"
        fill="url(#flame-outer)"
      />
      <Path
        d="M12 8 C10 11, 9 13, 9 16 C9 19, 10.5 21, 12 21 C13.5 21, 15 19, 15 16 C15 13, 14 11, 12 8 Z"
        fill="url(#flame-inner)"
      />
    </Svg>
  );
}
