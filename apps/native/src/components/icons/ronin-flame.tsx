import Svg, { Defs, LinearGradient, Path, Stop } from "react-native-svg";

type Props = {
  size?: number;
};

export function RoninFlame({ size = 24 }: Props) {
  // Gradient IDs scoped by size so two flames at different sizes on the same
  // screen don't collide on a single shared "flameMain" identifier.
  const idMain = `flameMain-${size}`;
  const idHighlight = `flameHl-${size}`;
  return (
    <Svg height={size * 1.25} viewBox="0 0 80 100" width={size}>
      <Defs>
        <LinearGradient id={idMain} x1="0%" x2="0%" y1="100%" y2="0%">
          <Stop offset="0%" stopColor="#FAC775" />
          <Stop offset="40%" stopColor="#D85A30" />
          <Stop offset="100%" stopColor="#993C1D" />
        </LinearGradient>
        <LinearGradient id={idHighlight} x1="0%" x2="0%" y1="100%" y2="0%">
          <Stop offset="0%" stopColor="#FAC775" />
          <Stop offset="100%" stopColor="#FAC775" stopOpacity="0" />
        </LinearGradient>
      </Defs>
      <Path
        d="M40 95 C18 95 8 80 12 65 C16 55 22 50 26 45 C30 38 24 32 30 24 C36 16 44 18 44 8 C50 14 54 22 52 32 C50 40 56 44 60 48 C66 54 72 62 72 72 C72 86 60 95 40 95 Z"
        fill={`url(#${idMain})`}
      />
      <Path
        d="M40 88 C26 88 20 78 22 68 C24 60 30 56 32 50 C34 44 32 40 36 36 C40 32 42 34 44 28 C46 36 50 40 48 46 C46 52 52 54 54 58 C58 64 60 70 60 76 C60 84 52 88 40 88 Z"
        fill={`url(#${idHighlight})`}
      />
    </Svg>
  );
}
