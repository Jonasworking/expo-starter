import type { Icon, MoniconConfig } from "@monicon/core";
import {
  clean,
  type GenericPluginOptions,
  generic,
  type MoniconPlugin,
} from "@monicon/core/plugins";
import { pascalCase } from "change-case-all";
import { Eta } from "eta";

const STARTS_WITH_DIGIT = /^\d/;

const template = `import { UniwindSvgXml, type UniwindSvgXmlProps } from "@/components/ui/uniwind-svg-xml";

export const <%= it.name %> = (props: Omit<UniwindSvgXmlProps, "xml">) => {
  const xml = \`<%= it.code %>\`;

  return <UniwindSvgXml xml={xml} {...props} />;
};
`;

const parseIcon = (icon: string) => {
  const parts = icon.split(":");

  if (parts.length !== 2) {
    throw new Error(
      `Invalid icon format: ${icon}. Expected format: "prefix:name"`
    );
  }

  const [prefix, name] = parts;

  return { prefix, name };
};

interface ComponentNameOptions {
  prefix?: ((icon: Icon) => string | undefined) | string;
  suffix?: ((icon: Icon) => string | undefined) | string;
  componentName?: (icon: Icon) => string | undefined;
}

const getComponentName = (icon: Icon, options: ComponentNameOptions) => {
  const parsedIcon = parseIcon(icon.name);
  const componentName = pascalCase(parsedIcon.name);

  const prefix =
    typeof options?.prefix === "function"
      ? options.prefix(icon)
      : (options?.prefix ?? "");

  const suffix =
    typeof options?.suffix === "function"
      ? options.suffix(icon)
      : (options?.suffix ?? "");

  return `${prefix}${componentName}${suffix}`;
};

type ReactNativePluginOptionsInternal = ComponentNameOptions;

type ReactNativePluginOptions =
  GenericPluginOptions<ReactNativePluginOptionsInternal>;

const reactNative: MoniconPlugin<ReactNativePluginOptions> = (_options) =>
  generic({
    name: "react-native-plugin",
    extension: "tsx",
    content: (icon) => {
      const options: ReactNativePluginOptions = {
        prefix: (icon) => {
          const { name } = parseIcon(icon.name);
          return STARTS_WITH_DIGIT.test(pascalCase(name)) ? "N" : "";
        },
        suffix: "Icon",
        ..._options,
      };

      const eta = new Eta({ autoEscape: false });

      const componentName = getComponentName(icon, options);

      const fileContent = eta.renderString(template, {
        name: componentName,
        code: icon.svg,
        format: "tsx",
        height: icon.height,
        width: icon.width,
      });

      return fileContent;
    },
    ..._options,
  });

export default {
  icons: ["solar:bolt-bold"],
  // Loads all icons from a single collection
  collections: [],
  plugins: [
    /**
     * change the output path to your project config for example;
     * - components/icons
     * - src/components/icons
     */
    clean({ patterns: ["components/icons"] }),
    reactNative({ outputPath: "components/icons" }),
  ],
} satisfies MoniconConfig;
