// Empty export makes this a module, enabling augmentation instead of replacement
export {};

// Module augmentation to add className support to React Native components (provided by Uniwind)
declare module "react-native" {
  interface ViewProps {
    className?: string;
  }
  interface TextProps {
    className?: string;
    selectionColorClassName?: string;
  }
  interface PressableProps {
    className?: string;
  }
  interface TextInputProps {
    className?: string;
    cursorColorClassName?: string;
    underlineColorAndroidClassName?: string;
    placeholderTextColorClassName?: string;
    selectionColorClassName?: string;
  }
  interface ImagePropsBase {
    className?: string;
  }
  interface ScrollViewProps {
    contentContainerClassName?: string;
  }
  interface TouchableWithoutFeedbackProps {
    className?: string;
  }
}
