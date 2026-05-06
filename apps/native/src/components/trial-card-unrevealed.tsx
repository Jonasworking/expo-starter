import { StyleSheet } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  Easing,
  interpolate,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { Text } from "@/components/ui/text";
import type { Trial } from "@/contexts/app-state-context";

const FLIP_DURATION_MS = 600;
const SNAP_BACK_MS = 200;
const REVEAL_THRESHOLD_PX = -50;
const MAX_LIFT_PX = -40;
const CARD_MIN_HEIGHT = 320;
const SHINE_WIDTH = 60;
// Translation range for the shine strip — should clear the card on both sides.
const SHINE_TRAVEL = 360;

const ROMAN = [
  "I",
  "II",
  "III",
  "IV",
  "V",
  "VI",
  "VII",
  "VIII",
  "IX",
  "X",
  "XI",
  "XII",
  "XIII",
  "XIV",
  "XV",
  "XVI",
  "XVII",
  "XVIII",
  "XIX",
  "XX",
];
const toRoman = (n: number) =>
  n >= 1 && n <= ROMAN.length ? ROMAN[n - 1] : String(n);

type Props = {
  activeTrial: Trial;
  currentDayInTrial: number;
  onRevealed: (trialId: string) => void;
};

export function TrialCardUnrevealed({
  activeTrial,
  currentDayInTrial,
  onRevealed,
}: Props) {
  const translateY = useSharedValue(0);
  // 0 = back facing user, 1 = front facing user. Mapped to 0..180deg rotateY.
  const rotation = useSharedValue(0);
  // 0 = no shine, runs 0 → 1 alongside the flip.
  const shine = useSharedValue(0);

  const handleRevealed = () => {
    onRevealed(activeTrial.id);
  };

  const pan = Gesture.Pan()
    .onUpdate((e) => {
      "worklet";
      if (e.translationY < 0) {
        translateY.value = Math.max(e.translationY, MAX_LIFT_PX);
      } else {
        translateY.value = 0;
      }
    })
    .onEnd((e) => {
      "worklet";
      if (e.translationY <= REVEAL_THRESHOLD_PX) {
        translateY.value = withTiming(0, { duration: SNAP_BACK_MS });
        shine.value = 0;
        shine.value = withTiming(1, { duration: FLIP_DURATION_MS });
        rotation.value = withTiming(
          1,
          {
            duration: FLIP_DURATION_MS,
            easing: Easing.bezier(0.4, 0, 0.2, 1),
          },
          (finished) => {
            if (finished) {
              runOnJS(handleRevealed)();
            }
          }
        );
        return;
      }
      translateY.value = withTiming(0, { duration: SNAP_BACK_MS });
    });

  const cardStyle = useAnimatedStyle(() => ({
    transform: [
      { perspective: 1000 },
      { translateY: translateY.value },
      { rotateY: `${rotation.value * 180}deg` },
    ],
  }));

  // Opacity swap at the half-way point — avoids relying on backfaceVisibility,
  // which is inconsistent across platforms in RN.
  const backStyle = useAnimatedStyle(() => ({
    opacity: rotation.value < 0.5 ? 1 : 0,
  }));

  // Front pre-rotated 180° so its own rotation cancels the container's,
  // leaving its content un-mirrored once the card has flipped fully.
  const frontStyle = useAnimatedStyle(() => ({
    opacity: rotation.value < 0.5 ? 0 : 1,
    transform: [{ rotateY: "180deg" }],
  }));

  const shineStyle = useAnimatedStyle(() => {
    const offset = interpolate(
      shine.value,
      [0, 1],
      [-SHINE_TRAVEL, SHINE_TRAVEL]
    );
    const visible = shine.value > 0 && shine.value < 1;
    return {
      opacity: visible ? 1 : 0,
      transform: [{ translateX: offset }, { skewX: "-20deg" }],
    };
  });

  return (
    <GestureDetector gesture={pan}>
      <Animated.View
        className="overflow-hidden rounded-[22px] border border-border bg-card"
        style={[{ minHeight: CARD_MIN_HEIGHT }, cardStyle]}
      >
        {/* Back face — visible until the card crosses the half-way point */}
        <Animated.View
          style={[
            StyleSheet.absoluteFill,
            backStyle,
            {
              padding: 32,
              alignItems: "center",
              justifyContent: "center",
            },
          ]}
        >
          <Text className="font-serif text-[80px] text-foreground leading-none">
            ???
          </Text>
          <Text
            className="mt-6 px-2 text-center text-[13px] text-muted-foreground"
            style={{ fontStyle: "italic" }}
          >
            Swipe to reveal your trial.
          </Text>
        </Animated.View>

        {/* Front face — pre-rotated so it reads correctly post-flip. The
            real interactive front (with reroll + complete buttons) takes
            over once the parent re-renders after onRevealed fires. */}
        <Animated.View
          style={[
            StyleSheet.absoluteFill,
            frontStyle,
            { padding: 32, alignItems: "center" },
          ]}
        >
          <Text className="mb-1 font-heading-bold text-[26px] text-foreground">
            {activeTrial.title}
          </Text>
          <Text className="mb-6 font-medium text-[13px] text-muted-foreground">
            Day {toRoman(currentDayInTrial)} of {toRoman(activeTrial.days)}
          </Text>
          <Text className="px-4 text-center font-medium text-[18px] text-foreground leading-relaxed">
            {activeTrial.description}
          </Text>
        </Animated.View>

        {/* Shine strip — diagonal highlight that sweeps across during the
            rotation. pointerEvents none so it never intercepts the gesture. */}
        <Animated.View
          pointerEvents="none"
          style={[
            shineStyle,
            {
              position: "absolute",
              top: 0,
              bottom: 0,
              left: 0,
              width: SHINE_WIDTH,
              backgroundColor: "rgba(255,255,255,0.15)",
            },
          ]}
        />
      </Animated.View>
    </GestureDetector>
  );
}
