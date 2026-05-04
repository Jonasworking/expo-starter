// Web-only replacement for
// @gorhom/bottom-sheet/lib/module/components/bottomSheetTextInput/BottomSheetTextInput.js.
// The upstream file calls `RNTextInput.State.currentlyFocusedInput()` on
// blur, but `TextInput.State` does not exist on react-native-web, so the
// app crashes the moment a user blurs/dismisses a field inside a bottom
// sheet. We mirror the original implementation but guard the State call
// with optional chaining and a DOM fallback. Wired up via metro.config.js
// resolveRequest, only on web.
import {
  forwardRef,
  memo,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
} from "react";
import { jsx as _jsx } from "react/jsx-runtime";
import { TextInput as RNTextInput } from "react-native";
import { TextInput } from "react-native-gesture-handler";
import { useBottomSheetInternal } from "../../hooks";
import { findNodeHandle } from "../../utilities";

const getCurrentlyFocusedInput = () => {
  const stateApi = RNTextInput.State;
  if (stateApi && typeof stateApi.currentlyFocusedInput === "function") {
    return stateApi.currentlyFocusedInput();
  }
  if (typeof document !== "undefined") {
    return document.activeElement;
  }
  return null;
};

// Upstream findNodeHandle.web.js falls back to `componentOrHandle._scrollRef`
// without a null check. Calling it with a null ref (which happens on mount,
// during keystrokes before the ref is attached, and at unmount) throws
// "Cannot read properties of null (reading '_scrollRef')". Guard at the call
// site so we never hand it null.
const safeFindNodeHandle = (componentOrHandle) => {
  if (componentOrHandle == null) {
    return null;
  }
  return findNodeHandle(componentOrHandle);
};

const BottomSheetTextInputComponent = forwardRef(
  ({ onFocus, onBlur, ...rest }, providedRef) => {
    const ref = useRef(null);
    const { animatedKeyboardState, textInputNodesRef } =
      useBottomSheetInternal();

    const handleOnFocus = useCallback(
      (args) => {
        animatedKeyboardState.set((state) => ({
          ...state,
          target: args.nativeEvent.target,
        }));
        if (onFocus) {
          onFocus(args);
        }
      },
      [onFocus, animatedKeyboardState]
    );

    const handleOnBlur = useCallback(
      (args) => {
        const keyboardState = animatedKeyboardState.get();
        const currentFocusedInput = safeFindNodeHandle(
          getCurrentlyFocusedInput()
        );

        const shouldRemoveCurrentTarget =
          keyboardState.target === args.nativeEvent.target;
        const shouldIgnoreBlurEvent =
          currentFocusedInput &&
          textInputNodesRef.current.has(currentFocusedInput);
        if (shouldRemoveCurrentTarget && !shouldIgnoreBlurEvent) {
          animatedKeyboardState.set((state) => ({
            ...state,
            target: undefined,
          }));
        }
        if (onBlur) {
          onBlur(args);
        }
      },
      [onBlur, animatedKeyboardState, textInputNodesRef]
    );

    useEffect(() => {
      const componentNode = safeFindNodeHandle(ref.current);
      if (!componentNode) {
        return;
      }
      if (!textInputNodesRef.current.has(componentNode)) {
        textInputNodesRef.current.add(componentNode);
      }
      return () => {
        const node = safeFindNodeHandle(ref.current);
        if (!node) {
          return;
        }
        const keyboardState = animatedKeyboardState.get();
        if (keyboardState.target === node) {
          animatedKeyboardState.set((state) => ({
            ...state,
            target: undefined,
          }));
        }
        if (textInputNodesRef.current.has(node)) {
          textInputNodesRef.current.delete(node);
        }
      };
    }, [textInputNodesRef, animatedKeyboardState]);

    useImperativeHandle(providedRef, () => ref.current ?? undefined, []);

    return _jsx(TextInput, {
      ref,
      onFocus: handleOnFocus,
      onBlur: handleOnBlur,
      ...rest,
    });
  }
);

const BottomSheetTextInput = memo(BottomSheetTextInputComponent);
BottomSheetTextInput.displayName = "BottomSheetTextInput";
export default BottomSheetTextInput;
